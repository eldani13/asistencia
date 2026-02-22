"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminView } from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminsCard } from "@/components/admin/AdminsCard";
import { AsistenciasSection } from "@/components/admin/AsistenciasSection";
import { DashboardSection } from "@/components/admin/DashboardSection";
import { ProfesoresCard } from "@/components/admin/ProfesoresCard";
import { ProfesoresListSection } from "@/components/admin/ProfesoresListSection";
import { RegistrarRostroCard } from "@/components/admin/RegistrarRostroCard";
import { ReportesSection } from "@/components/admin/ReportesSection";
import { useAuth } from "@/components/AuthProvider";
import { createAdminUser } from "@/lib/auth";
import {
  formatDateKey,
  subscribeAsistenciasByDate,
  subscribeAsistenciasByRange,
  updateAsistenciaTimes,
} from "@/lib/asistencia";
import {
  createProfesor,
  saveFaceDescriptor,
  subscribeProfesores,
  updateProfesor,
} from "@/lib/profesores";
import { distance, getDescriptorFromVideo, loadFaceModels } from "@/lib/face";
import type { Asistencia, Profesor } from "@/lib/types";
import Swal from "sweetalert2";

export default function AdminPage() {
  const { signOut, adminProfile } = useAuth();
  const profesoresPageSize = 6;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [profesoresPage, setProfesoresPage] = useState(1);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [reportAsistencias, setReportAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [jornada, setJornada] = useState<"mañana" | "tarde">("mañana");
  const [horaInicio, setHoraInicio] = useState("06:15");
  const [horaFin, setHoraFin] = useState("14:15");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [selectedProfesor, setSelectedProfesor] = useState<string>("");
  const [dateKey, setDateKey] = useState(formatDateKey(new Date()));
  const [reportRange, setReportRange] = useState<"dia" | "semana" | "mes">("dia");

  const faceVideoRef = useRef<HTMLVideoElement | null>(null);
  const faceStreamRef = useRef<MediaStream | null>(null);

  const showAlert = async (options: {
    icon: "success" | "error" | "warning" | "info" | "question";
    title: string;
    text?: string;
    confirmText?: string;
    showCancelButton?: boolean;
    cancelText?: string;
  }) =>
    Swal.fire({
      icon: options.icon,
      title: options.title,
      text: options.text,
      showCancelButton: options.showCancelButton ?? false,
      confirmButtonText: options.confirmText ?? "Aceptar",
      cancelButtonText: options.cancelText ?? "Cancelar",
      customClass: {
        confirmButton: "swal2-confirm-button",
        cancelButton: "swal2-cancel-button",
      },
      buttonsStyling: false,
    });

  const showToast = (options: {
    icon: "success" | "error" | "warning" | "info";
    title: string;
  }) =>
    Swal.fire({
      icon: options.icon,
      title: options.title,
      toast: true,
      position: "top",
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-popup",
      },
    });

  const reporteRows = useMemo(() => {
    const minutosPorProfesor = new Map<string, number>();
    reportAsistencias.forEach((asistencia) => {
      const prev = minutosPorProfesor.get(asistencia.profesorId) ?? 0;
      minutosPorProfesor.set(
        asistencia.profesorId,
        prev + (asistencia.minutosTrabajados ?? 0)
      );
    });

    return profesores
      .map((profesor) => {
        const minutos = minutosPorProfesor.get(profesor.id) ?? 0;
        return {
          profesor,
          minutos,
          horas: Math.round((minutos / 60) * 100) / 100,
        };
      })
      .sort((a, b) =>
        `${a.profesor.apellido} ${a.profesor.nombre}`.localeCompare(
          `${b.profesor.apellido} ${b.profesor.nombre}`
        )
      );
  }, [reportAsistencias, profesores]);

  const reportRangeLabel = useMemo(() => {
    if (reportRange === "semana") return "Semana";
    if (reportRange === "mes") return "Mes";
    return "Dia";
  }, [reportRange]);

  const dashboardStats = useMemo(() => {
    const totalProfesores = profesores.length;
    const activos = profesores.filter((profesor) => profesor.activo).length;
    const inactivos = totalProfesores - activos;
    const rostrosRegistrados = profesores.filter(
      (profesor) => (profesor.faceDescriptor?.length ?? 0) > 0
    ).length;
    const asistenciasHoy = asistencias.length;
    return {
      totalProfesores,
      activos,
      inactivos,
      rostrosRegistrados,
      asistenciasHoy,
    };
  }, [asistencias.length, profesores]);

  const profesoresPagination = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(profesores.length / profesoresPageSize));
    const safePage = Math.min(profesoresPage, totalPages);
    const start = (safePage - 1) * profesoresPageSize;
    const items = profesores.slice(start, start + profesoresPageSize);
    return { items, totalPages, page: safePage };
  }, [profesores, profesoresPage, profesoresPageSize]);

  useEffect(() => {
    if (profesoresPage !== profesoresPagination.page) {
      setProfesoresPage(profesoresPagination.page);
    }
  }, [profesoresPage, profesoresPagination.page]);

  const topProfesores = useMemo(() => {
    return [...reporteRows]
      .filter((row) => row.horas > 0)
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 5);
  }, [reporteRows]);

  const horasPorEntrada = useMemo(() => {
    const buckets = Array.from({ length: 12 }, () => 0);
    asistencias.forEach((asistencia) => {
      if (!asistencia.horaEntrada) return;
      const hour = Number(asistencia.horaEntrada.split(":")[0]);
      if (Number.isNaN(hour)) return;
      const index = Math.min(11, Math.max(0, hour - 6));
      buckets[index] += 1;
    });
    return buckets;
  }, [asistencias]);

  useEffect(() => {
    if (!adminProfile) return;
    setLoading(true);
    const baseDate = new Date(`${dateKey}T00:00:00`);
    const rangeDates = getReportRange(baseDate, reportRange);
    const loadState = { profesores: false, asistencias: false, reportes: false };
    const markLoaded = (key: keyof typeof loadState) => {
      loadState[key] = true;
      if (loadState.profesores && loadState.asistencias && loadState.reportes) {
        setLoading(false);
      }
    };

    const unsubscribeProfesores = subscribeProfesores((items) => {
      setProfesores(items);
      markLoaded("profesores");
    });
    const unsubscribeAsistencias = subscribeAsistenciasByDate(dateKey, (items) => {
      setAsistencias(items);
      markLoaded("asistencias");
    });
    const unsubscribeReportes = subscribeAsistenciasByRange(
      {
        startDate: formatDateKey(rangeDates.start),
        endDate: formatDateKey(rangeDates.end),
      },
      (items) => {
        setReportAsistencias(items);
        markLoaded("reportes");
      }
    );

    return () => {
      unsubscribeProfesores();
      unsubscribeAsistencias();
      unsubscribeReportes();
    };
  }, [adminProfile, dateKey, reportRange]);

  useEffect(() => {
    return () => {
      stopFaceCamera();
    };
  }, []);

  function getReportRange(baseDate: Date, range: "dia" | "semana" | "mes") {
    const normalized = new Date(baseDate);
    if (range === "dia") {
      return { start: normalized, end: normalized };
    }

    if (range === "semana") {
      const day = normalized.getDay();
      const diffToMonday = (day + 6) % 7;
      const start = new Date(normalized);
      start.setDate(normalized.getDate() - diffToMonday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }

    const start = new Date(normalized.getFullYear(), normalized.getMonth(), 1);
    const end = new Date(normalized.getFullYear(), normalized.getMonth() + 1, 0);
    return { start, end };
  }

  const handleCreateProfesor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return;
    try {
      await createProfesor(nombre.trim(), apellido.trim(), jornada, horaInicio, horaFin);
      setNombre("");
      setApellido("");
      await showAlert({
        icon: "success",
        title: "Profesor creado",
        text: "El profesor ya esta disponible para registrar rostro.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear";
      await showAlert({ icon: "error", title: "Error al crear profesor", text: message });
    }
  };

  const handleToggleProfesor = async (profesor: Profesor) => {
    const action = profesor.activo ? "Desactivar" : "Activar";
    const result = await showAlert({
      icon: "question",
      title: `${action} profesor?`,
      text: `${profesor.nombre} ${profesor.apellido}`,
      showCancelButton: true,
      confirmText: action,
    });

    if (!result.isConfirmed) return;

    await updateProfesor(profesor.id, { activo: !profesor.activo });
    await showToast({
      icon: "success",
      title: `${action}do correctamente`,
    });
  };

  const handleCreateAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createAdminUser(adminEmail.trim(), adminPassword);
      await showAlert({
        icon: "success",
        title: "Admin creado",
        text: "La cuenta admin ya puede ingresar.",
      });
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear";
      await showAlert({ icon: "error", title: "Error al crear admin", text: message });
    }
  };

  const startFaceCamera = async () => {
    if (!faceVideoRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camara no disponible. Usa HTTPS o un navegador compatible.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    faceStreamRef.current = stream;
    faceVideoRef.current.srcObject = stream;
    await faceVideoRef.current.play();
  };

  const stopFaceCamera = () => {
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach((track) => track.stop());
      faceStreamRef.current = null;
    }
  };

  const handleCaptureFace = async () => {
    if (!faceVideoRef.current || !selectedProfesor) return;
    Swal.fire({
      title: "Capturando rostro",
      text: "Mira al frente y mantente quieto.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: "swal2-popup",
      },
    });

    try {
      await loadFaceModels();
      await startFaceCamera();

      await new Promise((resolve) => setTimeout(resolve, 600));

      let descriptor: Float32Array | null = null;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        descriptor = await getDescriptorFromVideo(faceVideoRef.current);
        if (descriptor) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      if (!descriptor) {
        Swal.close();
        await showAlert({
          icon: "warning",
          title: "Rostro no detectado",
          text: "Asegurate de tener buena luz y mirar al frente.",
        });
        return;
      }

      const descriptorArray = Array.from(descriptor);
      const duplicate = profesores.find((profesor) => {
        if (!profesor.faceDescriptor) return false;
        return distance(descriptorArray, profesor.faceDescriptor) < 0.5;
      });

      if (duplicate) {
        Swal.close();
        await showAlert({
          icon: "error",
          title: "Este rostro ya esta registrado",
          text: "No se puede guardar un rostro duplicado.",
        });
        return;
      }

      await saveFaceDescriptor(selectedProfesor, descriptorArray);
      Swal.close();
      await showAlert({ icon: "success", title: "Rostro guardado" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo capturar";
      Swal.close();
      await showAlert({ icon: "error", title: "Error de camara", text: message });
    } finally {
      stopFaceCamera();
    }
  };

  const handleUpdateAsistencia = async (
    asistenciaId: string,
    entrada: string,
    salida: string
  ) => {
    await updateAsistenciaTimes(asistenciaId, entrada || null, salida || null);
    await showToast({ icon: "success", title: "Asistencia actualizada" });
  };

  return (
    <AdminGuard>
      <div className="min-h-screen">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menu"
          />
        ) : null}
        <AdminSidebar
          adminEmail={adminProfile?.email}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          activeView={activeView}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onChangeView={setActiveView}
          onSignOut={signOut}
        />

        <main
          className={`mx-auto flex min-h-screen max-w-6xl flex-1 flex-col gap-10 px-6 py-8 lg:pr-6 lg:py-12 ${
            sidebarCollapsed ? "lg:pl-28" : "lg:pl-72"
          }`}
        >
          <AdminHeader
            email={adminProfile?.email}
            onSignOut={signOut}
            showMenuButton
            onMenuClick={() => setSidebarOpen(true)}
            showSignOut={false}
          />

          {activeView === "dashboard" ? (
            <DashboardSection
              dashboardStats={dashboardStats}
              reportRangeLabel={reportRangeLabel}
              reporteRowsCount={reporteRows.length}
              topProfesores={topProfesores}
              horasPorEntrada={horasPorEntrada}
            />
          ) : null}

          {activeView === "registrar-profesor" ? (
            <ProfesoresCard
              profesores={profesores}
              nombre={nombre}
              apellido={apellido}
              jornada={jornada}
              horaInicio={horaInicio}
              horaFin={horaFin}
              onNombreChange={setNombre}
              onApellidoChange={setApellido}
              onJornadaChange={(value) => {
                setJornada(value);
                if (value === "mañana") {
                  setHoraInicio("06:15");
                  setHoraFin("14:15");
                } else {
                  setHoraInicio("10:00");
                  setHoraFin("18:00");
                }
              }}
              onHoraInicioChange={setHoraInicio}
              onHoraFinChange={setHoraFin}
              onSubmit={handleCreateProfesor}
              onToggleProfesor={handleToggleProfesor}
            />
          ) : null}

          {activeView === "lista-profesores" ? (
            <ProfesoresListSection
              totalProfesores={profesores.length}
              pagination={profesoresPagination}
              onToggleProfesor={handleToggleProfesor}
              onPrevPage={() => setProfesoresPage((prev) => Math.max(1, prev - 1))}
              onNextPage={() =>
                setProfesoresPage((prev) =>
                  Math.min(profesoresPagination.totalPages, prev + 1)
                )
              }
            />
          ) : null}

          {activeView === "registrar-rostros" ? (
            <RegistrarRostroCard
              profesores={profesores}
              selectedProfesor={selectedProfesor}
              faceVideoRef={faceVideoRef}
              onSelectedProfesorChange={setSelectedProfesor}
              onCaptureFace={handleCaptureFace}
            />
          ) : null}

          {activeView === "crear-admin" ? (
            <AdminsCard
              adminEmail={adminEmail}
              adminPassword={adminPassword}
              onAdminEmailChange={setAdminEmail}
              onAdminPasswordChange={setAdminPassword}
              onSubmit={handleCreateAdmin}
            />
          ) : null}

          {activeView === "asistencias" ? (
            <AsistenciasSection
              asistencias={asistencias}
              profesores={profesores}
              loading={loading}
              dateKey={dateKey}
              onDateChange={setDateKey}
              onUpdateAsistencia={handleUpdateAsistencia}
              onAsistenciasChange={setAsistencias}
            />
          ) : null}

          {activeView === "reportes" ? (
            <ReportesSection
              loading={loading}
              profesores={profesores}
              reporteRows={reporteRows}
              reportAsistencias={reportAsistencias}
              dateKey={dateKey}
              reportRange={reportRange}
              reportRangeLabel={reportRangeLabel}
              onReportRangeChange={setReportRange}
            />
          ) : null}
        </main>
      </div>
    </AdminGuard>
  );
}

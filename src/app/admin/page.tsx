"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminsCard } from "@/components/admin/AdminsCard";
import { AsistenciasSection } from "@/components/admin/AsistenciasSection";
import { ProfesoresCard } from "@/components/admin/ProfesoresCard";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "registrar-profesor"
    | "lista-profesores"
    | "registrar-rostros"
    | "crear-admin"
    | "asistencias"
    | "reportes"
  >("dashboard");
  const [profesores, setProfesores] = useState<Profesor[]>([]);
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
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex h-screen -translate-x-full flex-col border-r border-white/10 bg-slate-950/90 p-6 shadow-2xl transition-transform lg:translate-x-0 ${
            sidebarCollapsed ? "w-64 lg:w-20" : "w-64"
          } ${sidebarOpen ? "translate-x-0" : ""}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-amber-300">
                AD
              </div>
              <div className={sidebarCollapsed ? "lg:hidden" : ""}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Admin
                </p>
                <p className="text-xs text-slate-300">{adminProfile?.email}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/20 p-2 text-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menu"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6l-12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 hidden items-center gap-2 lg:flex">
            <button
              type="button"
              className="rounded-full border border-white/20 p-2 text-slate-100"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? "Expandir barra" : "Colapsar barra"}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {sidebarCollapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
              </svg>
            </button>
            <span className={`text-xs text-slate-400 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
              {sidebarCollapsed ? "" : "Barra"}
            </span>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-6 text-sm text-slate-200">
            <div className="space-y-2">
              <p className={`text-[11px] uppercase tracking-[0.4em] text-slate-500 ${
                sidebarCollapsed ? "lg:hidden" : ""
              }`}>
                General
              </p>
              {[{ id: "dashboard", label: "Dashboard" }].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id as "dashboard");
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left transition hover:border-white/30 hover:bg-white/5 lg:justify-start ${
                    activeView === item.id
                      ? "border-amber-300/60 bg-amber-300/10 text-amber-200"
                      : "border-white/10"
                  } ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0 lg:border-transparent lg:bg-transparent" : ""}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 ${
                    activeView === item.id ? "border-amber-300/40 bg-amber-300/10" : ""
                  }`}>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 13h8V3H3v10z" />
                      <path d="M13 21h8v-6h-8v6z" />
                      <path d="M13 3h8v8h-8z" />
                      <path d="M3 21h8v-4H3v4z" />
                    </svg>
                  </span>
                  <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className={`text-[11px] uppercase tracking-[0.4em] text-slate-500 ${
                sidebarCollapsed ? "lg:hidden" : ""
              }`}>
                Profesores
              </p>
              {
                [
                  { id: "registrar-profesor", label: "Registrar profesor" },
                  { id: "lista-profesores", label: "Lista de profesores" },
                  { id: "registrar-rostros", label: "Registrar rostros" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveView(
                        item.id as
                          | "registrar-profesor"
                          | "lista-profesores"
                          | "registrar-rostros"
                      );
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left transition hover:border-white/30 hover:bg-white/5 lg:justify-start ${
                      activeView === item.id
                        ? "border-amber-300/60 bg-amber-300/10 text-amber-200"
                        : "border-white/10"
                    } ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0 lg:border-transparent lg:bg-transparent" : ""}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 ${
                      activeView === item.id ? "border-amber-300/40 bg-amber-300/10" : ""
                    }`}>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </button>
                ))
              }
            </div>

            <div className="space-y-2">
              <p className={`text-[11px] uppercase tracking-[0.4em] text-slate-500 ${
                sidebarCollapsed ? "lg:hidden" : ""
              }`}>
                Operacion
              </p>
              {
                [
                  { id: "crear-admin", label: "Crear usuario admin" },
                  { id: "asistencias", label: "Asistencias" },
                  { id: "reportes", label: "Reportes" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveView(
                        item.id as "crear-admin" | "asistencias" | "reportes"
                      );
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left transition hover:border-white/30 hover:bg-white/5 lg:justify-start ${
                      activeView === item.id
                        ? "border-amber-300/60 bg-amber-300/10 text-amber-200"
                        : "border-white/10"
                    } ${sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0 lg:border-transparent lg:bg-transparent" : ""}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 ${
                      activeView === item.id ? "border-amber-300/40 bg-amber-300/10" : ""
                    }`}>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16v6H4z" />
                        <path d="M4 14h16v6H4z" />
                        <path d="M8 8h8" />
                        <path d="M8 18h8" />
                      </svg>
                    </span>
                    <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </button>
                ))
              }
            </div>
          </nav>

          <div className="mt-auto pt-6">
            <button
              className={`w-full rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300/60 hover:text-amber-200 hover:bg-amber-300/10 ${
                sidebarCollapsed ? "lg:px-0 lg:py-3" : ""
              }`}
              onClick={signOut}
            >
              <span className={sidebarCollapsed ? "lg:hidden" : ""}>Cerrar sesion</span>
              <span className={`hidden ${sidebarCollapsed ? "lg:inline" : ""}`}>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v10" />
                  <path d="M6.38 6.38a8 8 0 1 0 11.24 0" />
                </svg>
              </span>
            </button>
          </div>
        </aside>

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
            <section className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Profesores",
                    value: dashboardStats.totalProfesores,
                  },
                  {
                    label: "Activos",
                    value: dashboardStats.activos,
                  },
                  {
                    label: "Inactivos",
                    value: dashboardStats.inactivos,
                  },
                  {
                    label: "Rostros registrados",
                    value: dashboardStats.rostrosRegistrados,
                  },
                  {
                    label: "Asistencias hoy",
                    value: dashboardStats.asistenciasHoy,
                  },
                  {
                    label: `Reportes ${reportRangeLabel.toLowerCase()}`,
                    value: reporteRows.length,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-amber-300">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-100">
                      Top profesores
                    </h2>
                    <span className="text-xs text-slate-400">{reportRangeLabel}</span>
                  </div>
                  {topProfesores.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-400">
                      Sin horas registradas en este rango.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {topProfesores.map((row) => (
                        <div key={row.profesor.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-slate-300">
                            <span>
                              {row.profesor.nombre} {row.profesor.apellido}
                            </span>
                            <span className="text-amber-300">
                              {row.horas.toFixed(2)}h
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/10">
                            <div
                              className="h-2 rounded-full bg-amber-300"
                              style={{
                                width: `${Math.min(100, (row.horas / topProfesores[0].horas) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-100">
                      Entradas por hora
                    </h2>
                    <span className="text-xs text-slate-400">Hoy</span>
                  </div>
                  <div className="mt-6 grid grid-cols-12 items-end gap-2">
                    {horasPorEntrada.map((value, index) => (
                      <div key={`hora-${index}`} className="flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-full bg-amber-300/80"
                          style={{ height: `${Math.max(6, value * 8)}px` }}
                          title={`${value} entradas`}
                        />
                        <span className="text-[10px] text-slate-400">
                          {String(index + 6).padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
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
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-100">Lista de profesores</h2>
              <p className="mt-2 text-sm text-slate-400">Total: {profesores.length}</p>
              <div className="mt-6 space-y-3">
                {profesores.map((profesor) => (
                  <div
                    key={profesor.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {profesor.nombre} {profesor.apellido}
                      </p>
                      <p className="text-xs text-slate-400">
                        {profesor.activo ? "Activo" : "Inactivo"} · {profesor.jornada}
                      </p>
                    </div>
                    <button
                      className="text-xs text-amber-300"
                      onClick={() => handleToggleProfesor(profesor)}
                    >
                      {profesor.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
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

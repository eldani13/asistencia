"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { StatusBanner } from "@/components/StatusBanner";
import { useAuth } from "@/components/AuthProvider";
import { createAdminUser } from "@/lib/auth";
import { formatDateKey, listAsistenciasByDate, updateAsistenciaTimes } from "@/lib/asistencia";
import { createProfesor, listProfesores, saveFaceDescriptor, updateProfesor } from "@/lib/profesores";
import { getDescriptorFromVideo, loadFaceModels } from "@/lib/face";
import type { Asistencia, Profesor } from "@/lib/types";

export default function AdminPage() {
  const { signOut, adminProfile } = useAuth();
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{
    tone: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [selectedProfesor, setSelectedProfesor] = useState<string>("");
  const [dateKey, setDateKey] = useState(formatDateKey(new Date()));

  const faceVideoRef = useRef<HTMLVideoElement | null>(null);
  const faceStreamRef = useRef<MediaStream | null>(null);

  const profesorMap = useMemo(() => {
    const map = new Map<string, Profesor>();
    profesores.forEach((profesor) => map.set(profesor.id, profesor));
    return map;
  }, [profesores]);

  useEffect(() => {
    if (!adminProfile) return;
    refreshAll();
  }, [adminProfile, dateKey]);

  useEffect(() => {
    return () => {
      stopFaceCamera();
    };
  }, []);

  const refreshAll = async () => {
    setLoading(true);
    const [profesorList, asistenciaList] = await Promise.all([
      listProfesores(),
      listAsistenciasByDate(dateKey),
    ]);
    setProfesores(profesorList);
    setAsistencias(asistenciaList);
    setLoading(false);
  };

  const handleCreateProfesor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return;
    await createProfesor(nombre.trim(), apellido.trim());
    setNombre("");
    setApellido("");
    await refreshAll();
  };

  const handleToggleProfesor = async (profesor: Profesor) => {
    await updateProfesor(profesor.id, { activo: !profesor.activo });
    await refreshAll();
  };

  const handleCreateAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBanner(null);

    try {
      await createAdminUser(adminEmail.trim(), adminPassword);
      setBanner({
        tone: "success",
        title: "Admin creado",
        message: "La cuenta admin ya puede ingresar.",
      });
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear";
      setBanner({ tone: "error", title: "Error al crear admin", message });
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
    setBanner(null);

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
        setBanner({
          tone: "warning",
          title: "Rostro no detectado",
          message: "Asegurate de tener buena luz y mirar al frente.",
        });
        return;
      }

      await saveFaceDescriptor(selectedProfesor, Array.from(descriptor));
      setBanner({ tone: "success", title: "Rostro guardado" });
      await refreshAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo capturar";
      setBanner({ tone: "error", title: "Error de camara", message });
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
    await refreshAll();
  };

  return (
    <AdminGuard>
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Panel admin
            </p>
            <h1 className="text-4xl font-semibold text-slate-100">
              Gestion de asistencia
            </h1>
            <p className="text-sm text-slate-300">{adminProfile?.email}</p>
          </div>
          <button
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-slate-100"
            onClick={signOut}
          >
            Cerrar sesion
          </button>
        </header>

        {banner ? <StatusBanner {...banner} /> : null}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100">Profesores</h2>
            <p className="mt-2 text-sm text-slate-400">
              Total: {profesores.length}
            </p>
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleCreateProfesor}>
              <input
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
                placeholder="Nombre"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                required
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
                placeholder="Apellido"
                value={apellido}
                onChange={(event) => setApellido(event.target.value)}
                required
              />
              <button
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
                type="submit"
              >
                Crear profesor
              </button>
            </form>
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
                      {profesor.activo ? "Activo" : "Inactivo"}
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

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100">Registrar rostro</h2>
            <p className="mt-2 text-sm text-slate-400">
              Selecciona un profesor y captura su rostro.
            </p>
            <select
              className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              value={selectedProfesor}
              onChange={(event) => setSelectedProfesor(event.target.value)}
            >
              <option value="">Seleccionar profesor</option>
              {profesores.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre} {profesor.apellido}
                </option>
              ))}
            </select>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/40 p-3">
              <video
                ref={faceVideoRef}
                className="h-40 w-full rounded-xl object-cover"
                playsInline
                muted
              />
            </div>
            <button
              className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
              onClick={handleCaptureFace}
              disabled={!selectedProfesor}
            >
              Capturar y guardar
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100">Admins</h2>
            <p className="mt-2 text-sm text-slate-400">
              Crea accesos adicionales para el panel.
            </p>
            <form className="mt-4 flex flex-col gap-3" onSubmit={handleCreateAdmin}>
              <input
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
                placeholder="Email"
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                required
              />
              <input
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
                placeholder="Contrasena"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                required
              />
              <button
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
                type="submit"
              >
                Crear admin
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Asistencias</h2>
              <p className="mt-1 text-sm text-slate-400">
                Correcciones permitidas solo aqui.
              </p>
            </div>
            <input
              className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              type="date"
              value={dateKey}
              onChange={(event) => setDateKey(event.target.value)}
            />
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-400">Cargando...</p>
          ) : (
            <div className="mt-6 space-y-4">
              {asistencias.length === 0 ? (
                <p className="text-sm text-slate-400">Sin registros.</p>
              ) : (
                asistencias.map((asistencia) => {
                  const profesor = profesorMap.get(asistencia.profesorId);
                  return (
                    <div
                      key={asistencia.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {profesor
                              ? `${profesor.nombre} ${profesor.apellido}`
                              : asistencia.profesorId}
                          </p>
                          <p className="text-xs text-slate-400">{asistencia.fecha}</p>
                        </div>
                        <button
                          className="text-xs text-amber-300"
                          onClick={() =>
                            handleUpdateAsistencia(
                              asistencia.id,
                              asistencia.horaEntrada ?? "",
                              asistencia.horaSalida ?? ""
                            )
                          }
                        >
                          Guardar
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="flex flex-col gap-2 text-xs text-slate-400">
                          Hora entrada
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                            value={asistencia.horaEntrada ?? ""}
                            onChange={(event) =>
                              setAsistencias((prev) =>
                                prev.map((item) =>
                                  item.id === asistencia.id
                                    ? { ...item, horaEntrada: event.target.value }
                                    : item
                                )
                              )
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-xs text-slate-400">
                          Hora salida
                          <input
                            className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                            value={asistencia.horaSalida ?? ""}
                            onChange={(event) =>
                              setAsistencias((prev) =>
                                prev.map((item) =>
                                  item.id === asistencia.id
                                    ? { ...item, horaSalida: event.target.value }
                                    : item
                                )
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        <footer className="flex items-center justify-between text-xs text-slate-400">
          <Link href="/">Inicio</Link>
          <Link href="/scan">Ir a scan</Link>
        </footer>
      </main>
    </AdminGuard>
  );
}

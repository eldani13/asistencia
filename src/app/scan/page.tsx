"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { registerAsistencia } from "@/lib/asistencia";
import { subscribeProfesoresActivos } from "@/lib/profesores";
import type { Profesor } from "@/lib/types";
import { distance, getDescriptorFromVideo, loadFaceModels } from "@/lib/face";
import Swal from "sweetalert2";

const MATCH_THRESHOLD = 0.45;
const SCAN_TIMEOUT_MS = 20000;

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanStartedAtRef = useRef<number | null>(null);
  const scanAttemptsRef = useRef(0);
  const registeringRef = useRef(false);
  const lastMatchRef = useRef<string | null>(null);
  const matchStreakRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [profesoresActivos, setProfesoresActivos] = useState<Profesor[]>([]);
  const [profesoresReady, setProfesoresReady] = useState(false);
  const [profesoresError, setProfesoresError] = useState<string | null>(null);

  const showAlert = async (options: {
    icon: "success" | "error" | "warning" | "info" | "question";
    title: string;
    text?: string;
    confirmText?: string;
  }) =>
    Swal.fire({
      icon: options.icon,
      title: options.title,
      text: options.text,
      confirmButtonText: options.confirmText ?? "Aceptar",
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
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-popup",
      },
    });

  useEffect(() => {
    const unsubscribe = subscribeProfesoresActivos(
      (items) => {
        setProfesoresActivos(items);
        setProfesoresReady(true);
        setProfesoresError(null);
      },
      () => {
        setProfesoresReady(true);
        setProfesoresError("No se pudieron cargar los profesores activos.");
      }
    );
    return () => {
      unsubscribe();
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camara no disponible. Usa HTTPS o un navegador compatible.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    if (videoRef.current.readyState < 2) {
      await new Promise<void>((resolve) => {
        const handleReady = () => {
          videoRef.current?.removeEventListener("loadedmetadata", handleReady);
          resolve();
        };
        videoRef.current?.addEventListener("loadedmetadata", handleReady);
      });
    }
  };

  const stopCamera = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    scanStartedAtRef.current = null;
    scanAttemptsRef.current = 0;
    registeringRef.current = false;
    matchStreakRef.current = 0;
    setLoading(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const pickBestProfesor = (
    descriptor: Float32Array,
    profesores: Profesor[]
  ): { profesor: Profesor | null; distance: number; match: boolean } => {
    let bestProfesor: Profesor | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    profesores.forEach((profesor) => {
      if (!profesor.faceDescriptor) return;
      const current = distance(Array.from(descriptor), profesor.faceDescriptor);
      if (current < bestDistance) {
        bestDistance = current;
        bestProfesor = profesor;
      }
    });

    return {
      profesor: bestProfesor,
      distance: bestDistance,
      match: bestDistance <= MATCH_THRESHOLD,
    };
  };

  const handleScan = async () => {
    if (!videoRef.current) return;
    setLoading(true);
    lastMatchRef.current = null;
    registeringRef.current = false;
    matchStreakRef.current = 0;

    try {
      if (profesoresError) {
        await showAlert({
          icon: "error",
          title: "No se pudo cargar profesores",
          text: profesoresError,
        });
        setLoading(false);
        return;
      }

      if (!profesoresReady) {
        await showAlert({
          icon: "info",
          title: "Cargando profesores",
          text: "Espera un momento y vuelve a intentar.",
        });
        setLoading(false);
        return;
      }

      await loadFaceModels();
      await startCamera();

      const activos = profesoresActivos.filter((profesor) => profesor.faceDescriptor?.length);

      if (activos.length === 0) {
        await showAlert({
          icon: "warning",
          title: "Sin rostros registrados",
          text: "Pide al admin que registre los rostros primero.",
        });
        stopCamera();
        return;
      }

      scanStartedAtRef.current = Date.now();
      scanAttemptsRef.current = 0;

      timeoutRef.current = setTimeout(async () => {
        await showAlert({
          icon: "warning",
          title: "No se pudo validar",
          text: "Intenta acercarte a la camara, mejorar la luz y mantenerte quieto.",
        });
        stopCamera();
      }, SCAN_TIMEOUT_MS);

      intervalRef.current = setInterval(async () => {
        try {
          if (!videoRef.current) return;
          if (registeringRef.current) return;

          const descriptor = await getDescriptorFromVideo(videoRef.current);
          if (!descriptor) {
            scanAttemptsRef.current += 1;
            if (scanAttemptsRef.current % 4 === 0) {
              showToast({
                icon: "info",
                title: "Buscando rostro...",
              });
            }
            return;
          }

          const result = pickBestProfesor(descriptor, activos);
          if (!result.match || !result.profesor) {
            matchStreakRef.current = 0;
            return;
          }

          if (lastMatchRef.current === result.profesor.id) {
            matchStreakRef.current += 1;
          } else {
            lastMatchRef.current = result.profesor.id;
            matchStreakRef.current = 1;
          }

          if (matchStreakRef.current < 2) return;

          registeringRef.current = true;
          intervalRef.current && clearInterval(intervalRef.current);
          intervalRef.current = null;

          const response = await registerAsistencia(result.profesor.id);
          if (response.status === "entrada") {
            await showAlert({
              icon: "success",
              title: "Entrada registrada",
              text: `${result.profesor.nombre} ${result.profesor.apellido}`,
            });
          } else if (response.status === "salida") {
            await showAlert({
              icon: "success",
              title: "Salida registrada",
              text: `${result.profesor.nombre} ${result.profesor.apellido}`,
            });
          } else {
            await showAlert({
              icon: "warning",
              title: "Registro bloqueado",
              text: response.message ?? "No se puede registrar otro ciclo hoy.",
            });
          }

          stopCamera();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error al detectar";
          await showAlert({
            icon: "error",
            title: "Error en escaneo",
            text: message,
          });
          stopCamera();
        }
      }, 400);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Camara no disponible";
      await showAlert({
        icon: "error",
        title: "No se pudo iniciar",
        text: message,
      });
      stopCamera();
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-14 text-slate-100">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
            Scan facial
          </p>
          <h1 className="text-4xl font-semibold text-slate-100 [font-family:'Space_Grotesk',ui-sans-serif]">
            Verificacion rapida de asistencia
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Colocate frente a la camara, mantente quieto y espera la confirmacion.
            El sistema valida tu rostro automaticamente.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300">
                  Camara {loading ? "activa" : "lista"}
                </span>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {profesoresReady ? "Profesores listos" : "Cargando profesores"}
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
              <video
                ref={videoRef}
                className="h-[360px] w-full object-cover -scale-x-100 sm:h-[420px]"
                playsInline
                muted
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span>Iluminacion recomendada: media/alta</span>
              <span>Distancia ideal: 30-60 cm</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Estado</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Escaneo</span>
                  <span className="font-semibold text-amber-300">
                    {loading ? "En curso" : "En espera"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Reconocimiento</span>
                  <span className="font-semibold text-slate-100">Auto</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Tiempo limite</span>
                  <span className="font-semibold text-slate-100">20s</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pasos</p>
              <ol className="mt-4 space-y-3 text-sm text-slate-300">
                <li>1. Mira directo a la camara.</li>
                <li>2. Quita gorras o lentes oscuros.</li>
                <li>3. Espera la confirmacion.</li>
              </ol>
            </div>

            <button
              className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
              onClick={handleScan}
              disabled={loading}
            >
              {loading ? "Escaneando..." : "Iniciar escaneo"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { registerAsistencia } from "@/lib/asistencia";
import { subscribeProfesoresActivos } from "@/lib/profesores";
import type { Profesor } from "@/lib/types";
import { distance, getDescriptorFromVideo, loadFaceModels } from "@/lib/face";
import Swal from "sweetalert2";

const MATCH_THRESHOLD = 0.45;

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanStartedAtRef = useRef<number | null>(null);
  const scanAttemptsRef = useRef(0);
  const registeringRef = useRef(false);
  const lastMatchRef = useRef<string | null>(null);
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
  };

  const stopCamera = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
    scanStartedAtRef.current = null;
    scanAttemptsRef.current = 0;
    registeringRef.current = false;
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

    try {
      if (profesoresError) {
        await showAlert({
          icon: "error",
          title: "No se pudo cargar profesores",
          text: profesoresError,
        });
        return;
      }

      if (!profesoresReady) {
        await showAlert({
          icon: "info",
          title: "Cargando profesores",
          text: "Espera un momento y vuelve a intentar.",
        });
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

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        if (registeringRef.current) return;
        if (scanStartedAtRef.current && Date.now() - scanStartedAtRef.current > 12000) {
          await showAlert({
            icon: "warning",
            title: "No se detecto rostro",
            text: "Intenta acercarte a la camara y mejorar la luz.",
          });
          stopCamera();
          return;
        }

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
          await showAlert({
            icon: "error",
            title: "Profesor no registrado",
            text: "Este rostro no existe en el sistema.",
          });
          stopCamera();
          return;
        }

        if (lastMatchRef.current === result.profesor.id) return;
        lastMatchRef.current = result.profesor.id;

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
      }, 400);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Camara no disponible";
      await showAlert({
        icon: "error",
        title: "No se pudo iniciar",
        text: message,
      });
      stopCamera();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Scan QR
        </p>
        <h1 className="text-4xl font-semibold text-slate-100">Verificacion facial</h1>
        <p className="text-slate-300">
          Enfoca tu rostro y espera la confirmacion automatica.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-xl">
          <video
            ref={videoRef}
            className="h-90 w-full rounded-2xl object-cover"
            playsInline
            muted
          />
        </div>

        <div className="flex flex-col gap-4">
          <button
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar escaneo"}
          </button>
          <Link className="text-sm text-slate-300" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

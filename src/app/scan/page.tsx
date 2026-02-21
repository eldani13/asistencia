"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { listProfesoresActivos, registerAsistencia } from "@/lib/asistencia";
import type { Profesor } from "@/lib/types";
import { distance, getDescriptorFromVideo, loadFaceModels } from "@/lib/face";
import { StatusBanner } from "@/components/StatusBanner";

const MATCH_THRESHOLD = 0.45;

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanStartedAtRef = useRef<number | null>(null);
  const scanAttemptsRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{
    tone: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const [lastMatch, setLastMatch] = useState<string | null>(null);

  useEffect(() => {
    return () => {
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
    setBanner(null);
    setLastMatch(null);

    try {
      await loadFaceModels();
      await startCamera();

      const profesores = await listProfesoresActivos();
      const activos = profesores.filter((profesor) => profesor.faceDescriptor?.length);

      if (activos.length === 0) {
        setBanner({
          tone: "warning",
          title: "Sin rostros registrados",
          message: "Pide al admin que registre los rostros primero.",
        });
        stopCamera();
        return;
      }

      scanStartedAtRef.current = Date.now();
      scanAttemptsRef.current = 0;

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        if (scanStartedAtRef.current && Date.now() - scanStartedAtRef.current > 12000) {
          setBanner({
            tone: "warning",
            title: "No se detecto rostro",
            message: "Intenta acercarte a la camara y mejorar la luz.",
          });
          stopCamera();
          return;
        }

        const descriptor = await getDescriptorFromVideo(videoRef.current);
        if (!descriptor) {
          scanAttemptsRef.current += 1;
          if (scanAttemptsRef.current % 4 === 0) {
            setBanner({
              tone: "info",
              title: "Buscando rostro",
              message: "Mira al frente y mantente quieto.",
            });
          }
          return;
        }

        const result = pickBestProfesor(descriptor, activos);
        if (!result.match || !result.profesor) {
          setBanner({
            tone: "error",
            title: "Rostro no reconocido",
            message: "Intenta de nuevo o pide ayuda al admin.",
          });
          return;
        }

        if (lastMatch === result.profesor.id) return;
        setLastMatch(result.profesor.id);

        const response = await registerAsistencia(result.profesor.id);
        if (response.status === "entrada") {
          setBanner({
            tone: "success",
            title: "Entrada registrada",
            message: `${result.profesor.nombre} ${result.profesor.apellido}`,
          });
        } else if (response.status === "salida") {
          setBanner({
            tone: "success",
            title: "Salida registrada",
            message: `${result.profesor.nombre} ${result.profesor.apellido}`,
          });
        } else {
          setBanner({
            tone: "warning",
            title: "Registro bloqueado",
            message: response.message ?? "No se puede registrar otro ciclo hoy.",
          });
        }

        stopCamera();
      }, 400);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Camara no disponible";
      setBanner({
        tone: "error",
        title: "No se pudo iniciar",
        message,
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
            className="h-[360px] w-full rounded-2xl object-cover"
            playsInline
            muted
          />
        </div>

        <div className="flex flex-col gap-4">
          {banner ? <StatusBanner {...banner} /> : null}
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

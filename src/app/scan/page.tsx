"use client";

import { useEffect, useRef, useState } from "react";
import { ScanCameraCard } from "@/components/scan/ScanCameraCard";
import { ScanLayout } from "@/components/scan/ScanLayout";
import { ScanStatusPanel } from "@/components/scan/ScanStatusPanel";
import { ScanStepsPanel } from "@/components/scan/ScanStepsPanel";
import { registerAsistencia } from "@/lib/asistencia";
import { subscribeProfesoresActivos } from "@/lib/profesores";
import type { Profesor } from "@/types/profesor/profesor";
import { distance, getDescriptorFromVideo, loadFaceModels } from "@/lib/face";
import Swal from "sweetalert2";

const MATCH_THRESHOLD = 0.5;
const MATCH_STREAK_REQUIRED = 1;
const SCAN_TIMEOUT_MS = 20000;

export default function ScanPage() {
    const [guideMessage, setGuideMessage] = useState<string>("");
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


  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
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

  const similarityPercentage = (a: number[], b: number[]) => {
    if (a.length !== b.length) return 0;
    let matches = 0;
    const tolerance = 0.15; 
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) < tolerance) matches++;
    }
    return matches / a.length;
  };

  const pickBestProfesor = (
    descriptor: Float32Array,
    profesores: Profesor[]
  ): { profesor: Profesor | null; similarity: number; match: boolean } => {
    let bestProfesor: Profesor | null = null;
    let bestSimilarity = 0;

    profesores.forEach((profesor) => {
      if (!profesor.faceDescriptor) return;
      const similarity = similarityPercentage(Array.from(descriptor), profesor.faceDescriptor);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestProfesor = profesor;
      }
    });

    return {
      profesor: bestProfesor,
      similarity: bestSimilarity,
      match: bestSimilarity >= 0.8,
    };
  };

  const handleScan = async () => {
    if (!videoRef.current) return;
    setLoading(true);
    lastMatchRef.current = null;
    registeringRef.current = false;
    matchStreakRef.current = 0;

      try {
        const { getAuth, signInAnonymously } = await import("firebase/auth");
        const { getFirebaseApp } = await import("@/lib/firebase");
        const app = getFirebaseApp();
        if (app) {
          const auth = getAuth(app);
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        }
      } catch (e) {
        await showAlert({
          icon: "error",
          title: "Error de autenticación",
          text: "No se pudo autenticar el dispositivo.",
        });
        setLoading(false);
        return;
      }
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
          // Mensajes de guía
          if (!descriptor) {
            scanAttemptsRef.current += 1;
            setGuideMessage("No se detecta rostro. Alinea tu cara dentro del óvalo, mantente quieto y mejora la iluminación si es posible.");
            if (scanAttemptsRef.current % 4 === 0) {
              showToast({
                icon: "info",
                title: "Buscando rostro...",
              });
            }
            return;
          }

          // Ejemplo de detección de distancia (simple)
          // Si el descriptor existe, podrías estimar la distancia por el tamaño del rostro detectado (no implementado aquí, pero puedes usar faceapi para landmarks)
          // setGuideMessage("Acércate un poco más a la cámara."); // o "Aléjate un poco más."

          const result = pickBestProfesor(descriptor, activos);
          if (!result.match || !result.profesor) {
            setGuideMessage("No se reconoce el rostro. Intenta mejorar la iluminación, alinear tu cara y mantenerte quieto.");
            matchStreakRef.current = 0;
            return;
          }

          setGuideMessage("¡Rostro reconocido! Espera la confirmación...");

          if (lastMatchRef.current === result.profesor.id) {
            matchStreakRef.current += 1;
          } else {
            lastMatchRef.current = result.profesor.id;
            matchStreakRef.current = 1;
          }

          if (matchStreakRef.current < MATCH_STREAK_REQUIRED) return;

          registeringRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;

          const response = await registerAsistencia(result.profesor.id);
          setGuideMessage("");
          if (response.status === "entrada") {
            await showAlert({
              icon: "success",
              title: "Entrada registrada",
              text: `${result.profesor.nombre} ${result.profesor.apellido} (Similitud: ${(result.similarity * 100).toFixed(1)}%)`,
            });
          } else if (response.status === "salida") {
            await showAlert({
              icon: "success",
              title: "Salida registrada",
              text: `${result.profesor.nombre} ${result.profesor.apellido} (Similitud: ${(result.similarity * 100).toFixed(1)}%)`,
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
          setGuideMessage("");
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
    <ScanLayout
      title="Verificacion rapida de asistencia"
      subtitle="Colocate frente a la camara, mantente quieto y espera la confirmacion. El sistema valida tu rostro automaticamente."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ScanCameraCard
          loading={loading}
          profesoresReady={profesoresReady}
          videoRef={videoRef}
          guideMessage={guideMessage}
        />

        <div className="flex flex-col gap-4">
          <ScanStatusPanel
            loading={loading}
            timeoutSeconds={Math.round(SCAN_TIMEOUT_MS / 1000)}
          />
          <ScanStepsPanel />
          <button
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? "Escaneando..." : "Iniciar escaneo"}
          </button>
        </div>
      </div>
    </ScanLayout>
  );
}

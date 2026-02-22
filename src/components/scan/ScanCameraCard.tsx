import type { ScanCameraCardProps } from "@/types/scan/scan-camera-card";

export const ScanCameraCard = ({
  loading,
  profesoresReady,
  videoRef,
}: ScanCameraCardProps) => (
  <div className="rounded-4xl border border-white/10 bg-linear-to-br from-slate-900/80 via-slate-950/80 to-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
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
        className="h-90 w-full object-cover -scale-x-100 sm:h-105"
        playsInline
        muted
      />
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
      <span>Iluminacion recomendada: media/alta</span>
      <span>Distancia ideal: 30-60 cm</span>
    </div>
  </div>
);

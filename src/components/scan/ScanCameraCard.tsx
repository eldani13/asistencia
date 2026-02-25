import type { ScanCameraCardProps } from "@/types/scan/scan-camera-card";

export const ScanCameraCard = ({
  loading,
  profesoresReady,
  videoRef,
  guideMessage,
}: ScanCameraCardProps & { guideMessage?: string }) => (
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
    <div className="relative mt-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
      <video
        ref={videoRef}
        className="h-90 w-full object-cover -scale-x-100 sm:h-105"
        playsInline
        muted
      />
      {/* Overlay ovalado */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        width="220" height="300"
        viewBox="0 0 220 300"
        style={{ zIndex: 2 }}
      >
        <ellipse
          cx="110" cy="150" rx="90" ry="120"
          stroke="#FFD700"
          strokeWidth="4"
          fill="none"
          opacity="0.7"
        />
      </svg>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
      <span>Iluminacion recomendada: media/alta</span>
      <span>Distancia ideal: 30-60 cm</span>
    </div>
    {/* Mensaje de guía dinámico */}
    {guideMessage && (
      <div className="mt-3 text-center text-sm font-semibold text-amber-300 animate-pulse">
        {guideMessage}
      </div>
    )}
  </div>
);

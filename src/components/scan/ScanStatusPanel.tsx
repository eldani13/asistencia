import type { ScanStatusPanelProps } from "@/types/scan/scan-status-panel";

export const ScanStatusPanel = ({ loading, timeoutSeconds }: ScanStatusPanelProps) => (
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
        <span className="font-semibold text-slate-100">{timeoutSeconds}s</span>
      </div>
    </div>
  </div>
);

import type { Profesor } from "@/lib/types";

type RegistrarRostroCardProps = {
  profesores: Profesor[];
  selectedProfesor: string;
  faceVideoRef: React.RefObject<HTMLVideoElement | null>;
  onSelectedProfesorChange: (value: string) => void;
  onCaptureFace: () => void;
};

export const RegistrarRostroCard = ({
  profesores,
  selectedProfesor,
  faceVideoRef,
  onSelectedProfesorChange,
  onCaptureFace,
}: RegistrarRostroCardProps) => (
  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <h2 className="text-lg font-semibold text-slate-100">Registrar rostro</h2>
    <p className="mt-2 text-sm text-slate-400">
      Selecciona un profesor y captura su rostro.
    </p>
    <select
      className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
      value={selectedProfesor}
      onChange={(event) => onSelectedProfesorChange(event.target.value)}
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
        className="h-96 w-full rounded-xl object-cover -scale-x-100"
        playsInline
        muted
      />
    </div>
    <button
      className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
      onClick={onCaptureFace}
      disabled={!selectedProfesor}
    >
      Capturar y guardar
    </button>
  </div>
);

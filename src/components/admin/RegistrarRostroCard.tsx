import type { RegistrarRostroCardProps } from "@/types/profesor/registrar-rostro-card";

export const RegistrarRostroCard = ({
  profesores,
  selectedProfesor,
  faceVideoRef,
  onSelectedProfesorChange,
  onCaptureFace,
}: RegistrarRostroCardProps) => (
  <section className="rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300">
          Biometria
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100">
          Registrar rostro
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Selecciona un profesor y captura su rostro con buena luz.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
          Estado
        </p>
        <p className="mt-1 text-sm font-semibold text-amber-300">
          {selectedProfesor ? "Listo" : "Sin seleccionar"}
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/70 via-slate-950/70 to-slate-900/60 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Profesor
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
        <div className="mt-6 grid gap-3 text-xs text-slate-400">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span>Luz recomendada</span>
            <span className="text-emerald-300">Media/Alta</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span>Distancia ideal</span>
            <span className="text-amber-300">30-60 cm</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span>Evita sombras</span>
            <span className="text-slate-200">Rostro visible</span>
          </div>
        </div>
        <button
          className="mt-6 w-full rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
          onClick={onCaptureFace}
          disabled={!selectedProfesor}
        >
          Capturar y guardar
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="uppercase tracking-[0.3em]">Vista previa</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-300">
            Camara lista
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
          <video
            ref={faceVideoRef}
            className="h-96 w-full object-cover -scale-x-100"
            playsInline
            muted
          />
        </div>
      </div>
    </div>
  </section>
);

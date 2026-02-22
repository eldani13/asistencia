import type { Profesor } from "@/lib/types";

type ProfesoresCardProps = {
  profesores: Profesor[];
  nombre: string;
  apellido: string;
  jornada: "mañana" | "tarde";
  horaInicio: string;
  horaFin: string;
  onNombreChange: (value: string) => void;
  onApellidoChange: (value: string) => void;
  onJornadaChange: (value: "mañana" | "tarde") => void;
  onHoraInicioChange: (value: string) => void;
  onHoraFinChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleProfesor: (profesor: Profesor) => void;
};

export const ProfesoresCard = ({
  profesores,
  nombre,
  apellido,
  jornada,
  horaInicio,
  horaFin,
  onNombreChange,
  onApellidoChange,
  onJornadaChange,
  onHoraInicioChange,
  onHoraFinChange,
  onSubmit,
  onToggleProfesor,
}: ProfesoresCardProps) => (
  <section className="rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300">
          Registro
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100">
          Profesores
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Total registrados: {profesores.length}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
          Jornada actual
        </p>
        <p className="mt-1 text-sm font-semibold text-amber-300 capitalize">
          {jornada}
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/70 via-slate-950/70 to-slate-900/60 p-5"
        onSubmit={onSubmit}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Nuevo profesor
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            Nombre
            <input
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              placeholder="Nombre"
              value={nombre}
              onChange={(event) => onNombreChange(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            Apellido
            <input
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              placeholder="Apellido"
              value={apellido}
              onChange={(event) => onApellidoChange(event.target.value)}
              required
            />
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            Jornada
            <select
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              value={jornada}
              onChange={(event) => onJornadaChange(event.target.value as "mañana" | "tarde")}
            >
              <option value="mañana">Jornada mañana</option>
              <option value="tarde">Jornada tarde</option>
            </select>
          </label>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
            Horario sugerido: {horaInicio} - {horaFin}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            Hora inicio
            <input
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              type="time"
              value={horaInicio}
              onChange={(event) => onHoraInicioChange(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs text-slate-400">
            Hora fin
            <input
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
              type="time"
              value={horaFin}
              onChange={(event) => onHoraFinChange(event.target.value)}
              required
            />
          </label>
        </div>
        <button
          className="mt-5 w-full rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-300"
          type="submit"
        >
          Crear profesor
        </button>
      </form>

      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Estado rapido
        </p>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <span>Activos</span>
            <span className="font-semibold text-emerald-300">
              {profesores.filter((profesor) => profesor.activo).length}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <span>Inactivos</span>
            <span className="font-semibold text-rose-300">
              {profesores.filter((profesor) => !profesor.activo).length}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <span>Rostros registrados</span>
            <span className="font-semibold text-amber-300">
              {profesores.filter((profesor) => (profesor.faceDescriptor?.length ?? 0) > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-6">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        Lista reciente
      </p>
      <div className="mt-4 space-y-3">
        {profesores.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
            Sin profesores registrados aun.
          </div>
        ) : (
          profesores.map((profesor) => (
            <div
              key={profesor.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {profesor.nombre} {profesor.apellido}
                </p>
                <p className="text-xs text-slate-400">
                  {profesor.activo ? "Activo" : "Inactivo"} · {profesor.jornada}
                </p>
              </div>
              <button
                className="text-xs text-amber-300"
                onClick={() => onToggleProfesor(profesor)}
              >
                {profesor.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
);

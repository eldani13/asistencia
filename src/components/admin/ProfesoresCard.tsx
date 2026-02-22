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
  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <h2 className="text-lg font-semibold text-slate-100">Profesores</h2>
    <p className="mt-2 text-sm text-slate-400">Total: {profesores.length}</p>
    <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
      <input
        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
        placeholder="Nombre"
        value={nombre}
        onChange={(event) => onNombreChange(event.target.value)}
        required
      />
      <input
        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
        placeholder="Apellido"
        value={apellido}
        onChange={(event) => onApellidoChange(event.target.value)}
        required
      />
      <select
        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
        value={jornada}
        onChange={(event) => onJornadaChange(event.target.value as "mañana" | "tarde")}
      >
        <option value="mañana">Jornada mañana</option>
        <option value="tarde">Jornada tarde</option>
      </select>
      <div className="grid gap-3 md:grid-cols-2">
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
        className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
        type="submit"
      >
        Crear profesor
      </button>
    </form>
    <div className="mt-6 space-y-3">
      {profesores.map((profesor) => (
        <div
          key={profesor.id}
          className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {profesor.nombre} {profesor.apellido}
            </p>
            <p className="text-xs text-slate-400">
              {profesor.activo ? "Activo" : "Inactivo"} · {profesor.jornada}
            </p>
          </div>
          <button className="text-xs text-amber-300" onClick={() => onToggleProfesor(profesor)}>
            {profesor.activo ? "Desactivar" : "Activar"}
          </button>
        </div>
      ))}
    </div>
  </div>
);

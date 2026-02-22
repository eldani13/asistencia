import type { Profesor } from "@/types/profesor/profesor";
import type {
  ProfesoresListSectionProps,
  ProfesoresPagination,
} from "@/types/profesor/profesores-list-section";

export const ProfesoresListSection = ({
  totalProfesores,
  pagination,
  onToggleProfesor,
  onPrevPage,
  onNextPage,
}: ProfesoresListSectionProps) => (
  <section className="rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Profesores</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100">Lista general</h2>
        <p className="mt-2 text-sm text-slate-400">Total: {totalProfesores}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Pagina</p>
        <p className="mt-1 text-sm font-semibold text-amber-300">
          {pagination.page}/{pagination.totalPages}
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {pagination.items.map((profesor) => (
        <div
          key={profesor.id}
          className="group rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition hover:border-amber-300/40 hover:bg-slate-900/60"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {profesor.nombre} {profesor.apellido}
              </p>
              <p className="mt-1 text-xs text-slate-400">Jornada: {profesor.jornada}</p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                profesor.activo
                  ? "border-emerald-300/40 text-emerald-200"
                  : "border-rose-300/40 text-rose-200"
              }`}
            >
              {profesor.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Horario: {profesor.horaInicio} - {profesor.horaFin}
            </span>
            <button
              className="text-amber-300 transition group-hover:text-amber-200"
              onClick={() => onToggleProfesor(profesor)}
            >
              {profesor.activo ? "Desactivar" : "Activar"}
            </button>
          </div>
        </div>
      ))}
    </div>

    {pagination.totalPages > 1 ? (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <span>
          Pagina {pagination.page} de {pagination.totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-slate-200 transition hover:border-white/30"
            onClick={onPrevPage}
            disabled={pagination.page === 1}
          >
            Anterior
          </button>
          <button
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-slate-200 transition hover:border-white/30"
            onClick={onNextPage}
            disabled={pagination.page === pagination.totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    ) : null}
  </section>
);

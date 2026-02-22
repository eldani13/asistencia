import { useEffect, useMemo, useState } from "react";
import type { AsistenciasSectionProps } from "@/types/asistencia/asistencias-section";
import type { Profesor } from "@/types/profesor/profesor";

export function AsistenciasSection({
  asistencias,
  profesores,
  loading,
  dateKey,
  onDateChange,
  onUpdateAsistencia,
  onAsistenciasChange,
}: AsistenciasSectionProps) {
  const asistenciasPageSize = 6;
  const [asistenciasPage, setAsistenciasPage] = useState(1);
  const profesorMap = new Map<string, Profesor>();
  profesores.forEach((profesor: Profesor) => profesorMap.set(profesor.id, profesor));

  const asistenciasPagination = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(asistencias.length / asistenciasPageSize));
    const safePage = Math.min(asistenciasPage, totalPages);
    const start = (safePage - 1) * asistenciasPageSize;
    const items = asistencias.slice(start, start + asistenciasPageSize);
    return { items, totalPages, page: safePage };
  }, [asistencias, asistenciasPage, asistenciasPageSize]);

  useEffect(() => {
    if (asistenciasPage !== asistenciasPagination.page) {
      setAsistenciasPage(asistenciasPagination.page);
    }
  }, [asistenciasPage, asistenciasPagination.page]);

  return (
    <section className="rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Asistencias</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">Historial diario</h2>
          <p className="mt-2 text-sm text-slate-400">
            Registros del dia seleccionado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
              Total
            </span>
            <span className="text-sm font-semibold text-amber-300">
              {asistencias.length}
            </span>
          </div>
          <input
            className="h-12 rounded-full border border-white/10 bg-slate-900/80 py-2 pl-4 pr-10 text-sm text-slate-100"
            type="date"
            value={dateKey}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Cargando...</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {asistencias.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-400">
              Sin registros para este dia.
            </div>
          ) : (
            asistenciasPagination.items.map((asistencia) => {
              const profesor = profesorMap.get(asistencia.profesorId);
              return (
                <div
                  key={asistencia.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {profesor
                          ? `${profesor.nombre} ${profesor.apellido}`
                          : asistencia.profesorId}
                      </p>
                      <p className="text-xs text-slate-400">{asistencia.fecha}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      {profesor?.jornada ?? "Sin jornada"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Hora entrada
                      <input
                        className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 opacity-70"
                        value={asistencia.horaEntrada ?? ""}
                        readOnly
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Hora salida
                      <input
                        className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 opacity-70"
                        value={asistencia.horaSalida ?? ""}
                        readOnly
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Horas trabajadas: {(asistencia.horasTrabajadas ?? 0).toFixed(2)}h
                    </span>
                    <span className="text-amber-300">
                      {asistencia.horaEntrada && !asistencia.horaSalida
                        ? "En curso"
                        : "Completado"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {!loading && asistenciasPagination.totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <span>
            Pagina {asistenciasPagination.page} de {asistenciasPagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-slate-200 transition hover:border-white/30"
              onClick={() => setAsistenciasPage((prev) => Math.max(1, prev - 1))}
              disabled={asistenciasPagination.page === 1}
            >
              Anterior
            </button>
            <button
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-slate-200 transition hover:border-white/30"
              onClick={() =>
                setAsistenciasPage((prev) =>
                  Math.min(asistenciasPagination.totalPages, prev + 1)
                )
              }
              disabled={
                asistenciasPagination.page === asistenciasPagination.totalPages
              }
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}


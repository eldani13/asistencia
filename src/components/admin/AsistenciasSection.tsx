import type { Asistencia, Profesor } from "@/lib/types";

type AsistenciasSectionProps = {
  asistencias: Asistencia[];
  profesores: Profesor[];
  loading: boolean;
  dateKey: string;
  onDateChange: (value: string) => void;
  onUpdateAsistencia: (asistenciaId: string, entrada: string, salida: string) => void;
  onAsistenciasChange: (next: Asistencia[]) => void;
};

export const AsistenciasSection = ({
  asistencias,
  profesores,
  loading,
  dateKey,
  onDateChange,
  onUpdateAsistencia,
  onAsistenciasChange,
}: AsistenciasSectionProps) => {
  const profesorMap = new Map<string, Profesor>();
  profesores.forEach((profesor) => profesorMap.set(profesor.id, profesor));

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Asistencias</h2>
          <p className="mt-1 text-sm text-slate-400">Correcciones permitidas solo aqui.</p>
        </div>
        <input
          className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
          type="date"
          value={dateKey}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Cargando...</p>
      ) : (
        <div className="mt-6 space-y-4">
          {asistencias.length === 0 ? (
            <p className="text-sm text-slate-400">Sin registros.</p>
          ) : (
            asistencias.map((asistencia) => {
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
                    <button
                      className="text-xs text-amber-300"
                      onClick={() =>
                        onUpdateAsistencia(
                          asistencia.id,
                          asistencia.horaEntrada ?? "",
                          asistencia.horaSalida ?? ""
                        )
                      }
                    >
                      Guardar
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Hora entrada
                      <input
                        className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                        value={asistencia.horaEntrada ?? ""}
                        onChange={(event) =>
                          onAsistenciasChange(
                            asistencias.map((item) =>
                              item.id === asistencia.id
                                ? { ...item, horaEntrada: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs text-slate-400">
                      Hora salida
                      <input
                        className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                        value={asistencia.horaSalida ?? ""}
                        onChange={(event) =>
                          onAsistenciasChange(
                            asistencias.map((item) =>
                              item.id === asistencia.id
                                ? { ...item, horaSalida: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};

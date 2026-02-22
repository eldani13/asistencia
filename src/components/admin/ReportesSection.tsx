import type { Asistencia, Profesor } from "@/lib/types";

type ReporteRow = {
  profesor: Profesor;
  horas: number;
};

type ReportesSectionProps = {
  loading: boolean;
  profesores: Profesor[];
  reporteRows: ReporteRow[];
  dateKey: string;
  reportRange: "dia" | "semana" | "mes";
  reportRangeLabel: string;
  onReportRangeChange: (value: "dia" | "semana" | "mes") => void;
};

export const ReportesSection = ({
  loading,
  profesores,
  reporteRows,
  dateKey,
  reportRange,
  reportRangeLabel,
  onReportRangeChange,
}: ReportesSectionProps) => (
  <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Reportes</h2>
        <p className="mt-1 text-sm text-slate-400">
          {reportRangeLabel} basada en {dateKey}.
        </p>
      </div>
      <select
        className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
        value={reportRange}
        onChange={(event) => onReportRangeChange(event.target.value as "dia" | "semana" | "mes")}
      >
        <option value="dia">Dia</option>
        <option value="semana">Semana</option>
        <option value="mes">Mes</option>
      </select>
    </div>

    {loading ? (
      <p className="mt-6 text-sm text-slate-400">Cargando reportes...</p>
    ) : profesores.length === 0 ? (
      <p className="mt-6 text-sm text-slate-400">Sin profesores.</p>
    ) : (
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {reporteRows.map((row) => (
          <div
            key={row.profesor.id}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
          >
            <p className="text-sm font-semibold text-slate-100">
              {row.profesor.nombre} {row.profesor.apellido}
            </p>
            <p className="mt-1 text-xs text-slate-400">Jornada: {row.profesor.jornada}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Horas trabajadas</span>
              <span className="text-lg font-semibold text-amber-300">
                {row.horas.toFixed(2)}h
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

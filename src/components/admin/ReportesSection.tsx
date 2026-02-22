import { useEffect, useMemo, useState } from "react";
import type { Asistencia, Profesor } from "@/lib/types";

type ReporteRow = {
  profesor: Profesor;
  horas: number;
};

type ReportesSectionProps = {
  loading: boolean;
  profesores: Profesor[];
  reporteRows: ReporteRow[];
  reportAsistencias: Asistencia[];
  dateKey: string;
  reportRange: "dia" | "semana" | "mes";
  reportRangeLabel: string;
  onReportRangeChange: (value: "dia" | "semana" | "mes") => void;
};

export const ReportesSection = ({
  loading,
  profesores,
  reporteRows,
  reportAsistencias,
  dateKey,
  reportRange,
  reportRangeLabel,
  onReportRangeChange,
}: ReportesSectionProps) => {
  const pageSize = 6;
  const [reportType, setReportType] = useState<
    "profesores" | "jornadas" | "dias" | "ranking" | "detalle"
  >("profesores");
  const [page, setPage] = useState(1);
  const [selectedProfesor, setSelectedProfesor] = useState("");

  const profesoresRows = useMemo(() => reporteRows, [reporteRows]);

  const jornadaSummary = useMemo(() => {
    const totals = new Map<"mañana" | "tarde", number>();
    const counts = new Map<"mañana" | "tarde", number>();
    reportAsistencias.forEach((item) => {
      const jornada = item.jornada ?? "mañana";
      const minutes = item.minutosTrabajados ?? 0;
      totals.set(jornada, (totals.get(jornada) ?? 0) + minutes);
      counts.set(jornada, (counts.get(jornada) ?? 0) + 1);
    });
    return (["mañana", "tarde"] as const).map((jornada) => {
      const minutos = totals.get(jornada) ?? 0;
      return {
        jornada,
        horas: Math.round((minutos / 60) * 100) / 100,
        registros: counts.get(jornada) ?? 0,
      };
    });
  }, [reportAsistencias]);

  const dailySummary = useMemo(() => {
    const map = new Map<string, { minutos: number; registros: number }>();
    reportAsistencias.forEach((item) => {
      const prev = map.get(item.fecha) ?? { minutos: 0, registros: 0 };
      map.set(item.fecha, {
        minutos: prev.minutos + (item.minutosTrabajados ?? 0),
        registros: prev.registros + 1,
      });
    });
    return Array.from(map.entries())
      .map(([fecha, data]) => ({
        fecha,
        horas: Math.round((data.minutos / 60) * 100) / 100,
        registros: data.registros,
      }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [reportAsistencias]);

  const ranking = useMemo(() => {
    const sorted = [...profesoresRows].sort((a, b) => b.horas - a.horas);
    return {
      top: sorted.slice(0, 5),
      bottom: sorted.slice(-5).reverse(),
    };
  }, [profesoresRows]);

  const reportTotals = useMemo(() => {
    const registros = reportAsistencias.length;
    const minutos = reportAsistencias.reduce(
      (sum, item) => sum + (item.minutosTrabajados ?? 0),
      0
    );
    return {
      registros,
      horas: Math.round((minutos / 60) * 100) / 100,
    };
  }, [reportAsistencias]);

  const detalleRows = useMemo(() => {
    if (!selectedProfesor) return [];
    return reportAsistencias
      .filter((item) => item.profesorId === selectedProfesor)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [reportAsistencias, selectedProfesor]);

  const pagedItems = useMemo(() => {
    const source =
      reportType === "profesores"
        ? profesoresRows
        : reportType === "dias"
          ? dailySummary
          : reportType === "detalle"
            ? detalleRows
            : [];
    const totalPages = Math.max(1, Math.ceil(source.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const items = source.slice(start, start + pageSize);
    return { items, totalPages, page: safePage };
  }, [dailySummary, detalleRows, page, pageSize, profesoresRows, reportType]);

  useEffect(() => {
    setPage(1);
  }, [reportType, reportRange]);

  useEffect(() => {
    if (page !== pagedItems.page) {
      setPage(pagedItems.page);
    }
  }, [page, pagedItems.page]);

  useEffect(() => {
    setPage(1);
  }, [selectedProfesor]);

  return (
    <section className="rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
      <div className="rounded-[28px] border border-white/10 bg-linear-to-br from-slate-950/90 via-slate-950/80 to-slate-900/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Reportes</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">
              Resumen de asistencia
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {reportRangeLabel} basada en {dateKey}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-11 rounded-full border border-white/10 bg-slate-900/80 px-4 text-sm text-slate-100"
              value={reportType}
              onChange={(event) =>
                setReportType(
                  event.target.value as
                    | "profesores"
                    | "jornadas"
                    | "dias"
                    | "ranking"
                    | "detalle"
                )
              }
            >
              <option value="profesores">Por profesor</option>
              <option value="jornadas">Por jornada</option>
              <option value="dias">Por dia</option>
              <option value="ranking">Ranking</option>
              <option value="detalle">Detalle por profesor</option>
            </select>
            <select
              className="h-11 rounded-full border border-white/10 bg-slate-900/80 px-4 text-sm text-slate-100"
              value={reportRange}
              onChange={(event) =>
                onReportRangeChange(event.target.value as "dia" | "semana" | "mes")
              }
            >
              <option value="dia">Dia</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Registros</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">
              {reportTotals.registros}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Horas</p>
            <p className="mt-2 text-2xl font-semibold text-sky-300">
              {reportTotals.horas.toFixed(2)}h
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Tipo</p>
            <p className="mt-2 text-sm font-semibold text-slate-100 capitalize">
              {reportType.replace("-", " ")}
            </p>
          </div>
        </div>
      </div>

      {reportType === "detalle" ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-100"
            value={selectedProfesor}
            onChange={(event) => setSelectedProfesor(event.target.value)}
          >
            <option value="">Selecciona un profesor</option>
            {profesores.map((profesor) => (
              <option key={profesor.id} value={profesor.id}>
                {profesor.nombre} {profesor.apellido}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Cargando reportes...</p>
      ) : profesores.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Sin profesores.</p>
      ) : reportType === "jornadas" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {jornadaSummary.map((row) => (
            <div
              key={row.jornada}
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
            >
              <p className="text-sm font-semibold text-slate-100">
                Jornada {row.jornada}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Registros: {row.registros}
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Horas trabajadas</span>
                <span className="text-lg font-semibold text-amber-300">
                  {row.horas.toFixed(2)}h
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : reportType === "ranking" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-sm font-semibold text-slate-100">Top profesores</p>
            <div className="mt-4 space-y-3">
              {ranking.top.length === 0 ? (
                <p className="text-sm text-slate-400">Sin datos.</p>
              ) : (
                ranking.top.map((row) => (
                  <div key={row.profesor.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-200">
                      {row.profesor.nombre} {row.profesor.apellido}
                    </span>
                    <span className="text-sm font-semibold text-amber-300">
                      {row.horas.toFixed(2)}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-sm font-semibold text-slate-100">Menor registro</p>
            <div className="mt-4 space-y-3">
              {ranking.bottom.length === 0 ? (
                <p className="text-sm text-slate-400">Sin datos.</p>
              ) : (
                ranking.bottom.map((row) => (
                  <div key={row.profesor.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-200">
                      {row.profesor.nombre} {row.profesor.apellido}
                    </span>
                    <span className="text-sm font-semibold text-amber-300">
                      {row.horas.toFixed(2)}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : reportType === "detalle" && !selectedProfesor ? (
        <p className="mt-6 text-sm text-slate-400">Selecciona un profesor.</p>
      ) : reportType === "detalle" && detalleRows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">Sin registros en este rango.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {reportType === "detalle"
            ? (pagedItems.items as Asistencia[]).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                >
                  <p className="text-sm font-semibold text-slate-100">{item.fecha}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Entrada: {item.horaEntrada ?? "--"} · Salida: {item.horaSalida ?? "--"}
                  </p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Horas trabajadas</span>
                    <span className="text-lg font-semibold text-amber-300">
                      {(item.horasTrabajadas ?? 0).toFixed(2)}h
                    </span>
                  </div>
                </div>
              ))
            : (pagedItems.items as ReporteRow[] | { fecha: string; horas: number; registros: number }[]).map(
                (row) =>
                  "profesor" in row ? (
                    <div
                      key={row.profesor.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-100">
                        {row.profesor.nombre} {row.profesor.apellido}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Jornada: {row.profesor.jornada}
                      </p>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">Horas trabajadas</span>
                        <span className="text-lg font-semibold text-amber-300">
                          {row.horas.toFixed(2)}h
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={row.fecha}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-100">{row.fecha}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Registros: {row.registros}
                      </p>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">Horas trabajadas</span>
                        <span className="text-lg font-semibold text-amber-300">
                          {row.horas.toFixed(2)}h
                        </span>
                      </div>
                    </div>
                  )
              )}
        </div>
      )}

      {!loading && pagedItems.totalPages > 1 && reportType !== "ranking" && reportType !== "jornadas" ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <span>
            Pagina {pagedItems.page} de {pagedItems.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-slate-200 transition hover:border-white/30"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pagedItems.page === 1}
            >
              Anterior
            </button>
            <button
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-slate-200 transition hover:border-white/30"
              onClick={() =>
                setPage((prev) => Math.min(pagedItems.totalPages, prev + 1))
              }
              disabled={pagedItems.page === pagedItems.totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

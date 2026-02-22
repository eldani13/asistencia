import type { Profesor } from "@/lib/types";

type DashboardStats = {
  totalProfesores: number;
  activos: number;
  inactivos: number;
  rostrosRegistrados: number;
  asistenciasHoy: number;
};

type TopProfesor = {
  profesor: Profesor;
  horas: number;
};

type DashboardSectionProps = {
  dashboardStats: DashboardStats;
  reportRangeLabel: string;
  reporteRowsCount: number;
  topProfesores: TopProfesor[];
  horasPorEntrada: number[];
};

export const DashboardSection = ({
  dashboardStats,
  reportRangeLabel,
  reporteRowsCount,
  topProfesores,
  horasPorEntrada,
}: DashboardSectionProps) => (
  <section className="grid gap-6">
    <div className="rounded-[36px] border border-white/10 bg-linear-to-br from-slate-950/90 via-slate-950/80 to-slate-900/70 p-8 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300">
            Panel principal
          </p>
          <h2 className="text-3xl font-semibold text-slate-100 font-['Space_Grotesk',ui-sans-serif]">
            Estado general de asistencia
          </h2>
          <p className="max-w-2xl text-sm text-slate-300">
            Resumen rapido de profesores, rostros registrados y registros de hoy.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Asistencias hoy
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">
            {dashboardStats.asistenciasHoy}
          </p>
          <p className="mt-1 text-xs text-slate-400">En tiempo real</p>
        </div>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[
        {
          label: "Profesores",
          value: dashboardStats.totalProfesores,
          accent: "text-amber-300",
        },
        {
          label: "Activos",
          value: dashboardStats.activos,
          accent: "text-emerald-300",
        },
        {
          label: "Inactivos",
          value: dashboardStats.inactivos,
          accent: "text-rose-300",
        },
        {
          label: "Rostros registrados",
          value: dashboardStats.rostrosRegistrados,
          accent: "text-sky-300",
        },
        {
          label: `Reportes ${reportRangeLabel.toLowerCase()}`,
          value: reporteRowsCount,
          accent: "text-amber-200",
        },
        {
          label: "Colegios activos",
          value: 1,
          accent: "text-slate-200",
        },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {item.label}
          </p>
          <p className={`mt-3 text-3xl font-semibold ${item.accent}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>

    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Top profesores</h2>
          <span className="text-xs text-slate-400">{reportRangeLabel}</span>
        </div>
        {topProfesores.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">Sin horas registradas en este rango.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {topProfesores.map((row) => (
              <div key={row.profesor.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>
                    {row.profesor.nombre} {row.profesor.apellido}
                  </span>
                  <span className="text-amber-300">{row.horas.toFixed(2)}h</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-linear-to-r from-amber-300 to-amber-500"
                    style={{
                      width: `${Math.min(100, (row.horas / topProfesores[0].horas) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Entradas por hora</h2>
          <span className="text-xs text-slate-400">Hoy</span>
        </div>
        <div className="mt-6 grid grid-cols-12 items-end gap-2">
          {horasPorEntrada.map((value, index) => (
            <div key={`hora-${index}`} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-full bg-amber-300/80"
                style={{ height: `${Math.max(6, value * 8)}px` }}
                title={`${value} entradas`}
              />
              <span className="text-[10px] text-slate-400">
                {String(index + 6).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

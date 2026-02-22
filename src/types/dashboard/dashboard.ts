export type DashboardSectionProps = {
  dashboardStats: {
    totalProfesores: number;
    activos: number;
    inactivos: number;
    rostrosRegistrados: number;
    asistenciasHoy: number;
  };
  reportRangeLabel: string;
  reporteRowsCount: number;
  topProfesores: Array<{ nombre: string; apellido: string; horas: number }>;
  horasPorEntrada: number[];
};

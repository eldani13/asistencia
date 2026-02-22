import type { Profesor } from "../profesor/profesor";
import type { Asistencia } from "../asistencia/asistencia";

export type ReporteRow = {
  profesor: Profesor;
  horas: number;
};

export type ReportesSectionProps = {
  loading: boolean;
  profesores: Profesor[];
  reporteRows: ReporteRow[];
  reportAsistencias: Asistencia[];
  dateKey: string;
  reportRange: "dia" | "semana" | "mes";
  reportRangeLabel: string;
  onReportRangeChange: (value: "dia" | "semana" | "mes") => void;
};

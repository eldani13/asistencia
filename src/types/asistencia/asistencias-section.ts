import type { Asistencia } from "./asistencia";

export type AsistenciasSectionProps = {
  asistencias: Asistencia[];
  profesores: import("@/types/profesor/profesor").Profesor[];
  loading: boolean;
  dateKey: string;
  onDateChange: React.Dispatch<React.SetStateAction<string>>;
  onUpdateAsistencia: (asistenciaId: string, entrada: string, salida: string) => Promise<void>;
  onAsistenciasChange: React.Dispatch<import("@/types/asistencia/asistencia").Asistencia[]>;
};

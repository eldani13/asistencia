export type Asistencia = {
  id: string;
  profesorId: string;
  fecha: string;
  horaEntrada?: string;
  horaSalida?: string;
  minutosTrabajados?: number;
  horasTrabajadas?: number;
  jornada?: string;
};

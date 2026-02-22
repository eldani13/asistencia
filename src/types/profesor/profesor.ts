export type Profesor = {
  id: string;
  nombre: string;
  apellido: string;
  jornada: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  faceDescriptor?: number[];
};

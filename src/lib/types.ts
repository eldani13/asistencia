export type AdminProfile = {
  uid: string;
  email: string;
  role: "admin" | "super";
  createdAt: Date | null;
};

export type Profesor = {
  id: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  faceDescriptor: number[] | null;
  jornada: "mañana" | "tarde";
  horaInicio: string;
  horaFin: string;
  createdAt: Date | null;
};

export type Asistencia = {
  id: string;
  profesorId: string;
  fecha: string; // YYYY-MM-DD
  horaEntrada: string | null; // HH:mm:ss
  horaSalida: string | null; // HH:mm:ss
  jornada: "mañana" | "tarde" | null;
  minutosTrabajados?: number;
  horasTrabajadas?: number;
  createdAt: Date | null;
};

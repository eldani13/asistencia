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
  createdAt: Date | null;
};

export type Asistencia = {
  id: string;
  profesorId: string;
  fecha: string; // YYYY-MM-DD
  horaEntrada: string | null; // HH:mm:ss
  horaSalida: string | null; // HH:mm:ss
  createdAt: Date | null;
};

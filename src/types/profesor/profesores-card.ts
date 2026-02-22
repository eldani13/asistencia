import type { Profesor } from "@/types/profesor/profesor";

export type ProfesoresCardProps = {
  profesores: Profesor[];
  nombre: string;
  apellido: string;
  jornada: string;
  horaInicio: string;
  horaFin: string;
  onNombreChange: (value: string) => void;
  onApellidoChange: (value: string) => void;
  onJornadaChange: (value: string) => void;
  onHoraInicioChange: (value: string) => void;
  onHoraFinChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleProfesor: (profesor: Profesor) => void;
};

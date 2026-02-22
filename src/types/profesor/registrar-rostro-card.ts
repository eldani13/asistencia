import type { Profesor } from "./profesor";

export type RegistrarRostroCardProps = {
  profesores: Profesor[];
  selectedProfesor: string;
  faceVideoRef: React.RefObject<HTMLVideoElement | null>;
  onSelectedProfesorChange: (value: string) => void;
  onCaptureFace: () => void;
};

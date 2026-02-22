import type { Profesor } from "./profesor";

export type ProfesoresPagination = {
  items: Profesor[];
  page: number;
  totalPages: number;
};

export type ProfesoresListSectionProps = {
  totalProfesores: number;
  pagination: ProfesoresPagination;
  onToggleProfesor: (profesor: Profesor) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

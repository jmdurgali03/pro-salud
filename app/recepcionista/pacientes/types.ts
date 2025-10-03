import { Id } from "@/convex/_generated/dataModel";

export type PacienteRecord = {
  _id: Id<"pacientes">;
  nombreCompleto: string;
  email?: string | null;
  telefono?: string | null;
  dni: string;
  fechaNacimiento?: string | null;
  genero?: "Masculino" | "Femenino";
  obrasSociales: Id<"obrasSociales">[];
  obrasSocialesNombres?: string[];
  [key: string]: unknown;
};

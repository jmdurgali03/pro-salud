import { Id } from "@/convex/_generated/dataModel";

export type PacienteRecord = {
  _id: Id<"pacientes">;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
genero?: "Masculino" | "Femenino"; 
  obrasSociales: Id<"obrasSociales">[];
  obrasSocialesNombres?: string[];
};

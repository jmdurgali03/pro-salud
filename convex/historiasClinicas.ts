import { query } from "./_generated/server";
import { v } from "convex/values";

export const obtenerHistoriaCompleta = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (_ctx, _args) => {
    // Smoke test: nunca falla
    return {
      paciente: null,
      consultas: [],
      diagnosticos: [],
      observaciones: [],
      turnos: [],
    };
  },
});

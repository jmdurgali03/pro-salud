// convex/diagnosticos.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Crea un diagnóstico SIN consultaId.
 */
export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    descripcion: v.string(),
    estado: v.union(v.literal("Presuntivo"), v.literal("Definitivo")),
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("diagnosticos", {
      pacienteId: args.pacienteId,
      profesionalId: args.profesionalId,
      descripcion: args.descripcion,
      estado: args.estado,
      fecha: args.fecha ?? now,
    });
  },
});

/**
 * Lista diagnósticos por paciente (orden descendente por _creationTime/fecha).
 * Asegurate de tener el índice "byPaciente" en la tabla diagnosticos del schema.
 */
export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    return await ctx.db
      .query("diagnosticos")
      .withIndex("byPaciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

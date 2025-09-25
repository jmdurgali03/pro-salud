import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    return await ctx.db
      .query("consultas")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    motivo: v.string(),
    profesional: v.string(),
    notas: v.optional(v.string()),
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("consultas", {
      ...args,
      fecha: args.fecha ?? Date.now(),
    });
  },
});

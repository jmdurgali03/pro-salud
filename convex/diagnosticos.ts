import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    return await ctx.db
      .query("diagnosticos")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    descripcion: v.string(),
    profesional: v.string(),
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("diagnosticos", {
      ...args,
      fecha: args.fecha ?? Date.now(),
    });
  },
});

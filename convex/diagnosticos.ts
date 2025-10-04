import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    consultaId: v.id("consultas"),
    profesionalId: v.id("profesionales"),
    descripcion: v.string(),
    estado: v.union(v.literal("Presuntivo"), v.literal("Definitivo")),
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const fecha = args.fecha ?? Date.now();
    await ctx.db.insert("diagnosticos", { ...args, fecha });
  },
});

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

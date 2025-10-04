import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    motivo: v.string(),
    profesionalId: v.id("profesionales"),
    notas: v.optional(v.string()),
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const fecha = args.fecha ?? Date.now();
    await ctx.db.insert("consultas", { ...args, fecha });
  },
});

export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    return await ctx.db
      .query("consultas")
      .withIndex("byPaciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

export const listarPorProfesional = query({
  args: { profesionalId: v.id("profesionales") },
  handler: async (ctx, { profesionalId }) => {
    return await ctx.db
      .query("consultas")
      .withIndex("byProfesional", (q) => q.eq("profesionalId", profesionalId))
      .order("desc")
      .collect();
  },
});
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    return await ctx.db
      .query("indicaciones")
      .withIndex("byPaciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    fecha: v.number(),
    tipo: v.union(
      v.literal("Estudio"),
      v.literal("Procedimiento"),
      v.literal("Derivación"),
      v.literal("Control")
    ),
    nombre: v.string(),
    observaciones: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("indicaciones", { ...args, estado: "Pendiente" });
  },
});

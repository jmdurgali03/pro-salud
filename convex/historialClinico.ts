import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const obtener = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    const existente = await ctx.db
      .query("historialClinico")
      .withIndex("por_paciente", q => q.eq("pacienteId", pacienteId))
      .first();
    return existente ?? null;
  },
});

export const upsert = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    antecedentesFamiliares: v.optional(v.string()),
    antecedentesPersonales: v.optional(v.string()),
    alergias: v.optional(v.string()),
    otrasNotas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ahora = Date.now();
    const existente = await ctx.db
      .query("historialClinico")
      .withIndex("por_paciente", q => q.eq("pacienteId", args.pacienteId))
      .first();
    if (existente) {
      await ctx.db.patch(existente._id, { ...args, actualizadoEn: ahora });
      return existente._id;
    }
    return await ctx.db.insert("historialClinico", { ...args, actualizadoEn: ahora });
  },
});

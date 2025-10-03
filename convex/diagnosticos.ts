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
    consultaId: v.id("consultas"),
    descripcion: v.string(),
    profesional: v.string(),
    estado: v.union(v.literal("Presuntivo"), v.literal("Definitivo")),
    fecha: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const consulta = await ctx.db.get(args.consultaId);
    if (!consulta) throw new Error("La consulta no existe.");
    if (consulta.pacienteId !== args.pacienteId) {
      throw new Error("La consulta no pertenece a este paciente.");
    }
    return await ctx.db.insert("diagnosticos", {
      ...args,
      fecha: args.fecha ?? Date.now(),
    });
  },
});

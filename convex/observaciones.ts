import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("observaciones")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", args.pacienteId))
      .collect();
  },
});

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    autor: v.string(),
    texto: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("observaciones", {
      ...args,
      creadoEn: Date.now(),
    });
  },
});

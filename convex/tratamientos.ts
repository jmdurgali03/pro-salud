import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    // Si no hay registros, devuelve []
    return await ctx.db
      .query("tratamientos")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    profesional: v.string(),
    titulo: v.string(),
    indicaciones: v.optional(v.string()),
    fechaInicio: v.optional(v.number()),
    fechaFin: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("tratamientos", {
      pacienteId: args.pacienteId,
      profesional: args.profesional,
      titulo: args.titulo,
      indicaciones: args.indicaciones,
      fechaInicio: args.fechaInicio ?? Date.now(),
      fechaFin: args.fechaFin,
      estado: "Activo",
    });
    return id;
  },
});

export const cambiarEstado = mutation({
  args: {
    id: v.id("tratamientos"),
    estado: v.union(
      v.literal("Activo"),
      v.literal("Suspendido"),
      v.literal("Finalizado")
    ),
  },
  handler: async (ctx, { id, estado }) => {
    await ctx.db.patch(id, { estado });
  },
});

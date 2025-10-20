// convex/observaciones.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Crea una observación/nota médica.
 * SIN consultaId (ya no existe en el schema).
 */
export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    fecha: v.optional(v.number()),

    // Campos clínicos
    categoria: v.union(
      v.literal("Evolución"),
      v.literal("Indicación"),
      v.literal("Interconsulta"),
      v.literal("Epicrisis"),
      v.literal("Administrativa")
    ),
    visibilidad: v.union(v.literal("Equipo"), v.literal("Privada")),
    titulo: v.optional(v.string()),
    texto: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("observaciones", {
      pacienteId: args.pacienteId,
      profesionalId: args.profesionalId,
      fecha: args.fecha ?? now,
      categoria: args.categoria,
      visibilidad: args.visibilidad,
      titulo: args.titulo,
      texto: args.texto,
      creadoEn: now,
      actualizadoEn: now,
    });
  },
});

/**
 * Lista observaciones por paciente (descendente por fecha).
 */
export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    return await ctx.db
      .query("observaciones")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

// convex/medicamentos.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listarPorPaciente = query({
  args: { pacienteId: v.id("pacientes") },
  handler: async (ctx, { pacienteId }) => {
    return await ctx.db
      .query("medicamentos")
      .withIndex("byPaciente", (q) => q.eq("pacienteId", pacienteId))
      .order("desc")
      .collect();
  },
});

export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    indicacionId: v.id("indicaciones"),                 // ✅ requerido
    diagnosticoId: v.optional(v.id("diagnosticos")),    // ✅ opcional
    fechaInicio: v.number(),
    fechaFin: v.optional(v.union(v.number(), v.null())),
    estado: v.union(v.literal("Activo"), v.literal("Suspendido"), v.literal("Finalizado")),
    nombreComercial: v.optional(v.string()),
    droga: v.string(),
    forma: v.union(
      v.literal("Comprimidos"),
      v.literal("Cápsulas"),
      v.literal("Jarabe"),
      v.literal("Solución"),
      v.literal("Inyectable"),
      v.literal("Pomada"),
      v.literal("Otro")
    ),
    dosis: v.string(),
    frecuencia: v.string(),
    duracion: v.optional(v.string()),
    via: v.optional(v.string()),
    indicaciones: v.optional(v.string()),
    cronico: v.optional(v.boolean()),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { fechaFin, ...rest } = args;
    await ctx.db.insert("medicamentos", {
      ...rest,
      fechaFin: fechaFin ?? undefined,
    });
  },
});

export const cambiarEstado = mutation({
  args: {
    id: v.id("medicamentos"),
    estado: v.union(v.literal("Activo"), v.literal("Suspendido"), v.literal("Finalizado")),
  },
  handler: async (ctx, { id, estado }) => {
    await ctx.db.patch(id, { estado });
  },
});

export const actualizar = mutation({
  args: {
    id: v.id("medicamentos"),
    indicacionId: v.id("indicaciones"),               // ✅ requerido
    diagnosticoId: v.optional(v.id("diagnosticos")),  // ✅ opcional
    fechaInicio: v.number(),
    fechaFin: v.union(v.number(), v.null()),
    nombreComercial: v.optional(v.string()),
    droga: v.string(),
    forma: v.union(
      v.literal("Comprimidos"),
      v.literal("Cápsulas"),
      v.literal("Jarabe"),
      v.literal("Solución"),
      v.literal("Inyectable"),
      v.literal("Pomada"),
      v.literal("Otro")
    ),
    dosis: v.string(),
    frecuencia: v.string(),
    duracion: v.optional(v.string()),
    via: v.optional(v.string()),
    indicaciones: v.optional(v.string()),
    cronico: v.optional(v.boolean()),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, fechaFin, ...rest } = args;
    await ctx.db.patch(id, {
      ...rest,
      fechaFin: fechaFin ?? undefined,
    });
  },
});

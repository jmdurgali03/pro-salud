import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Listar turnos por rango (para mes/semana/día)
export const listarRango = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, { from, to }) => {
    return await ctx.db
      .query("turnos")
      .withIndex("byStart", (q) => q.gte("start", from).lte("start", to))
      .order("asc")
      .collect();
  },
});

export const crear = mutation({
  args: {
    paciente: v.string(),
    profesional: v.string(),
    tipo: v.string(),
    estado: v.union(
      v.literal("Confirmado"),
      v.literal("Pendiente"),
      v.literal("Cancelado")
    ),
    start: v.number(),
    end: v.number(),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = `${args.paciente} (${args.tipo})`;
    return await ctx.db.insert("turnos", { ...args, title });
  },
});


export const editar = mutation({
  args: {
    id: v.id("turnos"),
    title: v.optional(v.string()),
    paciente: v.optional(v.string()),
    profesional: v.optional(v.string()),
    tipo: v.optional(v.string()),
    estado: v.optional(
      v.union(
        v.literal("Confirmado"),
        v.literal("Pendiente"),
        v.literal("Cancelado")
      )
    ),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    await ctx.db.patch(id, data);
    return id;
  },
});

export const eliminar = mutation({
  args: { id: v.id("turnos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

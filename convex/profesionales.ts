import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 🔍 Listar profesionales
export const listar = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("profesionales").collect();
  },
});

// ➕ Crear
export const crear = mutation({
  args: {
    nombre: v.string(),
    especialidad: v.string(),
    contacto: v.string(),
    obrasSociales: v.array(v.string()),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profesionales", args);
  },
});

// ✏️ Editar
export const editar = mutation({
  args: {
    id: v.id("profesionales"),
    nombre: v.optional(v.string()),
    especialidad: v.optional(v.string()),
    contacto: v.optional(v.string()),
    obrasSociales: v.optional(v.array(v.string())),
    estado: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// 🗑️ Eliminar
export const eliminar = mutation({
  args: { id: v.id("profesionales") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

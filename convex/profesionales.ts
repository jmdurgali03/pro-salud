// convex/profesionales.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Lista todos los profesionales.
 */
export const listar = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("profesionales").collect();
  },
});

/**
 * Crea un profesional.
 * OJO: obrasSociales es un ARRAY de Id<"obrasSociales">.
 */
export const crear = mutation({
  args: {
    nombre: v.string(),
    especialidad: v.id("especialidades"),
    contacto: v.string(),
    obrasSociales: v.array(v.id("obrasSociales")),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profesionales", args);
  },
});

/**
 * Edita un profesional existente.
 */
export const editar = mutation({
  args: {
    id: v.id("profesionales"),
    nombre: v.string(),
    especialidad: v.id("especialidades"),
    contacto: v.string(),
    obrasSociales: v.array(v.id("obrasSociales")),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, { id, ...data }) => {
    await ctx.db.patch(id, data);
    return id;
  },
});

/**
 * Elimina un profesional.
 */
export const eliminar = mutation({
  args: { id: v.id("profesionales") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

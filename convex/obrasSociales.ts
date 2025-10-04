// convex/obrasSociales.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ---------------------- Crear ---------------------- */
export const crear = mutation({
  args: { nombre: v.string() },
  handler: async (ctx, { nombre }) => {
    const existente = await ctx.db
      .query("obrasSociales")
      .withIndex("por_nombre", (q) => q.eq("nombre", nombre))
      .first();

    if (existente) {
      throw new Error("Ya existe una obra social con ese nombre.");
    }

    await ctx.db.insert("obrasSociales", { nombre });
  },
});

/* ---------------------- Listar ---------------------- */
export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("obrasSociales").collect();
  },
});

/* ---------------------- Editar ---------------------- */
export const editar = mutation({
  args: {
    id: v.id("obrasSociales"),
    nombre: v.string(),
  },
  handler: async (ctx, { id, nombre }) => {
    const existente = await ctx.db.get(id);
    if (!existente) {
      throw new Error("Obra social no encontrada.");
    }

    const duplicada = await ctx.db
      .query("obrasSociales")
      .withIndex("por_nombre", (q) => q.eq("nombre", nombre))
      .first();

    if (duplicada && duplicada._id !== id) {
      throw new Error("Ya existe otra obra social con ese nombre.");
    }

    await ctx.db.patch(id, { nombre });
  },
});

/* ---------------------- Eliminar ---------------------- */
export const eliminar = mutation({
  args: { id: v.id("obrasSociales") },
  handler: async (ctx, { id }) => {
    const existente = await ctx.db.get(id);
    if (!existente) {
      throw new Error("Obra social no encontrada.");
    }

    await ctx.db.delete(id);
  },
});

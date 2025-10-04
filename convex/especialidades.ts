import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listar = query(async (ctx) => {
  return await ctx.db.query("especialidades").collect();
});

export const crear = mutation({
  args: { nombre: v.string() },
  handler: async (ctx, { nombre }) => {
    return await ctx.db.insert("especialidades", { nombre });
  },
});

export const editar = mutation({
  args: { id: v.id("especialidades"), nombre: v.string() },
  handler: async (ctx, { id, nombre }) => {
    await ctx.db.patch(id, { nombre });
  },
});

export const eliminar = mutation({
  args: { id: v.id("especialidades") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

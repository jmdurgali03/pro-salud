import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const crear = mutation({
  args: { nombre: v.string() },
  handler: async (ctx, { nombre }) => {
    return await ctx.db.insert("obrasSociales", { nombre });
  },
});

export const listar = query(async (ctx) => {
  return await ctx.db.query("obrasSociales").collect();
});

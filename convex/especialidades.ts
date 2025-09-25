import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
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

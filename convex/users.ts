import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUserIfNotExists = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    nombre: v.optional(v.string()),
    apellido: v.optional(v.string()),
    dni: v.optional(v.string()),
    telefono: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing;

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      nombre: args.nombre ?? "",
      apellido: args.apellido ?? "",
      dni: args.dni ?? "",
      telefono: args.telefono ?? "",
      role: "paciente",
    });
  },
});


export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/* ------------------------------
   Crear usuario si no existe
-------------------------------- */
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
      creadoEn: Date.now(),
    });
  },
});

/* ------------------------------
   Listar usuarios
-------------------------------- */
export const listar = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.sort((a, b) => b._creationTime - a._creationTime); // más recientes arriba
  },
});

/* ------------------------------
   Actualizar rol
-------------------------------- */
export const actualizarRol = mutation({
  args: {
    id: v.id("users"),
    role: v.union(
      v.literal("paciente"),
      v.literal("profesional"),
      v.literal("recepcionista"),
      v.literal("gerente")
    ),
  },
  handler: async (ctx, { id, role }) => {
    const user = await ctx.db.get(id);
    if (!user) throw new ConvexError("Usuario no encontrado");

    await ctx.db.patch(id, { role });
    return { ok: true };
  },
});

/* ------------------------------
   Eliminar usuario
-------------------------------- */
export const eliminar = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    if (!user) throw new ConvexError("Usuario no encontrado");

    await ctx.db.delete(id);
    return { ok: true };
  },
});

/* ------------------------------
   Obtener usuario actual
-------------------------------- */
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    if (!clerkId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    return user ?? null;
  },
});

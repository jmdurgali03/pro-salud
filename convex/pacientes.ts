import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Listar pacientes con búsqueda por nombre o DNI
export const listar = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const pacientes = await ctx.db.query("pacientes").collect();

    if (!args.search || args.search.trim() === "") {
      return pacientes;
    }

    const s = args.search.toLowerCase();
    return pacientes.filter(
      (p) =>
        p.nombreCompleto.toLowerCase().includes(s) ||
        p.dni.toLowerCase().includes(s)
    );
  },
});

// Crear paciente
export const crear = mutation({
  args: {
    nombreCompleto: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    obraSocial: v.string(),
    fechaNacimiento: v.optional(v.string()), // 👈 agregado
  },
  handler: async (ctx, args) => {
    const existente = await ctx.db
      .query("pacientes")
      .withIndex("por_dni", (q) => q.eq("dni", args.dni))
      .unique();

    if (existente) {
      throw new Error("Ya existe un paciente con ese DNI");
    }

    const id = await ctx.db.insert("pacientes", {
      ...args,
      creadoEn: Date.now(),
      actualizadoEn: Date.now(),
    });
    return id;
  },
});

// Actualizar paciente
export const actualizar = mutation({
  args: {
    id: v.id("pacientes"),
    nombreCompleto: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    obraSocial: v.string(),
    fechaNacimiento: v.optional(v.string()), // 👈 agregado
  },
  handler: async (ctx, args) => {
    const { id, ...resto } = args;

    const duplicado = await ctx.db
      .query("pacientes")
      .withIndex("por_dni", (q) => q.eq("dni", resto.dni))
      .unique();

    if (duplicado && duplicado._id !== id) {
      throw new Error("Ya existe otro paciente con ese DNI");
    }

    await ctx.db.patch(id, {
      ...resto,
      actualizadoEn: Date.now(),
    });
  },

});
// Eliminar paciente
export const eliminar = mutation({
  args: { id: v.id("pacientes") },
  handler: async (ctx, args) => {
    // Validar que exista
    const paciente = await ctx.db.get(args.id);
    if (!paciente) {
      throw new Error("Paciente no encontrado");
    }

    // Eliminarlo
    await ctx.db.delete(args.id);
  },
});
export const getById = query({
  args: { id: v.id("pacientes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

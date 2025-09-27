import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// LISTAR (sin cambios)
export const listar = query(async (ctx) => {
  const profesionales = await ctx.db.query("profesionales").collect();
  return profesionales;
});

// CREAR  ✅ agrega `telefono`
export const crear = mutation({
  args: {
    nombre: v.string(),
    dni: v.string(),
    matricula: v.string(),
    especialidadId: v.id("especialidades"),
    contacto: v.string(),
    telefono: v.string(),                   // <-- NUEVO
    obrasSociales: v.array(v.id("obrasSociales")),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profesionales", { ...args });
  },
});

// EDITAR  ✅ permite editar `telefono`
export const editar = mutation({
  args: {
    id: v.id("profesionales"),
    nombre: v.optional(v.string()),
    especialidadId: v.optional(v.id("especialidades")),
    contacto: v.optional(v.string()),
    telefono: v.optional(v.string()),       // <-- NUEVO
    obrasSociales: v.optional(v.array(v.id("obrasSociales"))),
    estado: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"))),
  },
  handler: async (ctx, { id, ...data }) => {
    await ctx.db.patch(id, data);
    return id;
  },
});

// ELIMINAR (sin cambios)
export const eliminar = mutation({
  args: { id: v.id("profesionales") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

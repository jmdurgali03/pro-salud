import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Listar profesionales
export const listar = query(async (ctx) => {
  const profesionales = await ctx.db.query("profesionales").collect();

  return await Promise.all(
    profesionales.map(async (prof) => {
      const especialidad = await ctx.db.get(prof.especialidad);
      const obraSocial = await ctx.db.get(prof.obraSocial);

      return {
        ...prof,
        especialidadNombre: especialidad?.nombre ?? "",
        obraSocialNombre: obraSocial?.nombre ?? "",
      };
    })
  );
});

// Crear
export const crear = mutation({
  args: {
    nombre: v.string(),
    especialidad: v.id("especialidades"),
    contacto: v.string(),
    obraSocial: v.id("obrasSociales"),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profesionales", args);
  },
});

// Editar
export const editar = mutation({
  args: {
    id: v.id("profesionales"),
    nombre: v.string(),
    especialidad: v.id("especialidades"),
    contacto: v.string(),
    obraSocial: v.id("obrasSociales"),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, { id, ...data }) => {
    return await ctx.db.patch(id, data);
  },
});

// Eliminar
export const eliminar = mutation({
  args: { id: v.id("profesionales") },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});

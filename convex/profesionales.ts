import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Listar profesionales con join a especialidad y obras sociales
export const listar = query(async (ctx) => {
  const profesionales = await ctx.db.query("profesionales").collect();

  return await Promise.all(
    profesionales.map(async (prof) => {
      const especialidad = await ctx.db.get(prof.especialidadId);

      // como es un array de obras sociales, buscamos todas
      const obrasSociales = await Promise.all(
        prof.obrasSociales.map((id) => ctx.db.get(id))
      );

      return {
        ...prof,
        especialidadNombre: especialidad?.nombre ?? "",
        obrasSocialesNombres: obrasSociales
          .filter(Boolean)
          .map((o) => o!.nombre),
      };
    })
  );
});

// Crear profesional
export const crear = mutation({
  args: {
    nombre: v.string(),
    especialidadId: v.id("especialidades"),
    contacto: v.string(),
    obrasSociales: v.array(v.id("obrasSociales")),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profesionales", {
      ...args,
    });
  },
});

// Editar profesional
export const editar = mutation({
  args: {
    id: v.id("profesionales"),
    nombre: v.optional(v.string()),
    especialidadId: v.optional(v.id("especialidades")),
    contacto: v.optional(v.string()),
    obrasSociales: v.optional(v.array(v.id("obrasSociales"))),
    estado: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"))),
  },
  handler: async (ctx, { id, ...data }) => {
    return await ctx.db.patch(id, data);
  },
});

// Eliminar profesional
export const eliminar = mutation({
  args: { id: v.id("profesionales") },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});

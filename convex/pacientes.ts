// convex/pacientes.ts
import { query ,mutation} from "./_generated/server";
import { v } from "convex/values";

export const listar = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const pacientes = await ctx.db.query("pacientes").collect();
    const obras = await ctx.db.query("obrasSociales").collect();
    const relaciones = await ctx.db.query("pacientes_obrasSociales").collect();

    const filtrados = !args.search
      ? pacientes
      : pacientes.filter(
          (p) =>
            p.nombreCompleto.toLowerCase().includes(args.search!.toLowerCase()) ||
            p.dni.includes(args.search!)
        );

    return filtrados.map((p) => {
      // Buscar obras sociales relacionadas
      const rels = relaciones.filter((r) => r.pacienteId === p._id);
      const obrasIds = rels.map((r) => r.obraSocialId);

      return {
        ...p,
        obrasSociales: obrasIds, // 🔹 array de Id<"obrasSociales">
        obrasSocialesNombres: obrasIds
          .map((id) => obras.find((o) => o._id === id)?.nombre)
          .filter(Boolean), // 🔹 nombres listos para mostrar
      };
    });
  },
});


// Crear paciente
export const crear = mutation({
  args: {
    nombreCompleto: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    fechaNacimiento: v.optional(v.string()),
    obrasSociales: v.array(v.id("obrasSociales")),
  },
  handler: async (ctx, args) => {
    const ahora = Date.now();
    const { obrasSociales, ...pacienteData } = args;

    const pacienteId = await ctx.db.insert("pacientes", {
      ...pacienteData,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });

    for (const osId of obrasSociales) {
      await ctx.db.insert("pacientes_obrasSociales", {
        pacienteId,
        obraSocialId: osId,
      });
    }

    return pacienteId;
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
    fechaNacimiento: v.optional(v.string()),
    obrasSociales: v.array(v.id("obrasSociales")),
  },
  handler: async (ctx, args) => {
    const { id, obrasSociales, ...resto } = args;

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

    // resetear relaciones
    const actuales = await ctx.db
      .query("pacientes_obrasSociales")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", id))
      .collect();

    for (const rel of actuales) {
      await ctx.db.delete(rel._id);
    }

    for (const osId of obrasSociales) {
      await ctx.db.insert("pacientes_obrasSociales", {
        pacienteId: id,
        obraSocialId: osId,
      });
    }
  },
});

// Eliminar paciente
export const eliminar = mutation({
  args: { id: v.id("pacientes") },
  handler: async (ctx, args) => {
    const paciente = await ctx.db.get(args.id);
    if (!paciente) throw new Error("Paciente no encontrado");

    // borrar relaciones
    const rels = await ctx.db
      .query("pacientes_obrasSociales")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", args.id))
      .collect();

    for (const r of rels) {
      await ctx.db.delete(r._id);
    }

    await ctx.db.delete(args.id);
  },


});
// 🔹 Obtener paciente por ID con sus obras sociales
export const getByIdConObras = query({
  args: { id: v.id("pacientes") },
  handler: async (ctx, { id }) => {
    const paciente = await ctx.db.get(id);
    if (!paciente) return null;

    const rels = await ctx.db
      .query("pacientes_obrasSociales")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", id))
      .collect();

    const obras = await Promise.all(
      rels.map((r) => ctx.db.get(r.obraSocialId))
    );

    return {
      ...paciente,
      obrasSociales: obras.filter(Boolean).map((o) => o!.nombre),
    };
  },
});


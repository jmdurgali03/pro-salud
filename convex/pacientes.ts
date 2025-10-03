// convex/pacientes.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listar = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const pacientes = await ctx.db.query("pacientes").collect();
    const obras = await ctx.db.query("obrasSociales").collect();
    const relaciones = await ctx.db.query("pacientes_obrasSociales").collect();

    const pacientesConObras = pacientes.map((p) => {
      const rels = relaciones.filter((r) => r.pacienteId === p._id);
      const obrasIds = rels.map((r) => r.obraSocialId);
      const obrasNombres = obrasIds
        .map((id) => obras.find((o) => o._id === id)?.nombre)
        .filter((nombre): nombre is string => Boolean(nombre));

      return {
        ...p,
        obrasSociales: obrasIds,
        obrasSocialesNombres: obrasNombres,
      };
    });

    const termino = args.search?.trim().toLowerCase();

    if (!termino) {
      return pacientesConObras;
    }

    const coincide = (valor?: string | number | null) => {
      if (valor === undefined || valor === null) return false;
      const comoTexto = typeof valor === "string" ? valor.trim() : String(valor);
      return comoTexto.toLowerCase().includes(termino);
    };

    return pacientesConObras.filter((p) =>
      coincide(p.nombreCompleto) ||
      coincide(p.dni) ||
      coincide(p.email) ||
      coincide(p.telefono) ||
      coincide(p.fechaNacimiento) ||
      coincide(p.genero) ||
      (p.obrasSocialesNombres ?? []).some((nombre) => coincide(nombre))
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
    fechaNacimiento: v.optional(v.string()),
    genero: v.union(v.literal("Masculino"), v.literal("Femenino")),
    obrasSociales: v.array(v.id("obrasSociales")),
  },
  handler: async (ctx, args) => {
    const ahora = Date.now();
    const { obrasSociales, ...pacienteData } = args;

    // Validar que se haya seleccionado al menos una obra social
    if (obrasSociales.length === 0) {
      throw new Error("Debe seleccionar al menos una obra social (incluyendo 'Particular' si no tiene cobertura)");
    }

    // Verificar si ya existe un paciente con ese DNI
    const existente = await ctx.db
      .query("pacientes")
      .withIndex("por_dni", (q) => q.eq("dni", pacienteData.dni))
      .unique();

    if (existente) {
      throw new Error("Ya existe un paciente con ese DNI");
    }

    const pacienteId = await ctx.db.insert("pacientes", {
      ...pacienteData,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });

    // Insertar relaciones con obras sociales
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
    genero: v.union(v.literal("Masculino"), v.literal("Femenino")),
    obrasSociales: v.array(v.id("obrasSociales")),
  },
  handler: async (ctx, args) => {
    const { id, obrasSociales, ...resto } = args;

    // Validar que se haya seleccionado al menos una obra social
    if (obrasSociales.length === 0) {
      throw new Error("Debe seleccionar al menos una obra social (incluyendo 'Particular' si no tiene cobertura)");
    }

    // Verificar si ya existe otro paciente con ese DNI
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

    // Resetear relaciones
    const actuales = await ctx.db
      .query("pacientes_obrasSociales")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", id))
      .collect();

    for (const rel of actuales) {
      await ctx.db.delete(rel._id);
    }

    // Insertar nuevas relaciones
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

// Obtener paciente por ID con sus obras sociales
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

export const getById = query({
  args: { id: v.id("pacientes") },
  handler: async (ctx, args) => {
    const paciente = await ctx.db.get(args.id);
    if (!paciente) return null;

    // Buscar relaciones paciente ↔ obras sociales
    const relaciones = await ctx.db
      .query("pacientes_obrasSociales")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", args.id))
      .collect();

    const obrasIds = relaciones.map((r) => r.obraSocialId);

    const obras = await Promise.all(obrasIds.map((id) => ctx.db.get(id)));

    return {
      ...paciente,
      obrasSociales: obrasIds, // los IDs
      obrasSocialesNombres: obras
        .filter((o) => o !== null)
        .map((o) => o!.nombre), // los nombres
    };
  },
});

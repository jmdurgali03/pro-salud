import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =====================
// 🔹 Listar pacientes
// =====================
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
        estado: (p as any).estado ?? "Activo",
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
      coincide(p.nombre) ||
      coincide(p.apellido) ||
      coincide(p.dni) ||
      coincide(p.email) ||
      coincide(p.telefono) ||
      coincide(p.fechaNacimiento) ||
      coincide(p.genero) ||
      (p.obrasSocialesNombres ?? []).some((nombre) => coincide(nombre))
    );
  },
});

// =====================
// 🔹 Crear paciente
// =====================
export const crear = mutation({
  args: {
    nombre: v.string(),
    apellido: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    fechaNacimiento: v.optional(v.string()),
    genero: v.union(
      v.literal("Masculino"),
      v.literal("Femenino"),
      v.literal("Otro")
    ),
    obrasSociales: v.array(v.id("obrasSociales")),
  },
  handler: async (ctx, args) => {
    const ahora = Date.now();
    const { obrasSociales, ...pacienteData } = args;

    if (obrasSociales.length === 0) {
      throw new Error(
        "Debe seleccionar al menos una obra social (incluyendo 'Particular' si no tiene cobertura)"
      );
    }

    const existente = await ctx.db
      .query("pacientes")
      .withIndex("por_dni", (q) => q.eq("dni", pacienteData.dni))
      .unique();

    if (existente) {
      throw new Error("Ya existe un paciente con ese DNI");
    }

    const pacienteId = await ctx.db.insert("pacientes", {
      ...pacienteData,
      estado: "Activo",
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

// =====================
// 🔹 Actualizar paciente
// =====================
export const actualizar = mutation({
  args: {
    id: v.id("pacientes"),
    nombre: v.string(),
    apellido: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    fechaNacimiento: v.optional(v.string()),
    genero: v.union(
      v.literal("Masculino"),
      v.literal("Femenino"),
      v.literal("Otro")
    ),
    obrasSociales: v.array(v.id("obrasSociales")),
  },
  handler: async (ctx, args) => {
    const { id, obrasSociales, ...resto } = args;

    if (obrasSociales.length === 0) {
      throw new Error(
        "Debe seleccionar al menos una obra social (incluyendo 'Particular' si no tiene cobertura)"
      );
    }

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

// =====================
// 🔹 Cambiar estado (activar/desactivar)
// =====================
export const cambiarEstado = mutation({
  args: { id: v.id("pacientes"), estado: v.union(v.literal("Activo"), v.literal("Inactivo")) },
  handler: async (ctx, { id, estado }) => {
    const paciente = await ctx.db.get(id);
    if (!paciente) throw new Error("Paciente no encontrado");
    await ctx.db.patch(id, { estado, actualizadoEn: Date.now() });
  },
});

// =====================
// 🔹 Eliminar paciente (compatibilidad)
// =====================
export const eliminar = mutation({
  args: { id: v.id("pacientes") },
  handler: async (ctx, args) => {
    const paciente = await ctx.db.get(args.id);
    if (!paciente) throw new Error("Paciente no encontrado");

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

// =====================
// 🔹 Obtener paciente por ID con sus obras sociales
// =====================
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

// =====================
// 🔹 Obtener paciente por ID (IDs + nombres de obras sociales)
// =====================
export const getById = query({
  args: { id: v.id("pacientes") },
  handler: async (ctx, args) => {
    const paciente = await ctx.db.get(args.id);
    if (!paciente) return null;

    const relaciones = await ctx.db
      .query("pacientes_obrasSociales")
      .withIndex("por_paciente", (q) => q.eq("pacienteId", args.id))
      .collect();

    const obrasIds = relaciones.map((r) => r.obraSocialId);
    const obras = await Promise.all(obrasIds.map((id) => ctx.db.get(id)));

    return {
      ...paciente,
      obrasSociales: obrasIds,
      obrasSocialesNombres: obras
        .filter((o) => o !== null)
        .map((o) => o!.nombre),
    };
  },
});

// =====================
// 🔹 Listar pacientes por doctor
// =====================
export const listarPorDoctor = query({
  args: { doctorId: v.id("profesionales") },
  handler: async (ctx, { doctorId }) => {
    const turnos = await ctx.db
      .query("turnos")
      .withIndex("byProfesional", (q) => q.eq("profesionalId", doctorId))
      .collect();

    const pacienteIds = [...new Set(turnos.map((t) => t.pacienteId))];
    const pacientes = await Promise.all(
      pacienteIds.map((pid) => ctx.db.get(pid))
    );

    return pacientes
      .filter((p) => !!p)
      .map((p) => {
        const ultimaConsulta = turnos
          .filter((t) => t.pacienteId === p!._id)
          .map((t) => t.start)
          .sort((a, b) => b - a)[0];

        return {
          _id: p!._id,
          nombre: p!.nombre,
          apellido: p!.apellido,
          dni: p!.dni,
          telefono: p!.telefono,
          email: p!.email,
          ultimaConsulta,
        };
      });
  },
});

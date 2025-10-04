import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { checkSolapamiento } from "./helpers/checkSolapamiento";

// ----------------------------
// Listar turnos enriquecidos por rango
// ----------------------------
export const listarRango = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, { from, to }) => {
    const turnos = await ctx.db
      .query("turnos")
      .withIndex("byStart", (q) => q.gte("start", from).lte("start", to))
      .order("asc")
      .collect();

    const resultados = [];

    for (const t of turnos) {
      const paciente = await ctx.db.get(t.pacienteId);
      const profesional = await ctx.db.get(t.profesionalId);
      const especialidad = profesional
        ? await ctx.db.get(profesional.especialidadId)
        : null;

      // 🔹 Resolver obras sociales desde la tabla pivote pacientes_obrasSociales
      let obrasSocialesPaciente: string[] = [];
      if (paciente) {
        const rels = await ctx.db
          .query("pacientes_obrasSociales")
          .withIndex("por_paciente", (q) => q.eq("pacienteId", paciente._id))
          .collect();

        const obras = await Promise.all(
          rels.map(async (r) => {
            const os = await ctx.db.get(r.obraSocialId);
            return os?.nombre ?? "";
          })
        );

        obrasSocialesPaciente = obras.filter(Boolean);
      }

      resultados.push({
        ...t,
        pacienteNombre: paciente?.nombre ?? "—",
        pacienteApellido: paciente?.apellido ?? "—",
        profesionalNombre: profesional?.nombre ?? "—",
        profesionalApellido: profesional?.apellido ?? "—",
        profesionalEstado: profesional?.estado ?? "Inactivo",
        especialidadNombre: especialidad?.nombre ?? "—",
        obrasSocialesPaciente,
      });
    }

    return resultados;
  },
});

// ----------------------------
// Crear turno
// ----------------------------
export const crear = mutation({
  args: {
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    tipo: v.string(),
    estado: v.union(
      v.literal("Confirmado"),
      v.literal("Pendiente"),
      v.literal("Cancelado")
    ),
    start: v.number(),
    end: v.number(),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existeSolapamiento = await checkSolapamiento(
      ctx.db,
      args.profesionalId,
      args.start,
      args.end
    );

    if (existeSolapamiento) {
      throw new ConvexError("El profesional ya tiene un turno en este horario.");
    }

    const ahora = Date.now();
    return await ctx.db.insert("turnos", {
      ...args,
      creadoEn: ahora,
      actualizadoEn: ahora,
    });
  },
});

// ----------------------------
// Editar turno
// ----------------------------
export const editar = mutation({
  args: {
    id: v.id("turnos"),
    pacienteId: v.optional(v.id("pacientes")),
    profesionalId: v.optional(v.id("profesionales")),
    tipo: v.optional(v.string()),
    estado: v.optional(
      v.union(
        v.literal("Confirmado"),
        v.literal("Pendiente"),
        v.literal("Cancelado")
      )
    ),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    const turnoActual = await ctx.db.get(id);
    if (!turnoActual) {
      throw new ConvexError("Turno no encontrado");
    }

    const nuevo = { ...turnoActual, ...data };

    const existeSolapamiento = await checkSolapamiento(
      ctx.db,
      nuevo.profesionalId,
      nuevo.start,
      nuevo.end,
      id
    );

    if (existeSolapamiento) {
      throw new ConvexError("El profesional ya tiene un turno en este horario.");
    }

    await ctx.db.patch(id, {
      ...data,
      actualizadoEn: Date.now(),
    });
    return id;
  },
});

// ----------------------------
// Eliminar turno
// ----------------------------
export const eliminar = mutation({
  args: { id: v.id("turnos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ----------------------------
// Listar por profesional (simple)
// ----------------------------
export const listarPorProfesional = query({
  args: { profesionalId: v.id("profesionales") },
  handler: async (ctx, { profesionalId }) => {
    return await ctx.db
      .query("turnos")
      .withIndex("byProfesional", (q) => q.eq("profesionalId", profesionalId))
      .collect();
  },
});

// ----------------------------
// Listar con nombres (básico, sin rango)
// ----------------------------
export const listarConNombres = query({
  args: {},
  handler: async (ctx) => {
    const turnos = await ctx.db.query("turnos").collect();

    return Promise.all(
      turnos.map(async (t) => {
        const paciente = await ctx.db.get(t.pacienteId);
        const profesional = await ctx.db.get(t.profesionalId);
        const especialidad = profesional
          ? await ctx.db.get(profesional.especialidadId)
          : null;

        return {
          ...t,
          pacienteNombre: paciente?.nombre ?? "Paciente sin nombre",
          pacienteApellido: paciente?.apellido ?? "Paciente sin apellido",
          profesionalNombre: profesional?.nombre ?? "Profesional sin nombre",
          profesionalApellido: profesional?.apellido ?? "Profesional sin apellido",
          especialidadNombre: especialidad?.nombre ?? "",
        };
      })
    );
  },
});

// ----------------------------
// Listar todos los turnos (simple, para dashboard)
// ----------------------------
export const listar = query({
  args: {},
  handler: async (ctx) => {
    const turnos = await ctx.db.query("turnos").collect();

    return Promise.all(
      turnos.map(async (t) => {
        const paciente = await ctx.db.get(t.pacienteId);
        const profesional = await ctx.db.get(t.profesionalId);
        const especialidad = profesional
          ? await ctx.db.get(profesional.especialidadId)
          : null;

        return {
          ...t,
          pacienteNombre: paciente?.nombre || "—",
          profesionalNombre: profesional?.nombre || "—",
          especialidadNombre: especialidad?.nombre || "—",
        };
      })
    );
  },
});

// convex/turnos.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkSolapamiento } from "./helpers/checkSolapamiento";

// ----------------------------
// Listar turnos enriquecidos
// ----------------------------
export const listarRango = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, { from, to }) => {
    const turnos = await ctx.db
      .query("turnos")
      .withIndex("byStart", (q) => q.gte("start", from).lte("start", to))
      .order("asc")
      .collect();

    return Promise.all(
      turnos.map(async (t) => {
        const paciente = await ctx.db.get(t.pacienteId);
        const profesional = await ctx.db.get(t.profesionalId);

        // especialidad del profesional
        const especialidad = profesional
          ? await ctx.db.get(profesional.especialidadId)
          : null;

        // obras sociales del paciente vía tabla pivote
        let obrasSocialesPaciente: string[] = [];
        if (paciente) {
          const rels = await ctx.db
            .query("pacientes_obrasSociales")
            .withIndex("por_paciente", (q) => q.eq("pacienteId", paciente._id))
            .collect();

          const os = await Promise.all(
            rels.map((r) => ctx.db.get(r.obraSocialId))
          );
          obrasSocialesPaciente = os.filter(Boolean).map((o) => o!.nombre);
        }

        return {
          ...t,
          pacienteNombre: paciente?.nombreCompleto || "—",
          profesionalNombre: profesional?.nombre || "—",
          especialidadNombre: especialidad?.nombre || "—",
          obrasSocialesPaciente,
        };
      })
    );
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
      throw new Error("El profesional ya tiene un turno en este horario.");
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
    if (!turnoActual) throw new Error("Turno no encontrado");

    const nuevo = { ...turnoActual, ...data };

    const existeSolapamiento = await checkSolapamiento(
      ctx.db,
      nuevo.profesionalId,
      nuevo.start,
      nuevo.end,
      id
    );

    if (existeSolapamiento) {
      throw new Error("El profesional ya tiene un turno en este horario.");
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
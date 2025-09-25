// convex/turnos.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
        const prof = await ctx.db.get(t.profesionalId);
        const especialidad = prof
          ? await ctx.db.get(prof.especialidad)
          : null;
        const obraSocial = prof
          ? await ctx.db.get(prof.obraSocial)
          : null;

        return {
          ...t,
          profesionalNombre: prof?.nombre ?? "Sin asignar",
          especialidadNombre: especialidad?.nombre ?? "N/A",
          obraSocialNombre: obraSocial?.nombre ?? "N/A",
        };
      })
    );
  },
});



// Crear turno
export const crear = mutation({
  args: {
    paciente: v.string(),
    profesionalId: v.id("profesionales"), // 👈 FK
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
    const profesional = await ctx.db.get(args.profesionalId);
    const title = `${args.paciente} (${args.tipo}) - ${profesional?.nombre ?? "Sin profesional"}`;

    return await ctx.db.insert("turnos", { ...args, title });
  },
});

// Editar turno
export const editar = mutation({
  args: {
    id: v.id("turnos"),
    paciente: v.optional(v.string()),
    profesionalId: v.optional(v.id("profesionales")), // 👈 ahora es ID
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
    await ctx.db.patch(id, data);
    return id;
  },
});

// Eliminar turno
export const eliminar = mutation({
  args: { id: v.id("turnos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

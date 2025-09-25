import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  turnos: defineTable({
    title: v.string(),
    paciente: v.string(),
    profesional: v.string(),
    tipo: v.string(),
    estado: v.union(
      v.literal("Confirmado"),
      v.literal("Pendiente"),
      v.literal("Cancelado")
    ),
    start: v.number(),
    end: v.number(),
    notas: v.optional(v.string()),
  }).index("byStart", ["start"]),

  profesionales: defineTable({
    nombre: v.string(),
    especialidad: v.string(),
    contacto: v.string(), // email o teléfono
    obrasSociales: v.array(v.string()),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  })
    .index("byNombre", ["nombre"])
    .index("byEspecialidad", ["especialidad"]),
});

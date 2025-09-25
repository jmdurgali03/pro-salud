import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pacientes: defineTable({
    nombreCompleto: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    obraSocial: v.string(),
    fechaNacimiento: v.optional(v.string()),
    creadoEn: v.number(),
    actualizadoEn: v.number(),
  })
    .index("por_dni", ["dni"])
    .index("por_nombre", ["nombreCompleto"])
    .index("por_obraSocial", ["obraSocial"]),

  observaciones: defineTable({
    pacienteId: v.id("pacientes"),
    autor: v.string(),
    texto: v.string(),
    creadoEn: v.number(),
  }).index("por_paciente", ["pacienteId"]),

  consultas: defineTable({
    pacienteId: v.id("pacientes"),
    motivo: v.string(),
    profesional: v.string(),
    notas: v.optional(v.string()),
    fecha: v.number(),
  }).index("por_paciente", ["pacienteId"]),

  diagnosticos: defineTable({
    pacienteId: v.id("pacientes"),
    descripcion: v.string(),
    profesional: v.string(),
    fecha: v.number(),
  }).index("por_paciente", ["pacienteId"]),
});

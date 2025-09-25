import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  turnos: defineTable({
    title: v.string(),
    paciente: v.string(),
    profesionalId: v.id("profesionales"), // 👈 FK a profesionales
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
    especialidad: v.id("especialidades"),   // referencia única
    contacto: v.string(),
    obraSocial: v.id("obrasSociales"),      // referencia única
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  }),

  obrasSociales: defineTable({
    nombre: v.string(),
  }),

  especialidades: defineTable({
    nombre: v.string(),
  }),

  pacientes: defineTable({
    nombreCompleto: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    obraSocial: v.string(),
    fechaNacimiento: v.optional(v.string()), // 👈 agregado

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

});

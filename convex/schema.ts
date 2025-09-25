import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // -------------------------
  // Usuarios
  // -------------------------
  users: defineTable({
    clerkId: v.string(),
    nombre: v.string(),
    apellido: v.string(),
    email: v.string(),
    dni: v.string(),
    telefono: v.optional(v.string()),
    role: v.string(), // "profesional", "recepcionista", "gerente", "paciente"
  }).index("by_clerkId", ["clerkId"]),

  // -------------------------
  // Turnos médicos
  // -------------------------
  turnos: defineTable({
    title: v.optional(v.string()),

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
    creadoEn: v.number(),
    actualizadoEn: v.number(),
  }).index("byStart", ["start"])
  .index("byProfesional", ["profesionalId"]),

  // -------------------------
  // Profesionales
  // -------------------------
  profesionales: defineTable({
    nombre: v.string(),
    especialidadId: v.id("especialidades"),
    contacto: v.string(),
    obrasSociales: v.array(v.id("obrasSociales")), // puede atender varias
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  }).index("por_nombre", ["nombre"]),

  // -------------------------
  // Obras Sociales
  // -------------------------
  obrasSociales: defineTable({
    nombre: v.string(),
  }).index("por_nombre", ["nombre"]),

  // -------------------------
  // Especialidades médicas
  // -------------------------
  especialidades: defineTable({
    nombre: v.string(),
  }).index("por_nombre", ["nombre"]),

  // -------------------------
  // Pacientes
  // -------------------------
  pacientes: defineTable({
    nombreCompleto: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    fechaNacimiento: v.optional(v.string()),
    creadoEn: v.number(),
    actualizadoEn: v.number(),
  })
  .index("por_dni", ["dni"])
  .index("por_nombre", ["nombreCompleto"]),

  // -------------------------
  // Relación Paciente ↔ Obra Social (N:M)
  // -------------------------
  pacientes_obrasSociales: defineTable({
    pacienteId: v.id("pacientes"),
    obraSocialId: v.id("obrasSociales"),
  })
    .index("por_paciente", ["pacienteId"])
    .index("por_obraSocial", ["obraSocialId"])
    .index("paciente_obraSocial_unico", ["pacienteId", "obraSocialId"]),
  
  // -------------------------
  // Observaciones clínicas
  // -------------------------
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

// convex/schema.ts
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
    role: v.string(), // "doctor", "recepcionista", "gerente", "paciente"
    creadoEn: v.optional(v.number()),
  }).index("byClerkId", ["clerkId"]),

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
      v.literal("Cancelado"),
      v.literal("Finalizado")
    ),
    start: v.number(),
    end: v.number(),
    notas: v.optional(v.string()),
    creadoEn: v.number(),
    actualizadoEn: v.number(),
  })
    .index("byStart", ["start"])
    .index("byProfesional", ["profesionalId"])
    .index("byPaciente", ["pacienteId"])
    .index("byEstado", ["estado"]),

  // -------------------------
  // Profesionales
  // -------------------------
  profesionales: defineTable({
    nombre: v.string(),
    apellido: v.string(),
    dni: v.string(),
    matricula: v.string(),
    especialidadId: v.id("especialidades"),
    contacto: v.string(),
    telefono: v.string(),
    obrasSociales: v.array(v.id("obrasSociales")),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
    usuario: v.string(),
    password: v.string(),
    clerkUserId: v.optional(v.string()),
  })
    .index("por_nombre", ["nombre"])
    .index("por_dni", ["dni"])
    .index("por_matricula", ["matricula"])
    .index("por_telefono", ["telefono"])
    .index("byClerkUser", ["clerkUserId"])
    .index("byUsuario", ["usuario"])
    .index("byContacto", ["contacto"]),

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
    nombre: v.string(),
    apellido: v.string(),
    email: v.optional(v.string()),
    telefono: v.optional(v.string()),
    dni: v.string(),
    fechaNacimiento: v.optional(v.string()),
    genero: v.optional(v.union(v.literal("Masculino"), v.literal("Femenino"))),
    creadoEn: v.number(),
    actualizadoEn: v.number(),
  })
    .index("por_dni", ["dni"])
    .index("por_nombre", ["nombre"])
    .index("por_apellido", ["apellido"]),

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


  // -------------------------
  // Diagnósticos
  // -------------------------
  diagnosticos: defineTable({
    pacienteId: v.id("pacientes"),
    consultaId: v.id("consultas"),
    profesionalId: v.id("profesionales"),
    descripcion: v.string(),
    estado: v.union(v.literal("Presuntivo"), v.literal("Definitivo")),
    fecha: v.optional(v.number()),
  })
    .index("byPaciente", ["pacienteId"])
    .index("byProfesional", ["profesionalId"])
    .index("byConsulta", ["consultaId"]),

  // -------------------------
  // Consultas
  // -------------------------
  consultas: defineTable({
    pacienteId: v.id("pacientes"),
    motivo: v.string(),
    profesionalId: v.id("profesionales"),
    notas: v.optional(v.string()),
    fecha: v.optional(v.number()),
  })
    .index("byPaciente", ["pacienteId"])
    .index("byProfesional", ["profesionalId"]),

  // -------------------------
  // Tratamientos
  // -------------------------
 tratamientos: defineTable({
  pacienteId: v.id("pacientes"),
  profesional: v.string(),
  titulo: v.string(),
  indicaciones: v.string(),
  fechaInicio: v.number(),
  fechaFin: v.optional(v.number()),
  estado: v.union(
    v.literal("Activo"),
    v.literal("Suspendido"),
    v.literal("Finalizado")
  ),
  cronico: v.optional(v.boolean()), // ✅ agregado correctamente
  notas: v.optional(v.string()),    // ✅ ya que también la usás en la mutación
}).index("por_paciente", ["pacienteId"]),
  // -------------------------
  // Historial clínico
  // -------------------------
  historialClinico: defineTable({
    pacienteId: v.id("pacientes"),
    antecedentesFamiliares: v.optional(v.string()),
    antecedentesPersonales: v.optional(v.string()),
    alergias: v.optional(v.string()),
    otrasNotas: v.optional(v.string()),
    actualizadoEn: v.number(),
  }).index("por_paciente", ["pacienteId"]),

observaciones: defineTable({
  pacienteId: v.id("pacientes"),
  profesionalId: v.id("profesionales"),
  consultaId: v.optional(v.id("consultas")),
  fecha: v.number(), // epoch ms
  categoria: v.union(
    v.literal("Evolución"),
    v.literal("Indicación"),
    v.literal("Interconsulta"),
    v.literal("Epicrisis"),
    v.literal("Administrativa")
  ),
  visibilidad: v.union(v.literal("Equipo"), v.literal("Privada")),
  titulo: v.optional(v.string()),
  texto: v.string(),
  creadoEn: v.number(),
  actualizadoEn: v.number(),
})
  .index("por_paciente", ["pacienteId"])
  .index("por_consulta", ["consultaId"])
  .index("por_profesional", ["profesionalId"])
  .index("por_paciente_fecha", ["pacienteId", "fecha"])
});

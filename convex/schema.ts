// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // -------------------------
  // Usuarios (sin cambios)
  // -------------------------
  users: defineTable({
    clerkId: v.string(),
    nombre: v.string(),
    apellido: v.string(),
    email: v.string(),
    dni: v.string(),
    telefono: v.optional(v.string()),
    role: v.string(),
    creadoEn: v.optional(v.number()),
  }).index("byClerkId", ["clerkId"]),

  // -------------------------
  // Turnos (sin cambios)
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
    duracion: v.optional(v.number()),
    notas: v.optional(v.string()),
    creadoEn: v.number(),
    actualizadoEn: v.number(),
  })
    .index("byStart", ["start"])
    .index("byProfesional", ["profesionalId"])
    .index("byPaciente", ["pacienteId"])
    .index("byEstado", ["estado"]),

  // -------------------------
  // Profesionales (sin cambios relevantes)
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
    franjasHorarias: v.optional(
      v.array(
        v.object({
          dia: v.number(),
          inicio: v.string(),
          fin: v.string(),
        })
      )
    ),
  })
    .index("por_nombre", ["nombre"])
    .index("por_dni", ["dni"])
    .index("por_matricula", ["matricula"])
    .index("por_telefono", ["telefono"])
    .index("byClerkUser", ["clerkUserId"])
    .index("byUsuario", ["usuario"])
    .index("byContacto", ["contacto"]),

  // -------------------------
  // Obras sociales / Especialidades (sin cambios)
  // -------------------------
  obrasSociales: defineTable({ nombre: v.string() }).index("por_nombre", ["nombre"]),
  especialidades: defineTable({ nombre: v.string() }).index("por_nombre", ["nombre"]),

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
    genero: v.union(v.literal("Masculino"), v.literal("Femenino"), v.literal("Otro")),
    estado: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"))),
    creadoEn: v.number(),
    actualizadoEn: v.number(),
  })
    .index("por_dni", ["dni"])
    .index("por_nombre", ["nombre"])
    .index("por_apellido", ["apellido"]),

  pacientes_obrasSociales: defineTable({
    pacienteId: v.id("pacientes"),
    obraSocialId: v.id("obrasSociales"),
  })
    .index("por_paciente", ["pacienteId"])
    .index("por_obraSocial", ["obraSocialId"])
    .index("paciente_obraSocial_unico", ["pacienteId", "obraSocialId"]),

  // -------------------------
  // Observaciones / Notas médicas (sin cambios)
  // -------------------------
  observaciones: defineTable({
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
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
    .index("por_profesional", ["profesionalId"])
    .index("por_paciente_fecha", ["pacienteId", "fecha"]),
  // -------------------------
  // Diagnósticos (sin consultaId)
  // -------------------------
   diagnosticos: defineTable({
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    descripcion: v.string(),
    estado: v.union(v.literal("Presuntivo"), v.literal("Definitivo")),
    fecha: v.optional(v.number()),
  })
    .index("byPaciente", ["pacienteId"])
    .index("byProfesional", ["profesionalId"]),

  // -------------------------
  // Indicaciones médicas (prácticas/estudios)
  // -------------------------
  indicaciones: defineTable({
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    diagnosticoId: v.id("diagnosticos"), // ✅ NUEVO (requerido)
    fecha: v.number(),
    tipo: v.union(
      v.literal("Estudio"),
      v.literal("Procedimiento"),
      v.literal("Derivación"),
      v.literal("Control")
    ),
    nombre: v.string(),
    observaciones: v.optional(v.string()),
    estado: v.union(v.literal("Pendiente"), v.literal("Realizada"), v.literal("Cancelada")),
  })
    .index("byPaciente", ["pacienteId"])
    .index("byProfesional", ["profesionalId"])
    .index("byDiagnostico", ["diagnosticoId"]), // ✅ útil
  // -------------------------
  // Medicamentos (tratamientos farmacológicos unitarios)
  // -------------------------
   medicamentos: defineTable({
    pacienteId: v.id("pacientes"),
    profesionalId: v.id("profesionales"),
    indicacionId: v.id("indicaciones"),                // ✅ NUEVO (requerido)
    diagnosticoId: v.optional(v.id("diagnosticos")),   // ✅ NUEVO (opcional)
    fechaInicio: v.number(),
    fechaFin: v.optional(v.number()),
    estado: v.union(v.literal("Activo"), v.literal("Suspendido"), v.literal("Finalizado")),
    nombreComercial: v.optional(v.string()),
    droga: v.string(),
    forma: v.union(
      v.literal("Comprimidos"),
      v.literal("Cápsulas"),
      v.literal("Jarabe"),
      v.literal("Solución"),
      v.literal("Inyectable"),
      v.literal("Pomada"),
      v.literal("Otro")
    ),
    dosis: v.string(),
    frecuencia: v.string(),
    duracion: v.optional(v.string()),
    via: v.optional(v.string()),
    indicaciones: v.optional(v.string()),
    cronico: v.optional(v.boolean()),
    notas: v.optional(v.string()),
  })
    .index("byPaciente", ["pacienteId"])
    .index("byProfesional", ["profesionalId"])
    .index("byIndicacion", ["indicacionId"])           // ✅ útil
    .index("byDiagnostico", ["diagnosticoId"]),        // ✅ útil

  // (si usás tu tabla de “tratamientos” larga, la podés dejar; no interfiere)
  tratamientos: defineTable({
    pacienteId: v.id("pacientes"),
    profesional: v.string(),
    titulo: v.string(),
    indicaciones: v.string(),
    fechaInicio: v.number(),
    fechaFin: v.optional(v.number()),
    estado: v.union(v.literal("Activo"), v.literal("Suspendido"), v.literal("Finalizado")),
    cronico: v.optional(v.boolean()),
    notas: v.optional(v.string()),
  }).index("por_paciente", ["pacienteId"]),

  historialClinico: defineTable({
    pacienteId: v.id("pacientes"),
    antecedentesFamiliares: v.optional(v.string()),
    antecedentesPersonales: v.optional(v.string()),
    alergias: v.optional(v.string()),
    otrasNotas: v.optional(v.string()),
    actualizadoEn: v.number(),
  }).index("por_paciente", ["pacienteId"]),
});

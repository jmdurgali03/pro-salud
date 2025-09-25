import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
});

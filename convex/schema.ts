// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  especialidades: defineTable({
    nombre: v.string(),
  }),

  obrasSociales: defineTable({
    nombre: v.string(),
  }),

  profesionales: defineTable({
    nombre: v.string(),
    especialidad: v.id("especialidades"),
    contacto: v.string(),
    // 👇 IMPORTANTE: plural y array
    obrasSociales: v.array(v.id("obrasSociales")),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo")),
  }),
});

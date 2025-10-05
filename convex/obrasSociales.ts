// convex/obrasSociales.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ---------------------- Crear ---------------------- */
export const crear = mutation({
  args: { nombre: v.string() },
  handler: async (ctx, { nombre }) => {
    const existente = await ctx.db
      .query("obrasSociales")
      .withIndex("por_nombre", (q) => q.eq("nombre", nombre))
      .first();

    if (existente) {
      throw new Error("Ya existe una obra social con ese nombre.");
    }

    await ctx.db.insert("obrasSociales", { nombre });
  },
});

/* ---------------------- Listar ---------------------- */
export const listar = query({
  handler: async (ctx) => {
    return await ctx.db.query("obrasSociales").collect();
  },
});

/* ---------------------- Editar ---------------------- */
export const editar = mutation({
  args: {
    id: v.id("obrasSociales"),
    nombre: v.string(),
  },
  handler: async (ctx, { id, nombre }) => {
    const existente = await ctx.db.get(id);
    if (!existente) {
      throw new Error("Obra social no encontrada.");
    }

    const duplicada = await ctx.db
      .query("obrasSociales")
      .withIndex("por_nombre", (q) => q.eq("nombre", nombre))
      .first();

    if (duplicada && duplicada._id !== id) {
      throw new Error("Ya existe otra obra social con ese nombre.");
    }

    await ctx.db.patch(id, { nombre });
  },
});

/* ---------------------- Eliminar ---------------------- */
export const eliminar = mutation({
  args: { id: v.id("obrasSociales") },
  handler: async (ctx, { id }) => {
    const existente = await ctx.db.get(id);
    if (!existente) {
      throw new Error("Obra social no encontrada.");
    }

    await ctx.db.delete(id);
  },
});


/* ---------------------- conteo de obras sociales ---------------------- */

export const contarPacientesPorObraSocial = query({
  handler: async (ctx) => {
    try {
      // Traemos TODAS las relaciones paciente–obraSocial
      const relaciones = await ctx.db.query("pacientes_obrasSociales").collect();

      if (relaciones.length === 0) return [];

      // Mapa: nombreOS -> Set de pacientes (para evitar duplicados)
      const conteo = new Map<string, Set<string>>();

      for (const rel of relaciones) {
        if (!rel.obraSocialId || !rel.pacienteId) continue; // prevenir valores nulos

        // ⚠️ Aseguramos que la obra social aún existe
        const obra = await ctx.db.get(rel.obraSocialId);
        if (!obra || !obra.nombre) continue;

        const nombreOS = obra.nombre.trim();
        const pacienteId = String(rel.pacienteId);

        if (!conteo.has(nombreOS)) conteo.set(nombreOS, new Set());
        conteo.get(nombreOS)!.add(pacienteId);
      }

      // Convertimos el mapa a un array { nombre, valor }
      const data = Array.from(conteo.entries()).map(([nombre, pacientes]) => ({
        nombre,
        valor: pacientes.size,
      }));

      // Si no hay pacientes, devolvemos vacío
      return data.length > 0
        ? data.sort((a, b) => b.valor - a.valor)
        : [];
    } catch (err) {
      console.error("❌ Error en contarPacientesPorObraSocial:", err);
      return [];
    }
  },
});
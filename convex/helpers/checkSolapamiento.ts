import type { GenericDatabaseReader } from "convex/server";
import type { DataModel, Doc, Id } from "../_generated/dataModel";

/**
 * Verifica si un turno se solapa con otros del mismo profesional.
 */
export async function checkSolapamiento(
  db: GenericDatabaseReader<DataModel>,
  profesionalId: Id<"profesionales">,
  start: number,
  end: number,
  excludeId?: Id<"turnos">
): Promise<boolean> {
  // 🔹 Buscar solo turnos que puedan solaparse con el nuevo rango
  const candidatos = await db
    .query("turnos")
    .withIndex("byProfesional", (q) => q.eq("profesionalId", profesionalId))
    .filter((q) =>
      q.and(
        q.lt(q.field("end"), end + 24 * 60 * 60 * 1000), // hasta un día extra de margen
        q.gt(q.field("start"), start - 24 * 60 * 60 * 1000)
      )
    )
    .collect();

  // 🔹 Verificar solapamiento exacto
  return candidatos.some((t: Doc<"turnos">) =>
    t._id !== excludeId &&
    t.profesionalId === profesionalId &&
    // ✅ condición correcta: se solapan si uno empieza antes de que el otro termine
    //    y termina después de que el otro empieza
    t.start < end &&
    t.end > start
  );
}

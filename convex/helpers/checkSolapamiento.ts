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
  const candidatos = await db
    .query("turnos")
    .withIndex("byStart", (q) => q.lt("start", end))
    .collect();

  return candidatos.some((t: Doc<"turnos">) =>
    t.profesionalId === profesionalId &&
    t._id !== excludeId &&
    t.end > start // ⚡ se solapa si termina después de que arranca el nuevo
  );
}
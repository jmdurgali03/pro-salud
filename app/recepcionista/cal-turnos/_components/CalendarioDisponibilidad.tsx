"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function DisponibilidadProfesional({
  profesionalId,
  fecha,
  onSelect,
}: {
  profesionalId?: Id<"profesionales">;
  fecha?: string;
  onSelect: (inicio: number, fin: number) => void;
}) {
  const disponibles = useQuery(
    api.turnos.listarDisponibles,
    profesionalId && fecha ? { profesionalId, fecha } : "skip"
  );

  if (!profesionalId || !fecha)
    return <p className="text-sm text-gray-400 mt-2">Seleccione un profesional y una fecha.</p>;

  if (disponibles === undefined)
    return <p className="text-sm text-gray-400 mt-2">Cargando horarios...</p>;

  if (disponibles.length === 0)
    return <p className="text-sm text-gray-400 mt-2">No hay horarios disponibles.</p>;

  return (
    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {disponibles.map((b) => (
        <button
          key={b.inicio}
          onClick={() => onSelect(b.inicio, b.fin)}
          className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-sm font-medium transition-all"
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

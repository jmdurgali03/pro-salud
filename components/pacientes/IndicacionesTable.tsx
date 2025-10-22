"use client";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export type IndicRow = {
  _id: Id<"indicaciones">;
  fecha: number;
  tipo: "Estudio" | "Procedimiento" | "Derivación" | "Control";
  nombre: string;
  observaciones?: string;
  estado: "Pendiente" | "Realizada" | "Cancelada";
  profesionalId: Id<"profesionales">;
};

export default function IndicacionesTable({
  data,
  getProfesionalNombre,
  onEdit,                 // 👈 nuevo
}: {
  data: IndicRow[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
  onEdit?: (row: IndicRow) => void; // 👈 nuevo
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Indicación</th>
            <th className="px-3 py-2">Profesional</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Acción</th> {/* 👈 nueva */}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r._id} className="border-t">
              <td className="px-3 py-2">{format(r.fecha, "dd/MM/yy")}</td>
              <td className="px-3 py-2">{r.tipo}</td>
              <td className="px-3 py-2">
                <div className="font-medium">{r.nombre}</div>
                {r.observaciones && <div className="text-gray-500">{r.observaciones}</div>}
              </td>
              <td className="px-3 py-2">{getProfesionalNombre(r.profesionalId)}</td>
              <td className="px-3 py-2">{r.estado}</td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onEdit?.(r)}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-sm hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-gray-500">No hay indicaciones registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

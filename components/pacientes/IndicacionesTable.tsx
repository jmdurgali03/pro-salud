"use client";
import { format } from "date-fns";
import { Eye, Pencil } from "lucide-react";
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
  onView,
  onEdit,
}: {
  data: IndicRow[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
  onView?: (row: IndicRow) => void;
  onEdit?: (row: IndicRow) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-50">
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Indicación</th>
            <th className="px-3 py-2">Profesional</th>
            <th className="px-3 py-2">Acción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((r) => (
            <tr key={r._id}>
              <td className="px-3 py-2">{format(r.fecha, "dd/MM/yy")}</td>
              <td className="px-3 py-2">{r.tipo}</td>
              <td className="px-3 py-2">
                <div className="font-medium">{r.nombre}</div>
              </td>
              <td className="px-3 py-2">{getProfesionalNombre(r.profesionalId)}</td>

              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onView?.(r)}
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-sm hover:bg-cyan-50 transition"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50">
                      <Eye className="h-3.5 w-3.5 text-cyan-600 opacity-90" />
                    </span>
                    Ver
                  </button>

                  {onEdit && (
                    <button
                      onClick={() => onEdit?.(r)}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-sm hover:bg-cyan-50 transition"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50">
                        <Pencil className="h-3.5 w-3.5 text-cyan-600 opacity-90" />
                      </span>
                      Editar
                    </button>

                  )}
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                No hay indicaciones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

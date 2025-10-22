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
  diagnosticoId?: Id<"diagnosticos">; // ✅ NUEVO
};

export default function IndicacionesTable({
  data,
  getProfesionalNombre,
  getDiagnosticoDescripcion, // ✅ NUEVO
  onView,
  onEdit,
}: {
  data: IndicRow[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
  getDiagnosticoDescripcion?: (id?: Id<"diagnosticos">) => string | undefined; 
  onView?: (row: IndicRow) => void;
  onEdit?: (row: IndicRow) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-50">
            <th className="px-3 py-2 w-[100px]">Fecha</th>
            <th className="px-3 py-2 w-[150px]">Tipo</th>
            <th className="px-3 py-2 w-[300px]">Indicación</th>
            <th className="px-3 py-2 w-[260px]">Diagnóstico</th> 
            <th className="px-3 py-2 w-[200px]">Profesional</th>
            <th className="px-3 py-2 text-center w-[220px]">Acción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50">
              <td className="px-3 py-2">{format(r.fecha, "dd/MM/yy")}</td>
              <td className="px-3 py-2">{r.tipo}</td>
              <td className="px-3 py-2 font-medium truncate max-w-[250px]">{r.nombre}</td>
              <td className="px-3 py-2">
                {getDiagnosticoDescripcion?.(r.diagnosticoId) || "—"}
              </td>
              <td className="px-3 py-2">{getProfesionalNombre(r.profesionalId)}</td>

              <td className="px-3 py-2 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onView?.(r)}
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-sm hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center">
                      <Eye className="h-4 w-4 opacity-80" />
                    </span>
                    Ver
                  </button>

                  {onEdit && (
                    <button
                      onClick={() => onEdit?.(r)}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-medium text-cyan-700 shadow-sm hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center">
                        <Pencil className="h-4 w-4 opacity-80" />
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

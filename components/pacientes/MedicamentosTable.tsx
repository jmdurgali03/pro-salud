"use client";

import { format } from "date-fns";
import { Eye, Pencil } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export type MedRow = {
  _id: Id<"medicamentos">;
  fechaInicio: number;
  fechaFin?: number | null;
  estado: "Activo" | "Suspendido" | "Finalizado";
  nombreComercial?: string;
  droga: string;
  forma: string;
  dosis: string;
  frecuencia: string;
  duracion?: string;
  via?: string;
  indicaciones?: string;
  cronico?: boolean;
  notas?: string;
  profesionalId: Id<"profesionales">;
  indicacionId: Id<"indicaciones">;
  diagnosticoId?: Id<"diagnosticos">;
};

export default function MedicamentosTable({
  data,
  getProfesionalNombre,
  getIndicacionNombre,
  getDiagnosticoDescripcion,
  onView,
  onEdit,
}: {
  data: MedRow[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
  getIndicacionNombre: (id: Id<"indicaciones">) => string;
  getDiagnosticoDescripcion?: (id?: Id<"diagnosticos">) => string | undefined;
  onView?: (row: MedRow) => void;
  onEdit?: (row: MedRow) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-50">
            <th className="px-3 py-2 w-[100px]">Fecha</th>
            <th className="px-3 py-2 w-[220px]">Nombre</th>
            <th className="px-3 py-2 w-[220px]">Indicación</th>
            <th className="px-3 py-2 w-[180px]">Profesional</th>
            <th className="px-3 py-2 w-[120px]">Estado</th>
            <th className="px-3 py-2 text-center w-[220px]">Acción</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((r) => (
            <tr key={r._id} className="hover:bg-gray-50">
              <td className="px-3 py-2">{format(r.fechaInicio, "dd/MM/yy")}</td>
              <td className="px-3 py-2 font-medium truncate max-w-[200px]">
                {r.nombreComercial || r.droga}
              </td>
              <td className="px-3 py-2">{getIndicacionNombre(r.indicacionId)}</td>

              <td className="px-3 py-2">{getProfesionalNombre(r.profesionalId)}</td>

              <td className="px-3 py-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                    r.estado === "Activo"
                      ? "bg-purple-50 text-purple-700 ring-purple-200"
                      : r.estado === "Suspendido"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-gray-50 text-gray-700 ring-gray-200"
                  }`}
                >
                  {r.estado}
                </span>
              </td>

              {/* ✅ Botones lilas (alineados y con hover suave) */}
              <td className="px-3 py-2">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onView?.(r)}
                    className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center">
                      <Eye className="h-4 w-4 opacity-80" />
                    </span>
                    Ver
                  </button>

                  {onEdit && (
                    <button
                      onClick={() => onEdit?.(r)}
                      className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
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
              <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                No hay medicamentos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

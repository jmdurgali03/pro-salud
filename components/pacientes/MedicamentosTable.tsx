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
};

export default function MedicamentosTable({
  data,
  getProfesionalNombre,
  onView,
  onEdit,                     // 👈 nuevo
}: {
  data: MedRow[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
  onView?: (row: MedRow) => void;
  onEdit?: (row: MedRow) => void; // 👈 nuevo
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-50">
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Nombre</th>
            <th className="px-3 py-2">Profesional</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Acción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((r) => (
            <tr key={r._id}>
              <td className="px-3 py-2">{format(r.fechaInicio, "dd/MM/yy")}</td>
              <td className="px-3 py-2 font-medium">{r.nombreComercial || r.droga}</td>
              <td className="px-3 py-2">{getProfesionalNombre(r.profesionalId)}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                    r.estado === "Activo"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : r.estado === "Suspendido"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-gray-50 text-gray-700 ring-gray-200"
                  }`}
                >
                  {r.estado}
                </span>
              </td>
              <td className="px-3 py-2 space-x-2">
                <button
                  onClick={() => onView?.(r)}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <span className="inline-block h-4 w-4 rounded-full border border-gray-300 bg-gray-50">
                    <Eye className="h-4 w-4 translate-x-[1px] translate-y-[1px] opacity-70" />
                  </span>
                  Ver
                </button>
                <button
                  onClick={() => onEdit?.(r)}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                No hay medicamentos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

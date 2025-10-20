"use client";
import { format } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";

type Row = {
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
}: {
  data: Row[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
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
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-gray-500">No hay indicaciones registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

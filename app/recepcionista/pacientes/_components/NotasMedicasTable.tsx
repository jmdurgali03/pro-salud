// app/recepcionista/pacientes/_components/NotasMedicasTable.tsx
"use client";

import { Eye } from "lucide-react";

export type Nota = {
  _id: string;
  fecha?: number;
  categoria: "Evolución" | "Indicación" | "Interconsulta" | "Epicrisis" | "Administrativa";
  titulo?: string;
  profesionalId: string;
};

export default function NotasMedicasTable({
  data,
  getProfesionalNombre,
  onView,
}: {
  data: Nota[];
  getProfesionalNombre: (id: any) => string;
  onView?: (id: string) => void; // opcional (mantiene compatibilidad)
}) {
  const fmt = (ms?: number) =>
    ms ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(ms) : "—";

  const catColor = (c: Nota["categoria"]) => {
    switch (c) {
      case "Interconsulta":
        return "bg-cyan-50 text-cyan-700 ring-cyan-200";
      case "Indicación":
        return "bg-violet-50 text-violet-700 ring-violet-200";
      case "Evolución":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "Epicrisis":
        return "bg-amber-50 text-amber-700 ring-amber-200";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-200";
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="max-h-[500px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Profesional</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((n) => (
              <tr key={n._id} className="odd:bg-white even:bg-gray-50/40 hover:bg-sky-50/40 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">{fmt(n.fecha)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${catColor(
                      n.categoria
                    )}`}
                  >
                    {n.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900">{n.titulo ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">{getProfesionalNombre(n.profesionalId)}</td>
                <td className="px-4 py-3 text-right">
                  
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No hay notas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { Id } from "@/convex/_generated/dataModel";
import React, { useState } from "react";

export type Nota = {
  _id: Id<"observaciones">;
  pacienteId: Id<"pacientes">;
  profesionalId: Id<"profesionales">;
  consultaId?: Id<"consultas"> | null;
  fecha: number;
  categoria: "Evolución" | "Indicación" | "Interconsulta" | "Epicrisis" | "Administrativa";
  titulo?: string;
  texto: string;
};

export default function NotasMedicasTable({
  data,
  getProfesionalNombre,
}: {
  data: Nota[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
}) {
  const [expandId, setExpandId] = useState<string | null>(null);

  if (!data.length) {
    return <p className="text-sm text-gray-500">Sin notas registradas.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Profesional</th>

            <th className="px-4 py-3 w-24"></th>
          </tr>
        </thead>
        <tbody className="divide-y bg-white">
          {data
            .slice()
            .sort((a, b) => b.fecha - a.fecha)
            .map((n) => {
              const idStr = n._id as unknown as string;
              const abierto = expandId === idStr;

              return (
                <React.Fragment key={idStr}>
                  <tr className="align-top">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(n.fecha).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 border border-cyan-200">
                        {n.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {n.titulo || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getProfesionalNombre(n.profesionalId)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandId(abierto ? null : idStr)}
                        className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                      >
                        {abierto ? "Ocultar" : "Ver"}
                      </button>
                    </td>
                  </tr>

                  {abierto && (
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700" colSpan={6}>
                        <div className="whitespace-pre-wrap">{n.texto}</div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, ChevronRight, StickyNote, Copy } from "lucide-react";

type Consulta = {
  _id: Id<"consultas">;
  motivo: string;
  fecha: number;
  profesional: string;
  notas?: string;
};

type Diagnostico = {
  _id: Id<"diagnosticos">;
  consultaId: Id<"consultas">;
  descripcion: string;
  profesional: string;
  estado: "Presuntivo" | "Definitivo";
  fecha: number;
};

export default function ConsultasTable({
  data,
  dxByConsulta,
}: {
  data: Consulta[] | null | undefined;
  dxByConsulta: Map<string, Diagnostico[]>;
}) {
  const consultas = data ?? [];
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({});
  const [expandDx, setExpandDx] = useState<Record<string, boolean>>({});

  const toggleConsulta = (id: Id<"consultas">) => {
    const key = id as unknown as string;
    setAbiertas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDx = (id: Id<"diagnosticos">) => {
    const key = id as unknown as string;
    setExpandDx((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // sin ruido
    }
  };

  // Saca un resumen legible (~3-4 líneas o ~280 chars) respetando saltos
  const previewText = (full: string): { short: string; isShort: boolean } => {
    const MAX_CHARS = 280;
    const MAX_LINES = 4;

    const lines = full.split(/\r?\n/);
    let short = "";
    let used = 0;
    let usedLines = 0;

    for (const line of lines) {
      const remaining = MAX_CHARS - used;
      if (remaining <= 0 || usedLines >= MAX_LINES) break;

      // si la línea supera lo restante, la recortamos
      const slice = line.slice(0, Math.max(0, remaining));
      short += (short ? "\n" : "") + slice;
      used += slice.length;
      usedLines += 1;
    }

    const isShort = short.length >= full.length;
    if (!isShort && short.length > 0) short += "…";

    return { short, isShort };
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Motivo</th>
            <th className="px-3 py-2 text-left">Médico</th>
            <th className="px-3 py-2 text-left">Notas</th>
            <th className="px-3 py-2 text-left">Diagnósticos</th>
          </tr>
        </thead>
        <tbody>
          {consultas.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                No hay consultas registradas.
              </td>
            </tr>
          )}

          {consultas.map((c) => {
            const key = c._id as unknown as string;
            const abiertos = !!abiertas[key];
            const dx = dxByConsulta.get(key) ?? [];

            return (
              <>
                <tr key={key} className="border-t">
                  <td className="px-3 py-2">{new Date(c.fecha).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{c.motivo}</td>
                  <td className="px-3 py-2">{c.profesional}</td>
                  <td className="px-3 py-2">{c.notas ?? "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleConsulta(c._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {abiertos ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      Diagnósticos
                    </button>
                  </td>
                </tr>

                {abiertos && (
                  <tr>
                    <td colSpan={5} className="bg-gray-50/60 px-3 py-3">
                      {dx.length === 0 ? (
                        <div className="text-gray-500">Sin diagnósticos asignados a esta consulta.</div>
                      ) : (
                        <ul className="space-y-2">
                          {dx.map((d) => {
                            const dxKey = d._id as unknown as string;
                            const expanded = !!expandDx[dxKey];
                            const { short, isShort } = previewText(d.descripcion);

                            return (
                              <li
                                key={dxKey}
                                className="rounded-md border border-gray-200 bg-white p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="text-xs text-gray-500">
                                    {new Date(d.fecha).toLocaleDateString()} · {d.profesional}
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                      d.estado === "Definitivo"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}
                                  >
                                    {d.estado}
                                  </span>
                                </div>

                                {/* texto del diagnóstico */}
                                <div className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-5 text-gray-800">
                                  {expanded || isShort ? d.descripcion : short}
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  {!isShort && (
                                    <button
                                      onClick={() => toggleDx(d._id)}
                                      className="text-xs font-medium text-cyan-700 hover:underline"
                                      type="button"
                                    >
                                      {expanded ? "Ver menos" : "Ver completo"}
                                    </button>
                                  )}

                    
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

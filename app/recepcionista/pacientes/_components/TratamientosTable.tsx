"use client";
import { useMemo, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

export type Tratamiento = {
  _id: Id<"tratamientos">;
  pacienteId: Id<"pacientes">;
  profesional: string;
  titulo: string;
  indicaciones: string;
  fechaInicio: number;
  fechaFin?: number | null;
  estado: "Activo" | "Suspendido" | "Finalizado";
  cronico?: boolean;
  notas?: string;
};

export default function TratamientosTable({
  data,
  onChangeEstado,
}: {
  data: Tratamiento[] | null | undefined;
  onChangeEstado: (args: { id: Id<"tratamientos">; estado: Tratamiento["estado"] }) => Promise<void> | void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"Todos" | "Activo" | "Suspendido" | "Finalizado">("Todos");

  const tratamientos = useMemo(() => {
    const arr = (data ?? []).slice();
    arr.sort((a, b) => (a.estado === "Activo" ? -1 : 1) - (b.estado === "Activo" ? -1 : 1));
    return arr;
  }, [data]);

  const filtrados = useMemo(
    () => (filter === "Todos" ? tratamientos : tratamientos.filter((t) => t.estado === filter)),
    [filter, tratamientos]
  );

  const toggle = (id: Id<"tratamientos">) => {
    const key = id as unknown as string;
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(["Todos", "Activo", "Suspendido", "Finalizado"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
              filter === f ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Título</th>
              <th className="px-3 py-2 text-left">Profesional</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Inicio</th>
              <th className="px-3 py-2 text-left">Fin</th>
              <th className="px-3 py-2 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  {filter === "Todos" ? "Sin tratamientos registrados." : `Sin tratamientos ${filter.toLowerCase()}.`}
                </td>
              </tr>
            )}

            {filtrados.map((t) => {
              const key = t._id as unknown as string;
              const abierto = !!open[key];

              return (
                <>
                  <tr key={key} className="border-t">
                    <td className="px-3 py-2">{t.titulo}</td>
                    <td className="px-3 py-2">{t.profesional}</td>
                    <td className="px-3 py-2">
                      <select
                        className="rounded-md border border-gray-300 p-1 text-sm"
                        value={t.estado}
                        onChange={(e) => onChangeEstado({ id: t._id, estado: e.target.value as any })}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Suspendido">Suspendido</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">{new Date(t.fechaInicio).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      {t.cronico ? "— (crónico)" : t.fechaFin ? new Date(t.fechaFin).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggle(t._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {abierto ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        {abierto ? "Ocultar" : "Ver / editar"}
                      </button>
                    </td>
                  </tr>

                  {abierto && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50/60 px-3 py-3">
                        <div className="rounded-md border border-gray-200 bg-white p-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <div className="text-xs font-medium text-gray-500">Indicaciones</div>
                              <div className="whitespace-pre-wrap break-words text-[13px] leading-5 text-gray-800">
                                {t.indicaciones}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs font-medium text-gray-500">Notas de seguimiento</div>
                                <div className="whitespace-pre-wrap break-words text-[13px] leading-5 text-gray-800">
                                  {t.notas?.trim() || "—"}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {t.cronico ? "Tratamiento crónico" : "Tratamiento no crónico"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => copiar(`${t.titulo}\n${t.indicaciones}`)}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                              type="button"
                              title="Copiar indicaciones"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copiar indicaciones
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

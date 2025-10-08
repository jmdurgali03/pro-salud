"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import Modal, { CancelButton } from "./Modal";

export type Nota = {
  _id: string;
  fecha?: number;
  categoria:
    | "Evolución"
    | "Indicación"
    | "Interconsulta"
    | "Epicrisis"
    | "Administrativa";
  titulo?: string;
  texto?: string;
  profesionalId: string;
};

export default function NotasMedicasTable({
  data,
  getProfesionalNombre,
  onView,
}: {
  data: Nota[];
  getProfesionalNombre: (id: any) => string;
  onView?: (id: string) => void;
}) {
  const fmt = (ms?: number) =>
    ms
      ? new Intl.DateTimeFormat("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(ms)
      : "—";

  const fmtLargo = (ms?: number) =>
    ms
      ? new Intl.DateTimeFormat("es-AR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(ms)
      : "—";

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

  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Nota | null>(null);

  const verNota = (n: Nota) => {
    if (onView) {
      onView(n._id);
      return;
    }
    setSel(n);
    setOpen(true);
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Profesional</th>
                {/* ⬇️ ancho fijo + centrado para que no sobre espacio */}
                <th className="px-4 py-3 font-medium text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((n) => {
                const puedeVer = !!(n.titulo?.trim() || n.texto?.trim());
                return (
                  <tr
                    key={n._id}
                    className="odd:bg-white even:bg-gray-50/40 hover:bg-sky-50/40 transition-colors"
                  >
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
                    <td className="px-4 py-3 text-gray-700">
                      {getProfesionalNombre(n.profesionalId)}
                    </td>
                    {/* ⬇️ celda centrada para alinear el botón */}
                    <td className="px-4 py-3 text-center align-middle">
                      {puedeVer ? (
                        <button
                          type="button"
                          onClick={() => verNota(n)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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

      {/* Modal de lectura (si no se usa onView externo) */}
      {sel && !onView && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Nota médica"
          size="lg"
          footer={<CancelButton onClick={() => setOpen(false)} />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-gray-500">Fecha</div>
                <div className="text-sm font-medium text-gray-900">
                  {fmtLargo(sel.fecha)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Profesional</div>
                <div className="text-sm font-medium text-gray-900">
                  {getProfesionalNombre(sel.profesionalId) || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Categoría</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${catColor(
                      sel.categoria
                    )}`}
                  >
                    {sel.categoria}
                  </span>
                </div>
              </div>
              {sel.titulo?.trim() && (
                <div>
                  <div className="text-xs text-gray-500">Título</div>
                  <div className="text-sm font-medium text-gray-900">
                    {sel.titulo}
                  </div>
                </div>
              )}
            </div>

            {sel.texto?.trim() && (
              <div>
                <div className="mb-1 text-xs text-gray-500">Detalle</div>
                <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                  {sel.texto}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

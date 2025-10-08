"use client";

import { useMemo, useState } from "react";
import { Eye, FlaskConical } from "lucide-react";
import Modal, { CancelButton } from "./Modal";

type IdLike = string | { toString(): string };

type Consulta = {
  _id: IdLike;
  motivo: string;
  fecha: number;
  profesionalId: IdLike;
  notas?: string;
};

type Diagnostico = {
  _id: IdLike;
  consultaId: IdLike;
  descripcion: string;
  profesionalId: IdLike;
  estado: "Presuntivo" | "Definitivo";
  fecha: number;
};

export default function ConsultasTable({
  data,
  dxByConsulta,
  getProfesionalNombre,
}: {
  data: Consulta[];
  dxByConsulta: Map<string, Diagnostico[]>;
  getProfesionalNombre: (id: any) => string;
}) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<{
    consulta: Consulta;
    dx: Diagnostico[];
  } | null>(null);

  const fmt = (ms: number) =>
    new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(ms);

  const view = (c: Consulta) => {
    const key = (c._id as any).toString();
    const dx = dxByConsulta.get(key) ?? [];
    setSel({ consulta: c, dx });
    setOpen(true);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="max-h-[600px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Motivo</th>
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium text-center w-28">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((c) => {
              const dxCount = (dxByConsulta.get((c._id as any).toString()) ?? [])
                .length;
              return (
                <tr
                  key={(c._id as any).toString()}
                  className="odd:bg-white even:bg-gray-50/40 hover:bg-emerald-50/40 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{fmt(c.fecha)}</td>
                  <td className="px-4 py-3 text-gray-900">{c.motivo}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {getProfesionalNombre(c.profesionalId)}
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <button
                      onClick={() => view(c)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                      <span className="ml-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {dxCount}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No hay consultas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {sel && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Detalle de consulta"
          size="xl"
          footer={<CancelButton onClick={() => setOpen(false)} />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-gray-500">Fecha</div>
                <div className="text-sm font-medium text-gray-900">
                  {fmt(sel.consulta.fecha)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Médico</div>
                <div className="text-sm font-medium text-gray-900">
                  {getProfesionalNombre(sel.consulta.profesionalId)}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-gray-500">Motivo</div>
                <div className="text-sm font-medium text-gray-900">
                  {sel.consulta.motivo}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Notas</div>
              <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {sel.consulta.notas?.trim() || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">Diagnósticos</div>
              {sel.dx.length === 0 ? (
                <div className="text-sm text-gray-500">Sin diagnósticos.</div>
              ) : (
                <ul className="space-y-2">
                  {sel.dx.map((d) => (
                    <li
                      key={(d._id as any).toString()}
                      className="flex items-start justify-between gap-4 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200"
                    >
                      <div className="flex items-start gap-2">
                        <FlaskConical className="mt-0.5 h-4 w-4 text-emerald-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {d.descripcion}
                          </div>
                          <div className="text-xs text-gray-500">
                            {fmt(d.fecha)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={
                          d.estado === "Definitivo"
                            ? "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
                            : "inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200"
                        }
                      >
                        {d.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

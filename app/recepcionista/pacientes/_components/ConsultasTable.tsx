// app/recepcionista/pacientes/_components/ConsultasTable.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FlaskConical, Info } from "lucide-react";
import clsx from "clsx";

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
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [openDxRow, setOpenDxRow] = useState<string | null>(null);

  const formatDate = (ms: number) =>
    new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(ms);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="max-h-[600px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Motivo</th>
              <th className="px-4 py-3 font-medium">Médico</th>
              <th className="px-4 py-3 font-medium">Notas</th>
              <th className="px-4 py-3 font-medium">Diagnósticos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((c) => {
              const key = (c._id as any).toString();
              const dx = dxByConsulta.get((c._id as any).toString()) ?? [];
              const isOpen = openRow === key;
              const dxOpen = openDxRow === key;

              return (
                <FragmentRow
                  key={key}
                  onToggleDetail={() => setOpenRow(isOpen ? null : key)}
                  onToggleDx={() => setOpenDxRow(dxOpen ? null : key)}
                  isOpen={isOpen}
                  dxOpen={dxOpen}
                  consulta={c}
                  dx={dx}
                  getProfesionalNombre={getProfesionalNombre}
                  formatDate={formatDate}
                />
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No hay consultas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({
  consulta,
  dx,
  isOpen,
  dxOpen,
  onToggleDetail,
  onToggleDx,
  getProfesionalNombre,
  formatDate,
}: {
  consulta: Consulta;
  dx: Diagnostico[];
  isOpen: boolean;
  dxOpen: boolean;
  onToggleDetail: () => void;
  onToggleDx: () => void;
  getProfesionalNombre: (id: any) => string;
  formatDate: (ms: number) => string;
}) {
  const medico = getProfesionalNombre(consulta.profesionalId);
  const hasNotes = Boolean(consulta.notas?.trim());

  return (
    <>
      <tr className="odd:bg-white even:bg-gray-50/40 hover:bg-emerald-50/40 transition-colors">
        <td className="px-4 py-3 align-top whitespace-nowrap">{formatDate(consulta.fecha)}</td>
        <td className="px-4 py-3 align-top">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDetail}
              className={clsx(
                "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
                isOpen
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
              title={isOpen ? "Ocultar detalle" : "Ver detalle"}
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />} Detalle
            </button>
            <span className="font-medium text-gray-900">{consulta.motivo}</span>
          </div>
        </td>
        <td className="px-4 py-3 align-top text-gray-700">{medico}</td>
        <td className="px-4 py-3 align-top">
          {hasNotes ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
              <Info className="h-3.5 w-3.5" /> {consulta.notas!.length > 40 ? "Ver detalle" : consulta.notas}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-4 py-3 align-top">
          <button
            onClick={onToggleDx}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
              dxOpen
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            )}
            title={dxOpen ? "Ocultar diagnósticos" : "Ver diagnósticos"}
          >
            <FlaskConical className="h-4 w-4" /> Diagnósticos
            <span
              className={clsx(
                "ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                dx.length > 0 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
              )}
            >
              {dx.length}
            </span>
          </button>
        </td>
      </tr>

      {isOpen && (
        <tr className="bg-white">
          <td colSpan={5} className="px-4 pb-4">
            <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
              <div className="text-xs text-gray-500">
                {formatDate(consulta.fecha)} · {medico}
              </div>
              <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                {consulta.notas || "Sin notas registradas."}
              </div>
            </div>
          </td>
        </tr>
      )}

      {dxOpen && (
        <tr className="bg-white">
          <td colSpan={5} className="px-4 pb-4">
            <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4">
              {dx.length === 0 ? (
                <div className="text-sm text-gray-500">No hay diagnósticos para esta consulta.</div>
              ) : (
                <ul className="space-y-2">
                  {dx.map((d) => (
                    <li
                      key={(d._id as any).toString()}
                      className="flex items-start justify-between gap-4 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{d.descripcion}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(d.fecha)}
                        </div>
                      </div>
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                          d.estado === "Definitivo"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        )}
                      >
                        {d.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

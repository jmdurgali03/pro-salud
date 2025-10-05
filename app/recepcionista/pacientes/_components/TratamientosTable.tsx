// app/recepcionista/pacientes/_components/TratamientosTable.tsx
"use client";

import { useMemo } from "react";
import clsx from "clsx";

type Tratamiento = {
  _id: string;
  pacienteId: string;
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
  data: Tratamiento[];
  onChangeEstado: (p: { id: string; estado: Tratamiento["estado"] }) => Promise<void> | void;
}) {
  const fmt = (ms?: number | null) =>
    ms ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(ms) : "—";

  const estados: Tratamiento["estado"][] = ["Activo", "Suspendido", "Finalizado"];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Profesional</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Inicio</th>
              <th className="px-4 py-3 font-medium">Fin</th>

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((t) => (
              <tr key={t._id} className="odd:bg-white even:bg-gray-50/40 hover:bg-amber-50/40 transition-colors">
                <td className="px-4 py-3 text-gray-900">{t.titulo}</td>
                <td className="px-4 py-3 text-gray-700">{t.profesional || "—"}</td>
                <td className="px-4 py-3">
                  <EstadoSelect value={t.estado} onChange={(e) => onChangeEstado({ id: t._id, estado: e })} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(t.fechaInicio)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(t.fechaFin)}</td>

              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No hay tratamientos asignados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  function EstadoSelect({
    value,
    onChange,
  }: {
    value: Tratamiento["estado"];
    onChange: (e: Tratamiento["estado"]) => void;
  }) {
    const color = useMemo(() => {
      switch (value) {
        case "Activo":
          return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        case "Suspendido":
          return "bg-amber-50 text-amber-700 ring-amber-200";
        case "Finalizado":
          return "bg-gray-100 text-gray-700 ring-gray-300";
      }
    }, [value]);

    return (
      <div className={clsx("inline-flex items-center gap-2 rounded-full px-2.5 py-1 ring-1 ring-inset", color)}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Tratamiento["estado"])}
          className={clsx(
            "appearance-none bg-transparent text-xs font-semibold focus:outline-none cursor-pointer",
            "pr-5" // espacio visual
          )}
        >
          {estados.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    );
  }

}

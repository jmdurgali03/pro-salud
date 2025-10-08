"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Eye } from "lucide-react";
import Modal, { CancelButton } from "./Modal";

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
  onView,
}: {
  data: Tratamiento[];
  onChangeEstado: (p: { id: string; estado: Tratamiento["estado"] }) => Promise<void> | void;
  onView?: (id: string) => void; // opcional: si no viene, usamos modal interno
}) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Tratamiento | null>(null);

  const fmt = (ms?: number | null) =>
    ms ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(ms) : "—";

  const estados: Tratamiento["estado"][] = ["Activo", "Suspendido", "Finalizado"];

  const handleView = (t: Tratamiento) => {
    if (onView) {
      onView(t._id);
      return;
    }
    setSel(t);
    setOpen(true);
  };

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
              {/* Acciones centradas y ancho consistente */}
              <th className="px-4 py-3 font-medium text-center w-28">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((t) => (
              <tr
                key={t._id}
                className="odd:bg-white even:bg-gray-50/40 hover:bg-amber-50/40 transition-colors"
              >
                <td className="px-4 py-3 text-gray-900">{t.titulo}</td>
                <td className="px-4 py-3 text-gray-700">{t.profesional || "—"}</td>
                <td className="px-4 py-3">
                  <EstadoSelect
                    value={t.estado}
                    onChange={(e) => onChangeEstado({ id: t._id, estado: e })}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(t.fechaInicio)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(t.fechaFin)}</td>
                <td className="px-4 py-3 text-center align-middle">
                  <button
                    onClick={() => handleView(t)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                </td>
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

      {/* Modal interno de detalle (solo si no se pasó onView) */}
      {!onView && sel && (
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Detalle de tratamiento"
          size="xl"
          footer={<CancelButton onClick={() => setOpen(false)} />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs text-gray-500">Título</div>
                <div className="text-sm font-medium text-gray-900">{sel.titulo}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Profesional</div>
                <div className="text-sm font-medium text-gray-900">
                  {sel.profesional || "—"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Estado</div>
                <EstadoPill value={sel.estado} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Crónico</div>
                <div className="text-sm font-medium text-gray-900">
                  {sel.cronico ? "Sí" : "No"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Inicio</div>
                <div className="text-sm font-medium text-gray-900">{fmt(sel.fechaInicio)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Fin</div>
                <div className="text-sm font-medium text-gray-900">{fmt(sel.fechaFin)}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Indicaciones</div>
              <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {sel.indicaciones || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Notas de seguimiento</div>
              <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                {sel.notas || "—"}
              </div>
            </div>
          </div>
        </Modal>
      )}
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
      <div
        className={clsx(
          "inline-flex items-center gap-2 rounded-full px-2.5 py-1 ring-1 ring-inset",
          color
        )}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Tratamiento["estado"])}
          className={clsx(
            "appearance-none bg-transparent text-xs font-semibold focus:outline-none cursor-pointer",
            "pr-5"
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

  function EstadoPill({ value }: { value: Tratamiento["estado"] }) {
    const color = (() => {
      switch (value) {
        case "Activo":
          return "bg-emerald-50 text-emerald-700 ring-emerald-200";
        case "Suspendido":
          return "bg-amber-50 text-amber-700 ring-amber-200";
        case "Finalizado":
          return "bg-gray-100 text-gray-700 ring-gray-300";
      }
    })();

    return (
      <span
        className={clsx(
          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
          color
        )}
      >
        {value}
      </span>
    );
  }
}

"use client";

import { format } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";

export type DetalleIndicacionRow = {
  _id: Id<"indicaciones">;
  fecha: number;
  tipo: "Estudio" | "Procedimiento" | "Derivación" | "Control";
  nombre: string;
  observaciones?: string;
  estado: "Pendiente" | "Realizada" | "Cancelada";
  profesionalId: Id<"profesionales">;
  diagnosticoId?: Id<"diagnosticos">; // ✅ NUEVO
};

export default function DetalleIndicacionModal({
  open,
  onClose,
  ind,
  profesionalNombre,
  diagnosticoDescripcion, // ✅ NUEVO (texto “amigable” del Dx)
}: {
  open: boolean;
  onClose: () => void;
  ind: DetalleIndicacionRow | null;
  profesionalNombre: string;
  diagnosticoDescripcion?: string; // ✅ opcional: si no lo pasás, se muestra “—”
}) {
  if (!open || !ind) return null;

  const Item = ({
    label,
    children,
    highlight = false,
  }: {
    label: string;
    children: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight ? "border-cyan-200 bg-cyan-50/60" : "border-gray-200 bg-white"
      }`}
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm text-gray-900">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Detalle de indicación</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Nombre con celeste */}
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 px-4 py-3">
            <div className="text-xs text-gray-500">Nombre</div>
            <div className="mt-1 text-base font-semibold text-gray-900">
              {ind.nombre || "—"}
            </div>
          </div>

          {/* Fecha / Tipo */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Item label="Fecha">{ind.fecha ? format(ind.fecha, "dd/MM/yyyy") : "—"}</Item>
            <Item label="Tipo">{ind.tipo}</Item>
            <Item label="Médico">{profesionalNombre || "—"}</Item>
          </div>

          {/* ✅ Diagnóstico */}
          <div className="grid grid-cols-1">
            <Item label="Diagnóstico relacionado" highlight>
              {diagnosticoDescripcion?.trim() || "—"}
            </Item>
          </div>

          {/* Observaciones */}
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="text-xs text-gray-500">Observaciones</div>
            <div className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-sm text-gray-900">
              {ind.observaciones?.trim() ? ind.observaciones : "—"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

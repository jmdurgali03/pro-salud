// components/pacientes/NuevaIndicacionModal.tsx
"use client";
import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

type TipoIndic = "Estudio" | "Procedimiento" | "Derivación" | "Control";

export type IndicInitial = {
  fecha?: number;
  tipo?: TipoIndic;
  nombre?: string;
  observaciones?: string;
};

export default function NuevaIndicacionModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  fixedProfesionalId,
  mode = "create",
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fecha: number;
    tipo: TipoIndic;
    nombre: string;
    observaciones?: string;
  }) => Promise<void>;
  profesionales: { _id: Id<"profesionales">; nombre: string; apellido: string }[];
  fixedProfesionalId?: Id<"profesionales"> | undefined;
  mode?: "create" | "edit";
  initial?: IndicInitial;
}) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState<TipoIndic>("Estudio");
  const [nombre, setNombre] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setFecha((initial.fecha ? new Date(initial.fecha) : new Date()).toISOString().slice(0, 10));
      setTipo(initial.tipo ?? "Estudio");
      setNombre(initial.nombre ?? "");
      setObservaciones(initial.observaciones ?? "");
    } else {
      setFecha(new Date().toISOString().slice(0, 10));
      setTipo("Estudio");
      setNombre("");
      setObservaciones("");
    }
  }, [open, initial]);

  if (!open) return null;

  const disabled = !nombre.trim();

  const submit = async () => {
    await onSubmit({
      fecha: new Date(fecha).getTime(),
      tipo,
      nombre: nombre.trim(),
      observaciones: observaciones.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Editar indicación" : "Nueva indicación"}
          </h3>
          <button onClick={onClose} className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>

        <div className="grid gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoIndic)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option>Estudio</option>
                <option>Procedimiento</option>
                <option>Derivación</option>
                <option>Control</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Hemograma completo"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Observaciones (opcional)</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={disabled}
            onClick={submit}
            className="rounded-lg border border-cyan-200 bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === "edit" ? "Guardar cambios" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

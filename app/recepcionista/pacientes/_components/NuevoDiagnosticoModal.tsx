"use client";
import { useState } from "react";
import Modal from "./Modal";
import { Id } from "@/convex/_generated/dataModel";

type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  especialidadId?: Id<"especialidades">;
};

export default function NuevoDiagnosticoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  espNombrePorId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { descripcion: string; profesional: string }) => Promise<void> | void;
  profesionales: Profesional[];
  espNombrePorId: Map<Id<"especialidades">, string>;
}) {
  const [dxDesc, setDxDesc] = useState("");
  const [dxProf, setDxProf] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dxDesc.trim() || !dxProf) return;
    await onSubmit({ descripcion: dxDesc, profesional: dxProf });
    setDxDesc("");
    setDxProf("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar diagnóstico">
      <form onSubmit={handle} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-gray-700">Diagnóstico</label>
          <input
            value={dxDesc}
            onChange={(e) => setDxDesc(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            placeholder="Descripción del diagnóstico"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-700">Profesional</label>
          <select
            value={dxProf}
            onChange={(e) => setDxProf(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
          >
            <option value="">Seleccione un profesional</option>
            {profesionales.map((p) => {
              const espNombre = p.especialidadId ? espNombrePorId.get(p.especialidadId) : undefined;
              return (
                <option key={p._id} value={p.nombre}>
                  {p.nombre}
                  {espNombre ? ` — ${espNombre}` : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

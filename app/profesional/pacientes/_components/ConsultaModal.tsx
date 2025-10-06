"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Modal from "@/components/pacientes/Modal";

export default function ConsultaModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  espNombrePorId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    motivo: string;
    profesionalId: Id<"profesionales">;
    notas?: string;
  }) => Promise<unknown> | void; // ✅ se cambia a unknown para aceptar Promise<null>
  profesionales: any[];
  espNombrePorId: Map<Id<"especialidades">, string>;
}) {
  const [motivo, setMotivo] = useState("");
  const [prof, setProf] = useState<Id<"profesionales"> | "">("");
  const [notas, setNotas] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim() || !prof) return;
    await onSubmit({
      motivo,
      profesionalId: prof as Id<"profesionales">,
      notas: notas || undefined,
    });
    setMotivo("");
    setNotas("");
    setProf("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar consulta">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Motivo</label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            placeholder="Motivo de la consulta"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Profesional</label>
          <select
            value={prof}
            onChange={(e) => setProf(e.target.value as Id<"profesionales">)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            required
          >
            <option value="">Seleccione un profesional</option>
            {profesionales.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre}
                {p.especialidadId ? ` — ${espNombrePorId.get(p.especialidadId)}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Notas (opcional)</label>
          <input
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            placeholder="Observaciones"
          />
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

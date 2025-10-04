"use client";
import { useState } from "react";
import Modal from "./Modal";
import { Id } from "@/convex/_generated/dataModel";

type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  apellido: string;
  especialidadId?: Id<"especialidades">;
};

export default function NuevaConsultaModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  espNombrePorId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { motivo: string; profesionalId: Id<"profesionales">; notas?: string }) => Promise<void> | void;
  profesionales: Profesional[];
  espNombrePorId: Map<Id<"especialidades">, string>;
}) {
  const [motivo, setMotivo] = useState("");
  const [profConsulta, setProfConsulta] = useState<Id<"profesionales"> | "">("");
  const [notas, setNotas] = useState("");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim() || !profConsulta) return;
    await onSubmit({
      motivo,
      profesionalId: profConsulta as Id<"profesionales">,
      notas: notas || undefined,
    });
    setMotivo("");
    setNotas("");
    setProfConsulta("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar consulta">
      <form onSubmit={handle} className="space-y-3">
        {/* Motivo */}
        <div>
          <label className="mb-1 block text-sm text-gray-700">Motivo</label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            placeholder="Motivo de la consulta"
            required
          />
        </div>

        {/* Profesional y Notas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Profesional</label>
            <select
              value={profConsulta}
              onChange={(e) => setProfConsulta(e.target.value as Id<"profesionales">)}
              className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
              required
            >
              <option value="">Seleccione un profesional</option>
              {profesionales.map((p) => {
                const espNombre = p.especialidadId ? espNombrePorId.get(p.especialidadId) : undefined;
                return (
                  <option key={p._id} value={p._id}>
                    {p.nombre} {p.apellido}
                    {espNombre ? ` — ${espNombre}` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Notas (opcional)</label>
            <input
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
              placeholder="Observaciones"
            />
          </div>
        </div>

        {/* Botones */}
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

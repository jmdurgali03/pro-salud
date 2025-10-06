"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import Modal from "@/components/pacientes/Modal";

export default function DiagnosticoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  espNombrePorId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    descripcion: string;
    profesionalId: Id<"profesionales">;
  }) => Promise<unknown> | void; // ✅ se cambia aquí también
  profesionales: any[];
  espNombrePorId: Map<Id<"especialidades">, string>;
}) {
  const [desc, setDesc] = useState("");
  const [prof, setProf] = useState<Id<"profesionales"> | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !prof) return;
    await onSubmit({
      descripcion: desc,
      profesionalId: prof as Id<"profesionales">,
    });
    setDesc("");
    setProf("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar diagnóstico">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Diagnóstico</label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            placeholder="Descripción del diagnóstico"
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
      </form>
    </Modal>
  );
}

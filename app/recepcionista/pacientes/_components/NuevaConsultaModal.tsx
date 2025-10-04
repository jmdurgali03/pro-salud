"use client";

import { useMemo, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  apellido: string;
  especialidadId?: Id<"especialidades"> | null;
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
  onSubmit: (data: {
    motivo: string;
    profesionalId: Id<"profesionales">;
    notas?: string;
  }) => Promise<void> | void;
  profesionales: Profesional[];
  espNombrePorId: Map<Id<"especialidades">, string>;
}) {
  const [motivo, setMotivo] = useState("");
  const [profesionalId, setProfesionalId] = useState<Id<"profesionales"> | "">("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  const puedeGuardar = motivo.trim().length > 2 && !!profesionalId;

  const opciones = useMemo(() => {
    return (profesionales || []).map((p) => {
      const espNombre = p.especialidadId ? espNombrePorId.get(p.especialidadId) : undefined;
      return {
        id: p._id,
        label: `${p.apellido}, ${p.nombre}${espNombre ? ` — ${espNombre}` : ""}`,
      };
    });
  }, [profesionales, espNombrePorId]);

  const guardar = async () => {
    if (!puedeGuardar || guardando || !profesionalId) return;
    setGuardando(true);
    try {
      await onSubmit({
        motivo: motivo.trim(),
        profesionalId,
        notas: notas.trim() || undefined,
      });
      onClose();
      setMotivo("");
      setProfesionalId("");
      setNotas("");
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nueva consulta</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Motivo</label>
            <input
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              placeholder="Ej: Dolor abdominal, control, etc."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              value={(profesionalId as string) || ""}
              onChange={(e) => setProfesionalId(e.target.value as unknown as Id<"profesionales">)}
            >
              <option value="">Seleccioná un profesional…</option>
              {opciones.map((o) => (
                <option key={o.id as unknown as string} value={o.id as unknown as string}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notas (opcional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              rows={4}
              placeholder="Observaciones, signos, antecedentes, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={!puedeGuardar || guardando}
            className={`rounded-lg px-4 py-2 text-sm text-white ${
              puedeGuardar ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-300"
            }`}
          >
            Guardar consulta
          </button>
        </div>
      </div>
    </div>
  );
}

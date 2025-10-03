"use client";
import { useState } from "react";

export default function NuevoTratamientoModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    titulo: string;
    profesional: string;
    indicaciones?: string;
    fechaInicio?: number;
    fechaFin?: number;
  }) => Promise<void> | void;
}) {
  const [titulo, setTitulo] = useState("");
  const [profesional, setProfesional] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  if (!open) return null;

  const canSave = titulo.trim().length > 2 && profesional.trim().length > 1;

  const guardar = async () => {
    if (!canSave) return;
    setGuardando(true);
    try {
      await onSubmit({ titulo, profesional, indicaciones });
      setTitulo("");
      setProfesional("");
      setIndicaciones("");
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nuevo tratamiento</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
        <input
          className="mb-4 w-full rounded-lg border border-gray-300 p-2 text-sm"
          placeholder="Ej: Amoxicilina 500mg cada 8h por 7 días"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
        <input
          className="mb-4 w-full rounded-lg border border-gray-300 p-2 text-sm"
          placeholder="Nombre del profesional"
          value={profesional}
          onChange={(e) => setProfesional(e.target.value)}
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Indicaciones</label>
        <textarea
          className="mb-6 w-full rounded-lg border border-gray-300 p-2 text-sm"
          rows={3}
          placeholder="Dosis, duración, cuidados, etc."
          value={indicaciones}
          onChange={(e) => setIndicaciones(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={!canSave || guardando}
            className={`rounded-lg px-4 py-2 text-sm text-white ${
              canSave ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-300"
            }`}
          >
            Guardar tratamiento
          </button>
        </div>
      </div>
    </div>
  );
}

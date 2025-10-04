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

type Consulta = {
  _id: Id<"consultas">;
  motivo: string;
  fecha: number;
  profesional: string;
};

export default function NuevoDiagnosticoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  espNombrePorId,
  consultas,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    consultaId: Id<"consultas">;
    descripcion: string;
    profesional: string;
    estado: "Presuntivo" | "Definitivo";
  }) => Promise<void> | void;
  profesionales: Profesional[];
  espNombrePorId: Map<Id<"especialidades">, string>;
  consultas: Consulta[];
}) {
  const [consultaId, setConsultaId] = useState("");
  const [profesional, setProfesional] = useState("");
  const [estado, setEstado] = useState<"Presuntivo" | "Definitivo">("Presuntivo");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultaId || !profesional || !descripcion.trim()) return;

    await onSubmit({
      consultaId: consultaId as Id<"consultas">,
      descripcion,
      profesional,
      estado,
    });

    setConsultaId("");
    setProfesional("");
    setDescripcion("");
    setEstado("Presuntivo");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar diagnóstico">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Consulta */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Consulta</label>
          <select
            value={consultaId}
            onChange={(e) => setConsultaId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            required
          >
            <option value="">Seleccione una consulta</option>
            {consultas.map((c) => (
              <option key={c._id} value={c._id}>
                {new Date(c.fecha).toLocaleDateString()} — {c.motivo}
              </option>
            ))}
          </select>
        </div>

        {/* Profesional */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
          <select
            value={profesional}
            onChange={(e) => setProfesional(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            required
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

        {/* Estado */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as "Presuntivo" | "Definitivo")}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
          >
            <option value="Presuntivo">Presuntivo</option>
            <option value="Definitivo">Definitivo</option>
          </select>
        </div>

        {/* Diagnóstico (textarea grande) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Diagnóstico</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 resize-y min-h-[150px]"
            placeholder="Escriba la descripción completa del diagnóstico..."
            required
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!consultaId || !profesional || !descripcion.trim()}
            className="rounded-lg bg-cyan-600 px-5 py-2 font-medium text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

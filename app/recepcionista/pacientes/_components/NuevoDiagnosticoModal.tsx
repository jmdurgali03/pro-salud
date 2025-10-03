"use client";
import { useState } from "react";
import Modal from "./Modal";
import { Id } from "@/convex/_generated/dataModel";

/* Tipos */
type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  especialidadId?: Id<"especialidades">;
};

type ConsultaLite = {
  _id: Id<"consultas">;
  motivo: string;
  fecha: number;
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
    fecha?: number;
  }) => Promise<void> | void;
  profesionales: Profesional[];
  espNombrePorId: Map<Id<"especialidades">, string>;
  consultas: ConsultaLite[];
}) {
  const [consultaId, setConsultaId] = useState<Id<"consultas"> | "">(
    consultas?.[0]?._id ?? ""
  );
  const [dxDesc, setDxDesc] = useState("");
  const [dxProf, setDxProf] = useState("");
  const [estado, setEstado] = useState<"Presuntivo" | "Definitivo">("Presuntivo");
  const [enviando, setEnviando] = useState(false);

  const puedeGuardar =
    consultaId !== "" && dxDesc.trim().length > 2 && dxProf.trim().length > 1;

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeGuardar || consultaId === "") return;
    setEnviando(true);
    try {
      await onSubmit({
        consultaId: consultaId as Id<"consultas">,
        descripcion: dxDesc,
        profesional: dxProf,
        estado,
      });
      // reset
      setDxDesc("");
      setDxProf("");
      setEstado("Presuntivo");
      setConsultaId(consultas?.[0]?._id ?? "");
      onClose();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar diagnóstico">
      <form onSubmit={handle} className="space-y-3">
        {/* Consulta obligatoria */}
        <div>
          <label className="mb-1 block text-sm text-gray-700">Consulta</label>
          <select
            value={consultaId}
            onChange={(e) => setConsultaId(e.target.value as unknown as Id<"consultas">)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            required
          >
            {consultas.map((c) => (
              <option key={c._id} value={c._id}>
                {new Date(c.fecha).toLocaleDateString()} — {c.motivo}
              </option>
            ))}
          </select>
          {consultas.length === 0 && (
            <p className="mt-1 text-sm text-amber-600">
              Primero registrá una consulta para poder cargar un diagnóstico.
            </p>
          )}
        </div>

        {/* Profesional */}
        <div>
          <label className="mb-1 block text-sm text-gray-700">Profesional</label>
          <select
            value={dxProf}
            onChange={(e) => setDxProf(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
            required
          >
            <option value="">Seleccione un profesional</option>
            {profesionales.map((p) => {
              const espNombre = p.especialidadId
                ? espNombrePorId.get(p.especialidadId)
                : undefined;
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
          <label className="mb-1 block text-sm text-gray-700">Estado</label>
          <select
            value={estado}
            onChange={(e) =>
              setEstado(e.target.value as "Presuntivo" | "Definitivo")
            }
            className="w-full rounded-lg border border-gray-300 p-2 text-gray-900"
          >
            <option value="Presuntivo">Presuntivo</option>
            <option value="Definitivo">Definitivo</option>
          </select>
        </div>

        {/* Descripción */}
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
            disabled={!puedeGuardar || enviando}
            className={`rounded-lg px-4 py-2 font-medium text-white ${
              puedeGuardar ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-300"
            }`}
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

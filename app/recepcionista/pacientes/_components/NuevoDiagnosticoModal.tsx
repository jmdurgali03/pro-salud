// app/recepcionista/pacientes/_components/NuevoDiagnosticoModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  apellido: string;
  especialidadId?: Id<"especialidades"> | null;
};

type Consulta = {
  _id: Id<"consultas">;
  motivo: string;
  fecha: number;
  profesionalId: Id<"profesionales">;
};

export default function NuevoDiagnosticoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  consultas,
  getProfesionalNombre,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    consultaId: Id<"consultas">;
    profesionalId: Id<"profesionales">;
    estado: "Presuntivo" | "Definitivo";
    descripcion: string;
    fecha?: number;
  }) => Promise<void> | void;
  profesionales: Profesional[];
  consultas: Consulta[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
}) {
  const [consultaId, setConsultaId] = useState<Id<"consultas"> | "">("");
  const [profesionalId, setProfesionalId] = useState<Id<"profesionales"> | "">("");
  const [estado, setEstado] = useState<"Presuntivo" | "Definitivo">("Presuntivo");
  const [descripcion, setDescripcion] = useState("");
  const [fechaStr, setFechaStr] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setConsultaId("");
      setProfesionalId("");
      setEstado("Presuntivo");
      setDescripcion("");
      const hoy = new Date();
      const iso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      setFechaStr(iso);
    }
  }, [open]);

  const puedeGuardar =
    !!consultaId &&
    !!profesionalId &&
    descripcion.trim().length > 3;

  const consultasOpts = useMemo(() => {
    return (consultas ?? []).map((c) => ({
      id: c._id,
      label: `${new Date(c.fecha).toLocaleDateString()} — ${c.motivo}`,
    }));
  }, [consultas]);

  const profesionalesOpts = useMemo(() => {
    return (profesionales ?? []).map((p) => ({
      id: p._id,
      label: getProfesionalNombre(p._id),
    }));
  }, [profesionales, getProfesionalNombre]);

  const toTs = (d?: string) => {
    if (!d) return undefined;
    let iso = d.trim();
    if (iso.includes("/")) {
      const [dd, mm, yyyy] = iso.split("/");
      if (yyyy && mm && dd) iso = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    const ms = Date.parse(`${iso}T00:00:00`);
    return Number.isFinite(ms) ? ms : undefined;
  };

  const handleSubmit = async () => {
    if (!puedeGuardar || guardando || !consultaId || !profesionalId) return;
    setGuardando(true);
    try {
      await onSubmit({
        consultaId,
        profesionalId,
        estado,
        descripcion: descripcion.trim(),
        fecha: toTs(fechaStr),
      });
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Registrar diagnóstico</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Consulta</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              value={(consultaId as string) || ""}
              onChange={(e) => setConsultaId(e.target.value as unknown as Id<"consultas">)}
            >
              <option value="">Seleccioná una consulta…</option>
              {consultasOpts.map((o) => (
                <option key={o.id as unknown as string} value={o.id as unknown as string}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                value={(profesionalId as string) || ""}
                onChange={(e) => setProfesionalId(e.target.value as unknown as Id<"profesionales">)}
              >
                <option value="">Seleccioná un profesional…</option>
                {profesionalesOpts.map((o) => (
                  <option key={o.id as unknown as string} value={o.id as unknown as string}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
              >
                <option value="Presuntivo">Presuntivo</option>
                <option value="Definitivo">Definitivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                value={fechaStr}
                onChange={(e) => setFechaStr(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Diagnóstico</label>
            <textarea
              className="min-h-[140px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 whitespace-pre-wrap"
              placeholder="Descripción del diagnóstico…"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!puedeGuardar || guardando}
            className={`rounded-lg px-4 py-2 text-sm text-white ${
              puedeGuardar ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-300"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

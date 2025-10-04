"use client";
import { useEffect, useMemo, useState } from "react";

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
    indicaciones: string;
    fechaInicio?: number;
    fechaFin?: number | null;
    estado: "Activo" | "Suspendido" | "Finalizado";
    cronico?: boolean;
    notas?: string;
  }) => Promise<void> | void;
}) {
  const [titulo, setTitulo] = useState("");
  const [profesional, setProfesional] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [estado, setEstado] = useState<"Activo" | "Suspendido" | "Finalizado">("Activo");
  const [cronico, setCronico] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Prefija hoy en formato YYYY-MM-DD al abrir
  useEffect(() => {
    if (open) {
      const hoy = new Date();
      const iso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      setFechaInicio(iso);
      setFechaFin("");
      setEstado("Activo");
      setCronico(false);
      setTitulo("");
      setProfesional("");
      setIndicaciones("");
      setNotas("");
    }
  }, [open]);

  const puedeGuardar = useMemo(
    () => titulo.trim().length > 2 && profesional.trim().length > 1 && indicaciones.trim().length > 5,
    [titulo, profesional, indicaciones]
  );

  // Acepta "YYYY-MM-DD" o "DD/MM/YYYY" y devuelve timestamp a medianoche local
  const toTs = (d?: string) => {
    if (!d) return undefined;
    let iso = d.trim();
    if (iso.includes("/")) {
      const [dd, mm, yyyy] = iso.split("/");
      if (yyyy && mm && dd) iso = `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    const ms = Date.parse(`${iso}T00:00:00`);
    return Number.isFinite(ms) ? ms : undefined;
  };

  const guardar = async () => {
    if (!puedeGuardar || guardando) return;
    setGuardando(true);
    try {
      await onSubmit({
        titulo,
        profesional,
        indicaciones,
        estado,
        cronico,
        fechaInicio: toTs(fechaInicio),
        fechaFin: cronico ? null : toTs(fechaFin),
        notas: notas?.trim() || undefined,
      });
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Asignar tratamiento</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
              <input
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                placeholder="Ej: Antibiótico oral / Fisioterapia de hombro"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
              <input
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                placeholder="Nombre del profesional"
                value={profesional}
                onChange={(e) => setProfesional(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de inicio</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className={cronico ? "opacity-50" : ""}>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha estimada de fin</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 p-2 text-sm disabled:opacity-50"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={cronico}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>

            <label className="mt-6 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={cronico}
                onChange={(e) => setCronico(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Tratamiento crónico (sin fecha de fin)
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Indicaciones</label>
            <textarea
              className="min-h-[200px] w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 whitespace-pre-wrap"
              placeholder="Dosis, frecuencia, duración, medidas complementarias, controles, etc."
              value={indicaciones}
              onChange={(e) => setIndicaciones(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">Podés escribir un texto largo y usar Enter para saltos de línea.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notas de seguimiento (opcional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              rows={3}
              placeholder="Efectos adversos, cambios de dosis, adherencia, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
          <button
            onClick={guardar}
            disabled={!puedeGuardar || guardando}
            className={`rounded-lg px-4 py-2 text-sm text-white ${
              puedeGuardar ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-300"
            }`}
          >
            Guardar tratamiento
          </button>
        </div>
      </div>
    </div>
  );
}

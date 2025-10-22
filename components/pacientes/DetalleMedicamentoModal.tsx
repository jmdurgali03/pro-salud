"use client";

import { MedRow } from "./MedicamentosTable";

const fmt = (n?: number | null) =>
  n
    ? new Date(n).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

export default function DetalleMedicamentoModal({
  open,
  onClose,
  med,
  profesionalNombre,
  onChangeEstado,
  saving = false,
  indicacionNombre,        // ✅ NUEVO
  diagnosticoDescripcion,  // ✅ NUEVO (opcional)
}: {
  open: boolean;
  onClose: () => void;
  med: MedRow | null;
  profesionalNombre: string;
  onChangeEstado?: (estado: MedRow["estado"]) => Promise<void>;
  saving?: boolean;
  indicacionNombre?: string;        // ✅
  diagnosticoDescripcion?: string;  // ✅
}) {
  if (!open || !med) return null;
  const handleChangeEstado = onChangeEstado ?? (async () => {});

  const badge =
    med.estado === "Activo"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : med.estado === "Suspendido"
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-gray-50 text-gray-700 ring-1 ring-gray-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3">
      {/* Contenedor del modal con alto máximo y layout en columnas */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header (fijo) */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Detalle de medicamento</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body con scroll interno */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Nombre + Estado */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs text-gray-500">Nombre</div>
              <div className="text-xl font-semibold text-gray-900">
                {med.nombreComercial || med.droga}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge}`}>
                {med.estado}
              </span>
              <select
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                defaultValue={med.estado}
                disabled={saving}
                onChange={async (e) => {
                  await handleChangeEstado(e.target.value as MedRow["estado"]);
                }}
              >
                <option value="Activo">Cambiar a: Activo</option>
                <option value="Suspendido">Cambiar a: Suspendido</option>
                <option value="Finalizado">Cambiar a: Finalizado</option>
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="text-xs font-medium text-emerald-900">Inicio</div>
              <div className="text-base font-semibold text-gray-900">{fmt(med.fechaInicio)}</div>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <div className="text-xs font-medium text-sky-900">Fin</div>
              <div className="text-base font-semibold text-gray-900">{fmt(med.fechaFin)}</div>
            </div>
          </div>

          {/* Grid info */}
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <Info label="Profesional" value={profesionalNombre} />
            <Info label="Droga" value={med.droga} />
            <Info label="Forma" value={med.forma} />
            <Info label="Dosis" value={med.dosis} />
            <Info label="Frecuencia" value={med.frecuencia} />
            <Info label="Duración" value={med.cronico ? "—" : med.duracion || "—"} />
            <Info label="Vía" value={med.via || "—"} />
            <Info label="Crónico" value={med.cronico ? "Sí" : "No"} />
          </div>

          {/* ✅ Indicación y Diagnóstico */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Info label="Indicación vinculada" value={indicacionNombre || "—"} />
          </div>

          {/* Indicaciones / Notas */}
          <div className="mt-6 grid gap-6">
            <Block label="Indicaciones" value={med.indicaciones || "—"} />
            <Block label="Notas" value={med.notas || "—"} />
          </div>
        </div>

        {/* Footer (fijo) */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <div className="text-[11px] font-medium text-gray-600">{label}</div>
      <div className="mt-0.5 font-semibold text-gray-900 break-words">{value}</div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <div className="text-[11px] font-medium text-gray-600">{label}</div>
      <div className="mt-1 whitespace-pre-wrap break-words text-gray-800">{value}</div>
    </div>
  );
}

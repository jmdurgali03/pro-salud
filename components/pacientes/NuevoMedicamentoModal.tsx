"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

/* ====== Utilidades ====== */
const toISO = (d: Date) => d.toISOString().slice(0, 10);
const fromISO = (s: string) => new Date(s + "T00:00:00");
const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = fromISO(iso);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
const parseDDMMYYYY = (val: string) => {
  const [day, month, year] = val.split("/").map(Number);
  if (!day || !month || !year) return toISO(new Date());
  const d = new Date(year, month - 1, day);
  return toISO(d);
};
const addAmount = (
  dateISO: string,
  amount: number,
  unit: "día(s)" | "semana(s)" | "mes(es)"
) => {
  const d = fromISO(dateISO);
  if (unit === "día(s)") d.setDate(d.getDate() + amount);
  if (unit === "semana(s)") d.setDate(d.getDate() + amount * 7);
  if (unit === "mes(es)") d.setMonth(d.getMonth() + amount);
  return toISO(d);
};
const diffAs = (startISO: string, endISO: string) => {
  const s = fromISO(startISO);
  const e = fromISO(endISO);
  const ms = e.getTime() - s.getTime();
  if (ms <= 0) return { value: 0, unit: "día(s)" as const };
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days % 30 === 0)
    return { value: Math.round(days / 30), unit: "mes(es)" as const };
  if (days % 7 === 0)
    return { value: Math.round(days / 7), unit: "semana(s)" as const };
  return { value: days, unit: "día(s)" as const };
};

type Forma =
  | "Comprimidos"
  | "Cápsulas"
  | "Jarabe"
  | "Solución"
  | "Inyectable"
  | "Pomada"
  | "Otro";

export type MedInitial = {
  fechaInicio?: number;
  fechaFin?: number | null;
  nombreComercial?: string;
  droga?: string;
  forma?: Forma | string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  via?: string;
  indicaciones?: string;
  cronico?: boolean;
  notas?: string;
  indicacionId?: Id<"indicaciones">;
  diagnosticoId?: Id<"diagnosticos">;
};

function parseDur(d?: string): { val: string; uni: "día(s)" | "semana(s)" | "mes(es)" } {
  if (!d) return { val: "", uni: "día(s)" };
  const m = d.match(/^(\d+)\s+(.+)$/);
  const uni = (m?.[2] as any) || "día(s)";
  return { val: m?.[1] ?? "", uni };
}

export default function NuevoMedicamentoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  fixedProfesionalId,
  indicaciones,
  diagnosticos,
  mode = "create",
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    indicacionId: Id<"indicaciones">;
    diagnosticoId?: Id<"diagnosticos">;
    fechaInicio: number;
    fechaFin?: number | null;
    estado: "Activo" | "Suspendido" | "Finalizado";
    nombreComercial?: string;
    droga: string;
    forma: Forma;
    dosis: string;
    frecuencia: string;
    duracion?: string;
    via?: string;
    indicaciones?: string;
    cronico?: boolean;
    notas?: string;
  }) => Promise<void>;
  profesionales: { _id: Id<"profesionales">; nombre: string; apellido: string }[];
  fixedProfesionalId?: Id<"profesionales"> | undefined;
  indicaciones: { _id: Id<"indicaciones">; nombre: string }[];
  diagnosticos: { _id: Id<"diagnosticos">; descripcion: string }[];
  mode?: "create" | "edit";
  initial?: MedInitial;
}) {
  const defaults = (seed?: MedInitial) => {
    const today = toISO(new Date());
    const dur = parseDur(seed?.duracion);
    return {
      inicio: seed?.fechaInicio ? toISO(new Date(seed.fechaInicio)) : today,
      fin: seed?.fechaFin ? toISO(new Date(seed.fechaFin)) : "",
      nombreComercial: seed?.nombreComercial ?? "",
      droga: seed?.droga ?? "",
      forma: (seed?.forma as Forma) ?? "Comprimidos",
      via: seed?.via ?? "",
      indicacionesTxt: seed?.indicaciones ?? "",
      cronico: seed?.cronico ?? (!seed?.fechaFin && !!seed?.fechaInicio),
      notas: seed?.notas ?? "",
      dosisStr: seed?.dosis ?? "",
      freqStr: seed?.frecuencia ?? "",
      durVal: dur.val,
      durUni: dur.uni,
      indicacionId: seed?.indicacionId ?? (indicaciones[0]?._id ?? undefined),
      diagnosticoId: seed?.diagnosticoId ?? undefined,
    };
  };

  const [state, setState] = useState(defaults(initial));
  const changingFromDur = useRef(false);
  const changingFromFin = useRef(false);

  useEffect(() => {
    if (open) setState(defaults(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.fechaInicio, initial?.fechaFin]);

  useEffect(() => {
    if (state.cronico) return;
    const v = parseInt(state.durVal || "", 10);
    if (!isFinite(v) || v <= 0) return;
    const newFin = addAmount(state.inicio, v, state.durUni);
    if (newFin === state.fin) return;
    changingFromDur.current = true;
    setState((s) => ({ ...s, fin: newFin }));
    setTimeout(() => (changingFromDur.current = false), 0);
  }, [state.durVal, state.durUni, state.inicio, state.cronico]);

  useEffect(() => {
    if (!state.fin || state.cronico) return;
    if (changingFromDur.current) return;
    const { value, unit } = diffAs(state.inicio, state.fin);
    if (value <= 0) return;
    if (String(value) === state.durVal && unit === state.durUni) return;
    changingFromFin.current = true;
    setState((s) => ({ ...s, durVal: String(value), durUni: unit }));
    setTimeout(() => (changingFromFin.current = false), 0);
  }, [state.fin, state.inicio, state.cronico, state.durVal, state.durUni]);

  const disabled = useMemo(() => {
    return (
      !state.droga.trim() ||
      !state.inicio ||
      !state.dosisStr.trim() ||
      !state.freqStr.trim() ||
      !state.indicacionId
    );
  }, [state]);

  if (!open) return null;

  const submit = async () => {
    const composed = {
      indicacionId: state.indicacionId!, // requerido
      diagnosticoId: state.diagnosticoId || undefined, // opcional
      fechaInicio: fromISO(state.inicio).getTime(),
      fechaFin: state.cronico || !state.fin ? null : fromISO(state.fin).getTime(),
      estado: "Activo" as const,
      nombreComercial: state.nombreComercial.trim() || undefined,
      droga: state.droga.trim(),
      forma: state.forma,
      dosis: state.dosisStr.trim(),
      frecuencia: state.freqStr.trim(),
      duracion:
        state.cronico || !state.durVal
          ? undefined
          : `${state.durVal} ${state.durUni}`,
      via: state.via.trim() || undefined,
      indicaciones: state.indicacionesTxt.trim() || undefined,
      cronico: state.cronico,
      notas: state.notas.trim() || undefined,
    };
    await onSubmit(composed);
    onClose();
  };

  const set = <K extends keyof typeof state>(k: K, v: (typeof state)[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-3">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Editar medicamento" : "Nuevo medicamento"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-purple-500 hover:bg-purple-50 hover:text-purple-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Body con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Selección de vínculos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Indicación médica *</label>
              <select
                value={state.indicacionId ?? ""}
                onChange={(e) => set("indicacionId", e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-purple-200 px-3 py-2"
              >
                <option value="">Seleccionar...</option>
                {indicaciones.map((ind) => (
                  <option key={ind._id} value={ind._id}>
                    {ind.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
              <label className="text-xs font-medium text-emerald-900">Inicio</label>
              <input
                type="text"
                value={formatDate(state.inicio)}
                onChange={(e) => set("inicio", parseDDMMYYYY(e.target.value))}
                placeholder="dd/mm/aaaa"
                className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2"
              />
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
              <label className="text-xs font-medium text-sky-900">Fin</label>
              <input
                type="text"
                value={formatDate(state.fin)}
                onChange={(e) => set("fin", parseDDMMYYYY(e.target.value))}
                placeholder="dd/mm/aaaa"
                disabled={state.cronico}
                className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Datos principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Nombre comercial</label>
              <input
                value={state.nombreComercial}
                onChange={(e) => set("nombreComercial", e.target.value)}
                placeholder="Ej: Ibupirac 400 mg"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Droga</label>
              <input
                value={state.droga}
                onChange={(e) => set("droga", e.target.value)}
                placeholder="Ej: Ibuprofeno"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Forma</label>
              <select
                value={state.forma}
                onChange={(e) => set("forma", e.target.value as Forma)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option>Comprimidos</option>
                <option>Cápsulas</option>
                <option>Jarabe</option>
                <option>Solución</option>
                <option>Inyectable</option>
                <option>Pomada</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Vía</label>
              <input
                value={state.via}
                onChange={(e) => set("via", e.target.value)}
                placeholder="Ej: VO, IM, IV, tópica"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Dosis</label>
              <input
                value={state.dosisStr}
                onChange={(e) => set("dosisStr", e.target.value)}
                placeholder="Ej: 400 mg"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Frecuencia</label>
              <input
                value={state.freqStr}
                onChange={(e) => set("freqStr", e.target.value)}
                placeholder="Ej: cada 8 h"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Duración */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-5 sm:items-end gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-indigo-900">Duración</label>
                <input
                  value={state.durVal}
                  onChange={(e) => set("durVal", e.target.value)}
                  placeholder="Ej: 7"
                  disabled={state.cronico}
                  className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-indigo-900">Unidad</label>
                <select
                  value={state.durUni}
                  onChange={(e) => set("durUni", e.target.value as typeof state.durUni)}
                  disabled={state.cronico}
                  className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 disabled:bg-gray-100"
                >
                  <option>día(s)</option>
                  <option>semana(s)</option>
                  <option>mes(es)</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 mt-4 sm:mt-0">
                <input
                  id="cronico"
                  type="checkbox"
                  checked={state.cronico}
                  onChange={(e) => {
                    const cronico = e.target.checked;
                    setState((s) => ({
                      ...s,
                      cronico,
                      durVal: cronico ? "" : s.durVal,
                      fin: cronico ? "" : s.fin,
                    }));
                  }}
                  className="w-5 h-5 accent-emerald-600"
                />
                <label htmlFor="cronico" className="text-sm font-medium text-gray-700">
                  Tratamiento crónico
                </label>
              </div>
            </div>
          </div>

          {/* Indicaciones y Notas */}
          <div>
            <label className="text-xs text-gray-600">Indicaciones (opcional)</label>
            <textarea
              value={state.indicacionesTxt}
              onChange={(e) => set("indicacionesTxt", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Notas (opcional)</label>
            <textarea
              value={state.notas}
              onChange={(e) => set("notas", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={disabled}
            onClick={submit}
            className="rounded-lg border border-purple-200 bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-60 transition"
          >
            {mode === "edit" ? "Guardar cambios" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

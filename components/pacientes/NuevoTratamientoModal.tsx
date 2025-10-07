"use client";

import { useEffect, useState } from "react";
import Modal, {
  CancelButton,
  PrimaryButton,
  inputBase,
  selectBase,
  textareaBase,
} from "./Modal";

type Estado = "Activo" | "Suspendido" | "Finalizado";

/* ===================== Helpers de fecha (dd/mm/aaaa) ===================== */

function todayDMY(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function maskDMY(v: string): string {
  // Solo dígitos, y agregamos / automáticamente: dd/mm/aaaa
  const digits = v.replace(/\D/g, "").slice(0, 8);
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  if (digits.length <= 2) return d;
  if (digits.length <= 4) return `${d}/${m}`;
  return `${d}/${m}/${y}`;
}

function isValidDMY(v: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return false;
  const [dd, mm, yyyy] = v.split("/").map(Number);
  const d = new Date(Date.UTC(yyyy, (mm ?? 1) - 1, dd ?? 1));
  return (
    d.getUTCFullYear() === yyyy &&
    d.getUTCMonth() === (mm ?? 1) - 1 &&
    d.getUTCDate() === dd
  );
}

function toMsFromDMY(v?: string): number | undefined {
  if (!v || !isValidDMY(v)) return undefined;
  const [dd, mm, yyyy] = v.split("/").map(Number);
  return Date.UTC(yyyy, (mm ?? 1) - 1, dd ?? 1);
}

/* ======================================================================== */

export default function NuevoTratamientoModal({
  open,
  onClose,
  onSubmit,
  fixedProfesionalName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: {
    titulo: string;
    profesional: string;
    indicaciones: string;
    fechaInicio?: number;
    fechaFin?: number | null;
    estado: Estado;
    cronico?: boolean;
    notas?: string;
  }) => Promise<void> | void;
  fixedProfesionalName?: string;
}) {
  const [titulo, setTitulo] = useState("");
  const [profesional, setProfesional] = useState(fixedProfesionalName ?? "");
  const [fechaInicio, setFechaInicio] = useState<string>(todayDMY());
  const [fechaFin, setFechaFin] = useState<string>("");
  const [estado, setEstado] = useState<Estado>("Activo");
  const [cronico, setCronico] = useState(false);
  const [indicaciones, setIndicaciones] = useState("");
  const [notas, setNotas] = useState("");

  // errores
  const [iniError, setIniError] = useState("");
  const [finError, setFinError] = useState("");

  useEffect(() => {
    if (open) {
      setTitulo("");
      setProfesional(fixedProfesionalName ?? "");
      setIndicaciones("");
      setNotas("");
      setCronico(false);
      setFechaInicio(todayDMY());
      setFechaFin("");
      setEstado("Activo");
      setIniError("");
      setFinError("");
    }
  }, [open, fixedProfesionalName]);

  // Validaciones reactivas
  useEffect(() => {
    setIniError(isValidDMY(fechaInicio) ? "" : "Fecha inválida (dd/mm/aaaa).");
  }, [fechaInicio]);

  useEffect(() => {
    if (cronico || !fechaFin) {
      setFinError("");
      return;
    }
    if (!isValidDMY(fechaFin)) {
      setFinError("Fecha inválida (dd/mm/aaaa).");
      return;
    }
    const ini = toMsFromDMY(fechaInicio);
    const fin = toMsFromDMY(fechaFin);
    setFinError(fin! < ini! ? "La fecha de fin no puede ser anterior a la de inicio." : "");
  }, [fechaFin, fechaInicio, cronico]);

  const canSave =
    titulo.trim().length > 1 &&
    indicaciones.trim().length > 1 &&
    !iniError &&
    !finError;

  const save = async () => {
    if (!canSave) return;

    const inicioMs = toMsFromDMY(fechaInicio);
    const finMs = cronico ? undefined : toMsFromDMY(fechaFin);

    if (!isValidDMY(fechaInicio)) {
      setIniError("Fecha inválida (dd/mm/aaaa).");
      alert("Revisá la fecha de inicio (dd/mm/aaaa).");
      return;
    }
    if (!cronico && fechaFin && !isValidDMY(fechaFin)) {
      setFinError("Fecha inválida (dd/mm/aaaa).");
      alert("Revisá la fecha de fin (dd/mm/aaaa).");
      return;
    }
    if (!cronico && finMs && inicioMs && finMs < inicioMs) {
      setFinError("La fecha de fin no puede ser anterior a la de inicio.");
      alert("Revisá las fechas: la fecha de fin no puede ser anterior a la de inicio.");
      return;
    }

    await onSubmit({
      titulo: titulo.trim(),
      profesional: (fixedProfesionalName ?? profesional).trim(),
      indicaciones: indicaciones.trim(),
      fechaInicio: inicioMs,
      fechaFin: finMs,
      estado,
      cronico: cronico || undefined,
      notas: notas.trim() || undefined,
    });

    // limpiar
    setTitulo("");
    setProfesional(fixedProfesionalName ?? "");
    setIndicaciones("");
    setNotas("");
    setCronico(false);
    setFechaInicio(todayDMY());
    setFechaFin("");
    setIniError("");
    setFinError("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Asignar tratamiento"
      size="xl"
      footer={
        <>
          <CancelButton onClick={onClose} />
          <PrimaryButton disabled={!canSave} onClick={save}>
            Guardar tratamiento
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
          <input
            className={inputBase}
            placeholder="Ej: Antibiótico oral / Fisioterapia de hombro"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
          <input
            className={inputBase}
            placeholder="Nombre del profesional"
            value={fixedProfesionalName ?? profesional}
            onChange={(e) => setProfesional(e.target.value)}
            disabled={!!fixedProfesionalName}
            readOnly={!!fixedProfesionalName}
          />
        </div>

        {/* Fecha de inicio - dd/mm/aaaa */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de inicio</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            className={`${inputBase} ${iniError ? "ring-2 ring-red-300 border-red-300 focus:ring-red-400" : ""}`}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(maskDMY(e.target.value))}
            onBlur={(e) => setFechaInicio(maskDMY(e.target.value))}
          />
          {iniError && <p className="mt-1 text-xs text-red-600">{iniError}</p>}
        </div>

        {/* Fecha de fin - dd/mm/aaaa */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de fin</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            disabled={cronico}
            className={`${inputBase} ${finError ? "ring-2 ring-red-300 border-red-300 focus:ring-red-400" : ""} ${
              cronico ? "bg-gray-50 cursor-not-allowed" : ""
            }`}
            value={fechaFin}
            onChange={(e) => setFechaFin(maskDMY(e.target.value))}
            onBlur={(e) => setFechaFin(maskDMY(e.target.value))}
          />
          {finError && <p className="mt-1 text-xs text-red-600">{finError}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
          <select
            className={selectBase}
            value={estado}
            onChange={(e) => setEstado(e.target.value as Estado)}
          >
            <option value="Activo">Activo</option>
            <option value="Suspendido">Suspendido</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="cronico"
            type="checkbox"
            className="h-4 w-4 accent-emerald-600"
            checked={cronico}
            onChange={(e) => {
              const v = e.target.checked;
              setCronico(v);
              if (v) {
                setFechaFin("");
                setFinError("");
              }
            }}
          />
          <label htmlFor="cronico" className="text-sm text-gray-700">
            Tratamiento crónico (sin fecha de fin)
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Indicaciones</label>
          <textarea
            className={textareaBase}
            placeholder="Dosis, frecuencia, duración, medidas complementarias, controles, etc."
            value={indicaciones}
            onChange={(e) => setIndicaciones(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notas de seguimiento <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            className={textareaBase}
            placeholder="Efectos adversos, cambios de dosis, adherencia, etc."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

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

function todayDateInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function NuevoTratamientoModal({
  open,
  onClose,
  onSubmit,
  fixedProfesionalName, // 👈 nuevo (opcional)
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
  fixedProfesionalName?: string; // 👈 nuevo (opcional)
}) {
  const [titulo, setTitulo] = useState("");
  const [profesional, setProfesional] = useState(fixedProfesionalName ?? "");
  const [fechaInicio, setFechaInicio] = useState<string>(todayDateInput());
  const [fechaFin, setFechaFin] = useState<string>("");
  const [finActivo, setFinActivo] = useState<boolean>(false);
  const [estado, setEstado] = useState<Estado>("Activo");
  const [cronico, setCronico] = useState(false);
  const [indicaciones, setIndicaciones] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (open) {
      setTitulo("");
      setProfesional(fixedProfesionalName ?? "");
      setIndicaciones("");
      setNotas("");
      setCronico(false);
      setFechaFin("");
      setFinActivo(false);
      setFechaInicio(todayDateInput());
      setEstado("Activo");
    }
  }, [open, fixedProfesionalName]);

  const canSave = titulo.trim().length > 1 && indicaciones.trim().length > 1;

  const save = async () => {
    if (!canSave) return;
    const inicioMs = fechaInicio ? new Date(fechaInicio + "T00:00").getTime() : undefined;
    const finMs = fechaFin ? new Date(fechaFin + "T00:00").getTime() : undefined;

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
    setTitulo("");
    setProfesional(fixedProfesionalName ?? "");
    setIndicaciones("");
    setNotas("");
    setCronico(false);
    setFechaFin("");
    setFinActivo(false);
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
            disabled={!!fixedProfesionalName} // 👈 bloqueado si viene fijo
            readOnly={!!fixedProfesionalName}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de inicio</label>
          <input
            lang="es-AR"
            type="date"
            className={inputBase}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de fin</label>
          <input
            lang="es-AR"
            type={finActivo ? "date" : "text"}
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            className={inputBase}
            value={fechaFin}
            onFocus={() => setFinActivo(true)}
            onBlur={(e) => {
              if (!e.currentTarget.value) setFinActivo(false);
            }}
            onChange={(e) => setFechaFin(e.target.value)}
          />
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
            onChange={(e) => setCronico(e.target.checked)}
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
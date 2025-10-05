// app/recepcionista/pacientes/_components/NuevoTratamientoModal.tsx
"use client";

import { useState } from "react";
import Modal, {
  CancelButton,
  PrimaryButton,
  inputBase,
  selectBase,
  textareaBase,
} from "./Modal";

type Estado = "Activo" | "Suspendido" | "Finalizado";

export default function NuevoTratamientoModal({
  open,
  onClose,
  onSubmit,
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
}) {
  const [titulo, setTitulo] = useState("");
  const [profesional, setProfesional] = useState("");
  const [fechaInicio, setFechaInicio] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState<string>("");
  const [estado, setEstado] = useState<Estado>("Activo");
  const [cronico, setCronico] = useState(false);
  const [indicaciones, setIndicaciones] = useState("");
  const [notas, setNotas] = useState("");

  const canSave = titulo.trim().length > 1 && indicaciones.trim().length > 1;

  const save = async () => {
    if (!canSave) return;
    await onSubmit({
      titulo: titulo.trim(),
      profesional: profesional.trim(),
      indicaciones: indicaciones.trim(),
      fechaInicio: new Date(fechaInicio).getTime(),
      fechaFin: fechaFin ? new Date(fechaFin).getTime() : undefined,
      estado,
      cronico: cronico || undefined,
      notas: notas.trim() || undefined,
    });
    setTitulo("");
    setProfesional("");
    setIndicaciones("");
    setNotas("");
    setCronico(false);
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
            value={profesional}
            onChange={(e) => setProfesional(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fecha de inicio</label>
          <input
            type="date"
            className={inputBase}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Fecha estimada de fin <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            type="date"
            className={inputBase}
            value={fechaFin}
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

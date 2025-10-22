"use client";

import { useEffect, useState } from "react";
import Modal, {
  CancelButton,
  PrimaryButton,
  inputBase,
  selectBase,
  textareaBase,
} from "./Modal";

function todayDateInput(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    descripcion: string;
    estado: "Presuntivo" | "Definitivo";
    fecha?: number;
  }) => Promise<void> | void;
  profesionales: any[];            // solo para mostrar fijo si querés
  fixedProfesionalId?: string;     // bloquea el select (el modal no muestra select)
};

export default function NuevoDiagnosticoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  fixedProfesionalId,
}: Props) {
  const [estado, setEstado] = useState<"Presuntivo" | "Definitivo">("Presuntivo");
  const [fecha, setFecha] = useState<string>(todayDateInput());
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (open) {
      setEstado("Presuntivo");
      setFecha(todayDateInput());
      setDescripcion("");
    }
  }, [open]);

  const canSave = descripcion.trim().length > 2;

  const save = async () => {
    if (!canSave) return;
    const ms = fecha ? new Date(`${fecha}T00:00`).getTime() : undefined;
    await onSubmit({
      descripcion: descripcion.trim(),
      estado,
      fecha: ms,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar diagnóstico"
      size="lg"
      footer={
        <>
          <CancelButton onClick={onClose} />
          <PrimaryButton disabled={!canSave} onClick={save}>
            Guardar
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
          <select
            className={selectBase}
            value={estado}
            onChange={(e) => setEstado(e.target.value as any)}
          >
            <option value="Presuntivo">Presuntivo</option>
            <option value="Definitivo">Definitivo</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Fecha 
          </label>
          <input
            type="date"
            className={inputBase}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Diagnóstico</label>
          <textarea
            className={textareaBase}
            placeholder="Descripción del diagnóstico…"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

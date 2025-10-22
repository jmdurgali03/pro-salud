"use client";

import { useEffect, useState } from "react";
import Modal, {
  CancelButton,
  PrimaryButton,
  inputBase,
  selectBase,
  textareaBase,
} from "./Modal";

/* === Utilidades de fecha === */
function todayDateDisplay(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function parseToMs(fecha: string): number | undefined {
  const [day, month, year] = fecha.split("/").map(Number);
  if (!day || !month || !year) return undefined;
  return new Date(year, month - 1, day).getTime();
}

export default function NuevoDiagnosticoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  fixedProfesionalId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    descripcion: string;
    estado: "Presuntivo" | "Definitivo";
    fecha?: number;
  }) => Promise<void> | void;
  profesionales: any[];
  fixedProfesionalId?: string;
}) {
  const [estado, setEstado] = useState<"Presuntivo" | "Definitivo">("Presuntivo");
  const [fecha, setFecha] = useState<string>(todayDateDisplay());
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (open) {
      setEstado("Presuntivo");
      setFecha(todayDateDisplay());
      setDescripcion("");
    }
  }, [open]);

  const canSave = descripcion.trim().length > 2;

  const save = async () => {
    if (!canSave) return;
    const ms = parseToMs(fecha);
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
            type="text"
            className={inputBase}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            placeholder="dd/mm/aaaa"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Diagnóstico
          </label>
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

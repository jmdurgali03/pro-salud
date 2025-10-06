// app/recepcionista/pacientes/_components/NuevaConsultaModal.tsx
"use client";

import { useMemo, useState } from "react";
import Modal, {
  CancelButton,
  PrimaryButton,
  inputBase,
  selectBase,
  textareaBase,
} from "./Modal";

export default function NuevaConsultaModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  espNombrePorId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: {
    motivo: string;
    profesionalId: any; // Id<"profesionales">
    notas?: string;
  }) => Promise<void> | void;
  profesionales: any[];
  espNombrePorId: Map<string, string>;
}) {
  const [motivo, setMotivo] = useState("");
  const [profesionalId, setProfesionalId] = useState<string>("");
  const [notas, setNotas] = useState("");

  const canSave = motivo.trim().length > 1 && profesionalId;

  const profOptions = useMemo(
    () =>
      (profesionales ?? []).map((p: any) => ({
        id: p._id as string,
        label: `${p.apellido}, ${p.nombre}${
          p.especialidadId ? " · " + (espNombrePorId.get(p.especialidadId) ?? "") : ""
        }`,
      })),
    [profesionales, espNombrePorId]
  );

  const save = async () => {
    if (!canSave) return;
    await onSubmit({ motivo: motivo.trim(), profesionalId, notas: notas.trim() || undefined });
    setMotivo("");
    setProfesionalId("");
    setNotas("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva consulta"
      size="lg"
      footer={
        <>
          <CancelButton onClick={onClose} />
          <PrimaryButton disabled={!canSave} onClick={save}>
            Guardar consulta
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Motivo</label>
          <input
            className={inputBase}
            placeholder="Ej: Dolor abdominal, control, etc."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
          <select
            className={selectBase}
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
          >
            <option value="">Seleccioná un profesional…</option>
            {profOptions.map((o: any) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notas <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            className={textareaBase}
            placeholder="Observaciones, signos, antecedentes, etc."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

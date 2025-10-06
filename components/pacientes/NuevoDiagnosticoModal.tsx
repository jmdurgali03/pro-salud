"use client";

import { useEffect, useMemo, useState } from "react";
import Modal, {
  CancelButton,
  PrimaryButton,
  inputBase,
  selectBase,
  textareaBase,
} from "./Modal";

type Consulta = { _id: string; fecha: number; motivo: string; profesionalId: string };

function todayDateInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function NuevoDiagnosticoModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  consultas,
  getProfesionalNombre,
  fixedProfesionalId, // 👈 nuevo (opcional)
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: {
    consultaId: any;
    descripcion: string;
    profesionalId: any;
    estado: "Presuntivo" | "Definitivo";
    fecha?: number;
  }) => Promise<void> | void;
  profesionales: any[];
  consultas: Consulta[];
  getProfesionalNombre: (id: any) => string;
  fixedProfesionalId?: string; // 👈 nuevo (opcional)
}) {
  const [consultaId, setConsultaId] = useState<string>("");
  const [profesionalId, setProfesionalId] = useState<string>(fixedProfesionalId ?? "");
  const [estado, setEstado] = useState<"Presuntivo" | "Definitivo">("Presuntivo");
  const [fecha, setFecha] = useState<string>(todayDateInput());
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (open) {
      setConsultaId("");
      setDescripcion("");
      setEstado("Presuntivo");
      setFecha(todayDateInput());
      setProfesionalId(fixedProfesionalId ?? "");
    }
  }, [open, fixedProfesionalId]);

  const canSave = consultaId && (fixedProfesionalId ?? profesionalId) && descripcion.trim().length > 2;

  const profOptionsAll = useMemo(
    () =>
      (profesionales ?? []).map((p: any) => ({
        id: p._id as string,
        label: `${p.apellido}, ${p.nombre}`,
      })),
    [profesionales]
  );

  const profOptions = fixedProfesionalId
    ? profOptionsAll.filter((o) => o.id === fixedProfesionalId)
    : profOptionsAll;

  const consultaOptions = useMemo(
    () =>
      (consultas ?? []).map((c: Consulta) => ({
        id: c._id,
        label:
          `${new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(c.fecha)} · ` +
          `${getProfesionalNombre(c.profesionalId)} · ${c.motivo}`,
      })),
    [consultas, getProfesionalNombre]
  );

  const save = async () => {
    if (!canSave) return;
    const ms = fecha ? new Date(fecha + "T00:00").getTime() : undefined;
    await onSubmit({
      consultaId,
      profesionalId: (fixedProfesionalId ?? profesionalId)!,
      estado,
      descripcion: descripcion.trim(),
      fecha: ms,
    });
    setConsultaId("");
    setProfesionalId(fixedProfesionalId ?? "");
    setDescripcion("");
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
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Consulta</label>
          <select
            className={selectBase}
            value={consultaId}
            onChange={(e) => setConsultaId(e.target.value)}
          >
            <option value="">Seleccioná una consulta…</option>
            {consultaOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
          <select
            className={selectBase}
            value={(fixedProfesionalId ?? profesionalId) as string}
            onChange={(e) => setProfesionalId(e.target.value)}
            disabled={!!fixedProfesionalId} // 👈 bloqueado si viene fijo
          >
            {!fixedProfesionalId && <option value="">Seleccioná un profesional…</option>}
            {profOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

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
            Fecha <span className="text-gray-400">(dd/mm/aaaa)</span>
          </label>
          <input
            lang="es-AR"
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
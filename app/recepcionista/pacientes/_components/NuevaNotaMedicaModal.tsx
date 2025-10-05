// app/recepcionista/pacientes/_components/NuevaNotaMedicaModal.tsx
"use client";

import { useMemo, useState } from "react";
import Modal, {
  CancelButton,
  PrimaryButton,
  inputBase,
  selectBase,
  textareaBase,
} from "./Modal";

type Categoria =
  | "Evolución"
  | "Indicación"
  | "Interconsulta"
  | "Epicrisis"
  | "Administrativa";

// Helpers: ahora local → "YYYY-MM-DDTHH:MM" para <input type="datetime-local">
function nowDateTimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function NuevaNotaMedicaModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  consultas,
  getProfesionalNombre,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: {
    profesionalId: any;
    consultaId?: any;
    fecha?: number;
    categoria: Categoria;
    visibilidad: "Equipo" | "Privada";
    titulo?: string;
    texto: string;
  }) => Promise<void> | void;
  profesionales: any[];
  consultas: { _id: string; fecha: number; motivo: string; profesionalId: string }[];
  getProfesionalNombre: (id: any) => string;
}) {
  const [profesionalId, setProfesionalId] = useState<string>("");
  const [fecha, setFecha] = useState<string>(nowDateTimeLocal());
  const [categoria, setCategoria] = useState<Categoria>("Evolución");
  const [consultaId, setConsultaId] = useState<string>("");
  const [visibilidad, setVisibilidad] = useState<"Equipo" | "Privada">("Equipo");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");

  const canSave = profesionalId && texto.trim().length > 2;

  const profOptions = useMemo(
    () =>
      (profesionales ?? []).map((p: any) => ({
        id: p._id as string,
        label: `${p.apellido}, ${p.nombre}`,
      })),
    [profesionales]
  );

  const consultaOptions = useMemo(
    () =>
      (consultas ?? []).map((c) => ({
        id: c._id,
        label:
          `${new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(c.fecha)} · ` +
          `${getProfesionalNombre(c.profesionalId)} · ${c.motivo}`,
      })),
    [consultas, getProfesionalNombre]
  );

  const save = async () => {
    if (!canSave) return;
    const ms = fecha ? new Date(fecha).getTime() : undefined;
    await onSubmit({
      profesionalId,
      consultaId: consultaId || undefined,
      fecha: ms,
      categoria,
      visibilidad,
      titulo: titulo.trim() || undefined,
      texto: texto.trim(),
    });
    setTexto("");
    setTitulo("");
    setConsultaId("");
    setProfesionalId("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva nota médica"
      size="xl"
      footer={
        <>
          <CancelButton onClick={onClose} />
          <PrimaryButton disabled={!canSave} onClick={save}>
            Guardar nota
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
          <select
            className={selectBase}
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
          >
            <option value="">Seleccioná un profesional…</option>
            {profOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Fecha y hora 
          </label>
          <input
            lang="es-AR"
            type="datetime-local"
            step={60}
            className={inputBase}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
          <select
            className={selectBase}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
          >
            {["Evolución", "Indicación", "Interconsulta", "Epicrisis", "Administrativa"].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Vincular a consulta <span className="text-gray-400">(opcional)</span>
          </label>
          <select
            className={selectBase}
            value={consultaId}
            onChange={(e) => setConsultaId(e.target.value)}
          >
            <option value="">Sin vincular</option>
            {consultaOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
          <input
            className={inputBase}
            placeholder="p. ej., Dolor lumbar: evolución y plan"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Detalle</label>
          <textarea
            className={textareaBase}
            placeholder="Descripción clínica, hallazgos, indicaciones…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

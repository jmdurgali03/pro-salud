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

type Categoria =
  | "Evolución"
  | "Indicación"
  | "Interconsulta"
  | "Epicrisis"
  | "Administrativa";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fecha?: number;
    categoria: Categoria;
    visibilidad: "Equipo" | "Privada";
    titulo?: string;
    texto: string;
  }) => Promise<void> | void;
  profesionales: any[];        // solo para mantener la firma uniforme con otros modales
  fixedProfesionalId?: string; // no se edita acá, lo forzás en el submit del page.tsx
};

export default function NuevaNotaMedicaModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [fecha, setFecha] = useState<string>(todayDateInput());
  const [categoria, setCategoria] = useState<Categoria>("Evolución");
  const [visibilidad, setVisibilidad] = useState<"Equipo" | "Privada">("Equipo");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (open) {
      setFecha(todayDateInput());
      setCategoria("Evolución");
      setVisibilidad("Equipo");
      setTitulo("");
      setTexto("");
    }
  }, [open]);

  const canSave = texto.trim().length > 2;

  const save = async () => {
    if (!canSave) return;
    const ms = fecha ? new Date(`${fecha}T00:00`).getTime() : undefined;
    await onSubmit({
      fecha: ms,
      categoria,
      visibilidad,
      titulo: titulo.trim() || undefined,
      texto: texto.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva nota médica"
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
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              className={inputBase}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select
              className={selectBase}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
            >
              <option>Evolución</option>
              <option>Indicación</option>
              <option>Interconsulta</option>
              <option>Epicrisis</option>
              <option>Administrativa</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Visibilidad</label>
            <select
              className={selectBase}
              value={visibilidad}
              onChange={(e) => setVisibilidad(e.target.value as "Equipo" | "Privada")}
            >
              <option>Equipo</option>
              <option>Privada</option>
            </select>
          </div>
          <div>
            <label className="label">Título (opcional)</label>
            <input
              className={inputBase}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Motivo breve"
            />
          </div>
        </div>

        <div>
          <label className="label">Texto</label>
          <textarea
            className={textareaBase}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Detalle de la nota..."
          />
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
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

/* ======== helpers fecha/hora en formato humano ======== */
const pad = (n: number) => String(n).padStart(2, "0");

function todayDdMmYyyy(): string {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function nowHhMm(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function parseDdMmYyyyToMs(fechaDDMMYYYY: string, hhmm: string): number | undefined {
  const m = fechaDDMMYYYY.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return undefined;
  const [, dd, mm, yyyy] = m;
  const [hh = "00", mi = "00"] = (hhmm || "").split(":");
  const d = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(mi)
  );
  if (isNaN(d.getTime())) return undefined;
  return d.getTime();
}

export default function NuevaNotaMedicaModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  consultas,
  getProfesionalNombre,
  fixedProfesionalId, // opcional
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
  fixedProfesionalId?: string;
}) {
  const [profesionalId, setProfesionalId] = useState<string>(fixedProfesionalId ?? "");

  // AHORA separados para mantener dd/mm/aaaa
  const [fechaDia, setFechaDia] = useState<string>(todayDdMmYyyy()); // dd/mm/aaaa
  const [hora, setHora] = useState<string>(nowHhMm()); // HH:mm

  const [categoria, setCategoria] = useState<Categoria>("Evolución");
  const [consultaId, setConsultaId] = useState<string>("");
  const [visibilidad, setVisibilidad] = useState<"Equipo" | "Privada">("Equipo");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (open) {
      setProfesionalId(fixedProfesionalId ?? "");
      setFechaDia(todayDdMmYyyy());
      setHora(nowHhMm());
      setCategoria("Evolución");
      setConsultaId("");
      setVisibilidad("Equipo");
      setTitulo("");
      setTexto("");
    }
  }, [open, fixedProfesionalId]);

  const canSave =
    Boolean(fixedProfesionalId ?? profesionalId) &&
    texto.trim().length > 2 &&
    Boolean(parseDdMmYyyyToMs(fechaDia, hora));

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
    const ms = parseDdMmYyyyToMs(fechaDia, hora);
    await onSubmit({
      profesionalId: (fixedProfesionalId ?? profesionalId)!,
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
    setProfesionalId(fixedProfesionalId ?? "");
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
        {/* Profesional */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
          <select
            className={selectBase}
            value={(fixedProfesionalId ?? profesionalId) as string}
            onChange={(e) => setProfesionalId(e.target.value)}
            disabled={!!fixedProfesionalId}
          >
            {!fixedProfesionalId && <option value="">Seleccioná un profesional…</option>}
            {profOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha (dd/mm/aaaa) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              className={inputBase}
              value={fechaDia}
              onChange={(e) => setFechaDia(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hora</label>
            <input
              type="time"
              step={60}
              className={inputBase}
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
          <select
            className={selectBase}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
          >
            {["Evolución", "Indicación", "Interconsulta", "Epicrisis", "Administrativa"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Vincular a consulta */}
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

        {/* Título */}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
          <input
            className={inputBase}
            placeholder="p. ej., Dolor lumbar: evolución y plan"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {/* Detalle */}
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

"use client";
import { useMemo, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  apellido: string;
  especialidadId?: Id<"especialidades">;
};

type Consulta = {
  _id: Id<"consultas">;
  motivo: string;
  fecha: number;
  profesionalId: Id<"profesionales">;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    profesionalId: Id<"profesionales">;
    consultaId?: Id<"consultas">;
    fecha?: number;
    categoria: "Evolución" | "Indicación" | "Interconsulta" | "Epicrisis" | "Administrativa";
    visibilidad: "Equipo" | "Privada";
    titulo?: string;
    texto: string;
  }) => Promise<void> | void;
  profesionales: Profesional[];
  consultas: Consulta[];
  getProfesionalNombre: (id: Id<"profesionales">) => string;
};

const formatAR = (n: number) =>
  new Date(n).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

export default function NuevaNotaMedicaModal({
  open,
  onClose,
  onSubmit,
  profesionales,
  consultas,
  getProfesionalNombre,
}: Props) {
  const [profesionalId, setProfesionalId] = useState<Id<"profesionales"> | "">("");
  const [consultaId, setConsultaId] = useState<Id<"consultas"> | "">("");
  const [fecha, setFecha] = useState<string>(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    // yyyy-MM-ddTHH:mm para <input type="datetime-local">
    const pad = (x: number) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  });

  const [categoria, setCategoria] = useState<
    "Evolución" | "Indicación" | "Interconsulta" | "Epicrisis" | "Administrativa"
  >("Evolución");
  const [visibilidad, setVisibilidad] = useState<"Equipo" | "Privada">("Equipo");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);

  const puedeGuardar =
    texto.trim().length >= 3 && profesionalId !== "" && fecha.length > 0;

  const consultasOrdenadas = useMemo(
    () => [...consultas].sort((a, b) => b.fecha - a.fecha),
    [consultas]
  );

  if (!open) return null;

  const submit = async () => {
    if (!puedeGuardar) return;
    setGuardando(true);
    try {
      const epoch = new Date(fecha).getTime();
      await onSubmit({
        profesionalId: profesionalId as Id<"profesionales">,
        consultaId: consultaId ? (consultaId as Id<"consultas">) : undefined,
        fecha: isNaN(epoch) ? undefined : epoch,
        categoria,
        visibilidad,
        titulo: titulo.trim() || undefined,
        texto: texto.trim(),
      });
      // reset
      setTitulo("");
      setTexto("");
      setConsultaId("");
      setCategoria("Evolución");
      setVisibilidad("Equipo");
      onClose();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">Nueva nota médica</h3>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>

        <div className="grid gap-4 px-5 py-4">
          {/* fila 1 */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium">Profesional</span>
              <select
                value={profesionalId}
                onChange={e => setProfesionalId(e.target.value as any)}
                className="rounded-lg border px-3 py-2"
              >
                <option value="">Seleccioná…</option>
                {profesionales.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.apellido}, {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium">Fecha</span>
              <input
                type="datetime-local"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="rounded-lg border px-3 py-2"
              />
            </label>
          </div>

          {/* fila 2 */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium">Categoría</span>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value as any)}
                className="rounded-lg border px-3 py-2"
              >
                <option>Evolución</option>
                <option>Indicación</option>
                <option>Interconsulta</option>
                <option>Epicrisis</option>
                <option>Administrativa</option>
              </select>
            </label>


            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium">Vincular a consulta (opcional)</span>
              <select
                value={consultaId}
                onChange={e => setConsultaId(e.target.value as any)}
                className="rounded-lg border px-3 py-2"
              >
                <option value="">Sin vincular</option>
                {consultasOrdenadas.map(c => (
                  <option key={c._id} value={c._id}>
                    {new Date(c.fecha).toLocaleDateString("es-AR")} — {c.motivo} — {getProfesionalNombre(c.profesionalId)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Título</span>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="p. ej., Dolor lumbar: evolución y plan"
              className="rounded-lg border px-3 py-2"
              maxLength={100}
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Detalle</span>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={6}
              className="resize-y rounded-lg border px-3 py-2"
              placeholder="Descripción clínica, hallazgos, indicaciones…"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
          <button
            disabled={!puedeGuardar || guardando}
            onClick={submit}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${puedeGuardar ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-300"}`}
          >
            {guardando ? "Guardando…" : "Guardar nota"}
          </button>
        </div>
      </div>
    </div>
  );
}

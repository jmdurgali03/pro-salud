"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TurnoConJoin } from "@/app/recepcionista/cal-turnos/_components/types";
import { User, Stethoscope, Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { TurnoModal } from "./TurnoModal";
import EditTurnoDialog from "./EditTurnoDialog";
type Props = {
  turnos: TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
};

type SortKey = "paciente" | "profesional" | "fecha" | "estado";
type SortDir = "asc" | "desc";

export function TurnosTable({ turnos, onSelectTurno }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [turnoEditar, setTurnoEditar] = useState<TurnoConJoin | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error" | null>(null);

  const eliminarTurno = useMutation(api.turnos.eliminar);

  // ------------------ Ordenamiento local ------------------
  const sortedTurnos = useMemo(() => {
    const copy = [...turnos];
    const dir = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      switch (sortKey) {
        case "paciente":
          return (
            `${a.pacienteApellido} ${a.pacienteNombre}`.localeCompare(
              `${b.pacienteApellido} ${b.pacienteNombre}`
            ) * dir
          );
        case "profesional":
          return (
            `${a.profesionalApellido} ${a.profesionalNombre}`.localeCompare(
              `${b.profesionalApellido} ${b.profesionalNombre}`
            ) * dir
          );
        case "fecha":
          return (a.start - b.start) * dir;
        case "estado":
          return a.estado.localeCompare(b.estado) * dir;
        default:
          return 0;
      }
    });
    return copy;
  }, [turnos, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ------------------ Formatos ------------------
  const formatFecha = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

  const formatHora = (start: number, end: number) => {
    const s = new Date(start).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const e = new Date(end).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${s} - ${e}`;
  };

  const colorEstado = {
    Confirmado: "bg-emerald-100 text-emerald-700 border-emerald-300",
    Pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Cancelado: "bg-red-100 text-red-700 border-red-300",
    Finalizado: "bg-blue-100 border-blue-400 text-blue-700",
  };

  // ------------------ Eliminar turno ------------------
  const handleEliminar = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este turno?")) return;
    try {
      await eliminarTurno({ id: id as any });
      setTipoMensaje("ok");
      setMensaje("✅ Turno eliminado correctamente.");
    } catch (err) {
      console.error(err);
      setTipoMensaje("error");
      setMensaje("❌ Error al eliminar el turno.");
    } finally {
      setTimeout(() => {
        setMensaje(null);
        setTipoMensaje(null);
      }, 3000);
    }
  };

  return (
    <>
      <div className="overflow-hidden border rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="text-gray-700 bg-emerald-50">
            <tr>
              <Th
                label="Paciente"
                onClick={() => toggleSort("paciente")}
                active={sortKey === "paciente"}
                dir={sortDir}
              />
              <Th
                label="Profesional"
                onClick={() => toggleSort("profesional")}
                active={sortKey === "profesional"}
                dir={sortDir}
              />
              <Th
                label="Fecha"
                onClick={() => toggleSort("fecha")}
                active={sortKey === "fecha"}
                dir={sortDir}
              />
              <Th label="Horario" />
              <Th
                label="Estado"
                onClick={() => toggleSort("estado")}
                active={sortKey === "estado"}
                dir={sortDir}
              />
              <Th label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {sortedTurnos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">
                  No se encontraron turnos
                </td>
              </tr>
            ) : (
              sortedTurnos.map((t) => (
                <tr
                  key={t._id}
                  className="hover:bg-emerald-50 transition-colors"
                >
                  <Td>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      {t.pacienteNombre} {t.pacienteApellido}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-gray-500" />
                      {t.profesionalNombre} {t.profesionalApellido}
                    </div>
                  </Td>
                  <Td>{formatFecha(t.start)}</Td>
                  <Td>{formatHora(t.start, t.end)}</Td>
                  <Td>
                    <span
                      className={`px-2 py-1 rounded-full border text-xs font-medium ${colorEstado[t.estado]}`}
                    >
                      {t.estado}
                    </span>
                  </Td>

                  {/* 🔹 Acciones */}
                  <Td>
                    <div className="flex gap-2 justify-right">
                      <button
                        onClick={() => onSelectTurno(t)}
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
  onClick={() => setTurnoEditar(t)}
  className="p-1.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
  title="Editar turno"
>
  <Pencil className="w-4 h-4" />
</button>


                      
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

     
      
{/* 🧩 Modal de edición */}
<EditTurnoDialog
  turno={turnoEditar!}
  open={!!turnoEditar}
  onOpenChange={(open) => {
    if (!open) setTurnoEditar(null);
  }}
/>


      {/* 🔹 Mensaje flotante */}
      {mensaje && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm text-center p-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-4
            ${
              tipoMensaje === "ok"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-red-50 text-red-700 border-red-300"
            }`}
        >
          {mensaje}
        </div>
      )}
    </>
  );
}

/* --------------------- Subcomponentes --------------------- */

function Th({
  label,
  onClick,
  active,
  dir,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  dir?: "asc" | "desc";
}) {
  return (
    <th
      onClick={onClick}
      className={`text-left px-4 py-3 font-semibold select-none ${
        onClick ? "cursor-pointer hover:bg-emerald-100/40" : ""
      }`}
    >
      <div className="flex items-center gap-1">
        {label}
        {onClick && (
          <ArrowUpDown
            className={`w-3.5 h-3.5 transition-transform ${
              active ? "text-emerald-600" : "text-gray-400"
            } ${active && dir === "desc" ? "rotate-180" : ""}`}
          />
        )}
      </div>
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-2 border-t">{children}</td>;
}

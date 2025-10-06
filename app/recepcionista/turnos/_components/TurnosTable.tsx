"use client";

import { useState, useMemo } from "react";
import { TurnoConJoin } from "@/app/recepcionista/cal-turnos/_components/types";
import { User, Stethoscope, ArrowUpDown } from "lucide-react";

type Props = {
  turnos: TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
};

type SortKey = "paciente" | "profesional" | "fecha" | "estado";
type SortDir = "asc" | "desc";

export function TurnosTable({ turnos, onSelectTurno }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedTurnos = useMemo(() => {
    const copy = [...turnos];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

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
  };

  return (
    <div className="overflow-hidden border rounded-xl bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-emerald-50 text-gray-700">
          <tr>
            <Th label="Paciente" onClick={() => toggleSort("paciente")} active={sortKey === "paciente"} dir={sortDir} />
            <Th label="Profesional" onClick={() => toggleSort("profesional")} active={sortKey === "profesional"} dir={sortDir} />
            <Th label="Fecha" onClick={() => toggleSort("fecha")} active={sortKey === "fecha"} dir={sortDir} />
            <Th label="Horario" />
            <Th label="Estado" onClick={() => toggleSort("estado")} active={sortKey === "estado"} dir={sortDir} />
          </tr>
        </thead>
        <tbody>
          {sortedTurnos.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 py-6">
                No se encontraron turnos
              </td>
            </tr>
          ) : (
            sortedTurnos.map((t) => (
              <tr
                key={t._id}
                onClick={() => onSelectTurno(t)}
                className="hover:bg-emerald-50 cursor-pointer transition-colors"
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
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

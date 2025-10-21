"use client";

import { useMemo } from "react";
import { TurnoConJoin } from "./types";

type Props = {
  turnos: TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
};

export const TURNO_COLOR_MAP: Record<
  TurnoConJoin["estado"],
  { bg: string; text: string; border: string }
> = {
  Confirmado: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Pendiente: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  Cancelado: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  Finalizado: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
};

export function CalendarioSidebar({ turnos, onSelectTurno }: Props) {
  const proximos = useMemo(() => {
    const ahora = Date.now();
    return (
      [...turnos]
        .filter((t) => t.end > ahora)
        .sort((a, b) => a.start - b.start)
        .slice(0, 6)
    );
  }, [turnos]);

  return (
    <div className="w-80 border-r border-gray-200 p-6">
      <h3 className="font-bold text-gray-700 mb-4">Próximos turnos</h3>
      {!turnos.length ? (
        <p className="text-sm text-gray-500">Sin turnos</p>
      ) : (
        <div className="space-y-2">
          {proximos.map((event) => {
            const color = TURNO_COLOR_MAP[event.estado] || {
              bg: "bg-gray-50",
              text: "text-gray-700",
              border: "border-gray-200",
            };
            return (
              <button
                key={event._id}
                onClick={() => onSelectTurno(event)}
                className={`w-full text-left ${color.bg} ${color.text} ${color.border} border p-2 rounded-lg hover:opacity-90 transition text-sm font-medium`}
              >
                <div className="truncate">
                  <span className="text-black">
                    {event.pacienteNombre} {event.pacienteApellido}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {new Date(event.start).toLocaleDateString("es-AR")} •{" "}
                  {new Date(event.start).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  -{" "}
                  {new Date(event.end).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                    event.estado === "Confirmado"
                      ? "bg-green-100 text-green-800"
                      : event.estado === "Pendiente"
                      ? "bg-yellow-100 text-yellow-800"
                      : event.estado === "Cancelado"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.estado}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

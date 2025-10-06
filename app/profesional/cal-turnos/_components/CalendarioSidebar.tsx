"use client";

import { useMemo } from "react";
import { TurnoConJoin } from "./types";

type Props = {
  turnos: TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
};

export function CalendarioSidebar({ turnos, onSelectTurno }: Props) {
  const proximos = useMemo(
    () =>
      [...turnos]
        .sort((a, b) => a.start - b.start)
        .slice(0, 6),
    [turnos]
  );

  return (
    <div className="w-80 border-r border-gray-200 p-6 bg-blue-50">
      <h3 className="font-bold text-gray-700 mb-4">Próximos turnos</h3>
      {!turnos.length ? (
        <p className="text-sm text-gray-500">Sin turnos</p>
      ) : (
        <div className="space-y-2">
          {proximos.map((event) => (
            <button
              key={event._id}
              onClick={() => onSelectTurno(event)}
              className="w-full text-left bg-white text-blue-700 p-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium border border-blue-100"
            >
              <div className="truncate">{event.pacienteNombre} { event.pacienteApellido}</div>
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

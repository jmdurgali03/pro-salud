"use client";

import { X } from "lucide-react";
import { TURNO_COLOR_MAP, TurnoConJoin } from "./types";

export function TurnoModal({
  turno,
  onClose,
}: {
  turno: TurnoConJoin;
  onClose: () => void;
}) {
  // Si el profesional no está activo, no renderizamos el modal
  if (turno.profesionalEstado !== "Activo") {
    return null;
  }

  const badge = `inline-block rounded px-2 py-0.5 text-xs border ${TURNO_COLOR_MAP[turno.estado]}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold text-purple-700">Detalles del turno</h2>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Paciente: </span>
            {turno.pacienteNombre || "Paciente"}
          </div>
          <div>
            <span className="font-semibold">Profesional: </span>
            {turno.profesionalNombre || "Profesional"}
          </div>
          <div>
            <span className="font-semibold">Especialidad: </span>
            {turno.especialidadNombre || "—"}
          </div>
          <div>
            <span className="font-semibold">Fecha: </span>
            {new Date(turno.start).toLocaleDateString("es-AR")}
          </div>
          <div>
            <span className="font-semibold">Hora: </span>
            {new Date(turno.start).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
          <div className="pt-1">
            <span className="font-semibold">Estado: </span>
            <span className={badge}>{turno.estado}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

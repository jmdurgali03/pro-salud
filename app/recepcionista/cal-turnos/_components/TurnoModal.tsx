"use client";

import { X, CalendarClock, User, Stethoscope, Info, Clock } from "lucide-react";
import { TURNO_COLOR_MAP, TurnoConJoin } from "./types";

export function TurnoModal({
  turno,
  onClose,
}: {
  turno: TurnoConJoin;
  onClose: () => void;
}) {
  // 🔹 Si el profesional está inactivo
  if (turno.profesionalEstado !== "Activo") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              Profesional inactivo
            </h2>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            Este turno pertenece a un profesional actualmente{" "}
            <span className="font-semibold text-yellow-700">inactivo</span>.  
            No se pueden realizar modificaciones hasta que se reactive.
          </p>

          <div className="mt-5 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Badge según estado
  const badge = `inline-block rounded px-2 py-0.5 text-xs font-medium border ${TURNO_COLOR_MAP[turno.estado]}`;

  // 🔹 Fecha y hora formateadas
  const fechaLocal = new Date(turno.start).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaInicio = new Date(turno.start).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const horaFin = new Date(turno.end).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // 🔹 Color del encabezado según estado
  const headerColor =
    turno.estado === "Confirmado"
      ? "from-emerald-500 to-emerald-600"
      : turno.estado === "Pendiente"
      ? "from-yellow-400 to-yellow-500"
      : "from-red-500 to-red-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
        {/* Header con color dinámico */}
        <div
          className={`bg-gradient-to-r ${headerColor} text-white px-5 py-4 rounded-t-2xl flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Detalles del turno</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-white/80 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2 text-gray-800">
            <User className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Paciente:</span>
            <span className="truncate">{turno.pacienteNombre} {turno.pacienteApellido ?? ""}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-800">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Profesional:</span>
            <span className="truncate">
              {turno.profesionalNombre} {turno.profesionalApellido ?? ""}
            </span>
          </div>

          <div>
            <span className="font-semibold">Especialidad:</span>{" "}
            {turno.especialidadNombre || "—"}
          </div>

          <div className="flex items-center gap-2 text-gray-800">
            <CalendarClock className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold">Fecha:</span> {fechaLocal}
          </div>

          <div className="flex items-center gap-2 text-gray-800">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="font-semibold">Horario:</span>{" "}
            {horaInicio} <span className="text-gray-500">a</span> {horaFin}
          </div>

          <div>
            <span className="font-semibold">Estado:</span>{" "}
            <span className={badge}>{turno.estado}</span>
          </div>
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { X, CalendarDays, Clock, User, Stethoscope, Hourglass } from "lucide-react";
import { TURNO_COLOR_MAP, TurnoConJoin } from "./types";
import { motion, AnimatePresence } from "framer-motion";

export function TurnoModal({
  turno,
  onClose,
}: {
  turno: TurnoConJoin;
  onClose: () => void;
}) {
  const badge = `inline-block rounded-full px-3 py-0.5 text-xs font-medium border ${TURNO_COLOR_MAP[turno.estado]}`;

  const fecha = new Date(turno.start).toLocaleDateString("es-AR", {
    weekday: "long",
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

  // 🔹 Calcular duración en minutos
  const duracionMin = Math.round((turno.end - turno.start) / 60000);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          {/* Botón de cierre */}
          <button
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Título */}
          <h2 className="mb-5 text-center text-2xl font-semibold text-purple-700">
            Detalles del turno
          </h2>

          {/* Contenido */}
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Paciente:</span>
              <span className="text-gray-800">
                {(turno.pacienteNombre || "Paciente") +
                  " " +
                  (turno.pacienteApellido || "")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Profesional:</span>
              <span className="text-gray-800">
                {(turno.profesionalNombre || "Profesional") +
                  " " +
                  (turno.profesionalApellido || "")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="ml-0.5 font-medium">Especialidad:</span>
              <span className="text-gray-800">
                {turno.especialidadNombre || "—"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Fecha:</span>
              <span className="capitalize">{fecha}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Horario:</span>
              <span>
                {horaInicio} <span className="text-gray-500">a</span> {horaFin}
              </span>
            </div>

            {/* 🔹 Nueva línea: Duración del turno */}
            <div className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-500" />
              <span className="font-medium">Duración:</span>
              <span className="text-gray-800">
                {duracionMin} {duracionMin === 1 ? "minuto" : "minutos"}
              </span>
            </div>

            <div className="pt-3 border-t mt-4 flex items-center justify-between">
              <span className="font-medium text-gray-600">Estado:</span>
              <span className={badge}>{turno.estado}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

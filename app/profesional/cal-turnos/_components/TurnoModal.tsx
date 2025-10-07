"use client";

import { X, CalendarDays, Clock, User, Stethoscope, Hourglass, BriefcaseMedical } from "lucide-react";
import { TURNO_COLOR_MAP, TurnoConJoin } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function TurnoModal({
  turno,
  onClose,
  pacienteId,
}: {
  turno: TurnoConJoin;
  onClose: () => void;
  pacienteId?: string;
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

  const router = useRouter()

  const handleVerHistorial = () => {
    if (!pacienteId) return;
    router.push(`/profesional/pacientes/${pacienteId}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
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
          className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        >
          {/* Header con gradiente púrpura */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 relative">
            <button
              className="absolute right-4 top-4 text-white/80 hover:text-white focus:outline-none transition-colors"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-semibold text-white">
              Detalles del turno
            </h2>
          </div>

          {/* Contenido */}

          <div className="p-6 space-y-5 text-md text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Estado:</span>
              <span className={badge}>{turno.estado}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-medium">Paciente</span>
                <span className="text-gray-900 font-medium">
                  {(turno.pacienteNombre || "Paciente") +
                    " " +
                    (turno.pacienteApellido || "")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <BriefcaseMedical className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-medium">Profesional</span>
                <span className="text-gray-900 font-medium">
                  {(turno.profesionalNombre || "Profesional") +
                    " " +
                    (turno.profesionalApellido || "")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <Stethoscope className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-medium">Especialidad</span>
                <span className="text-gray-900 font-medium">
                  {turno.especialidadNombre || "—"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <span className="block text-sm text-gray-500 font-medium">Fecha</span>
                  <span className="text-gray-900 capitalize">{fecha}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <span className="block text-sm text-gray-500 font-medium">Horario</span>
                  <span className="text-gray-900">
                    {horaInicio} - {horaFin}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                  <Hourglass className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="block text-sm text-gray-500 font-medium">Duración</span>
                  <span className="text-gray-900">
                    {duracionMin} {duracionMin === 1 ? "minuto" : "minutos"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all hover:shadow-md"
            >
              Cerrar
            </button>
            <button
              onClick={handleVerHistorial}
              disabled={!pacienteId}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${pacienteId
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              Ver Historial
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
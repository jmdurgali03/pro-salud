"use client";

import {
  X,
  User,
  Stethoscope,
  CalendarClock,
  Clock,
} from "lucide-react";
import type { TurnoConJoin } from "@/app/recepcionista/cal-turnos/_components/types";
import { EstadoBadge } from "./EstadoBadge";
 

export function TurnoModal({
  turno,
  onClose,
}: {
  turno: TurnoConJoin;
  onClose: () => void;
}) {
  // Vista de solo lectura: sin edición de estado

  // Sin acciones de actualización en modo ver detalles

  const fecha = new Date(turno.start).toLocaleDateString("es-AR", {
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

  const colorGradiente =
    turno.estado === "Pendiente"
      ? "from-yellow-500 to-yellow-600"
      : turno.estado === "Confirmado"
        ? "from-emerald-600 to-emerald-700"
        : turno.estado === "Cancelado"
          ? "from-red-600 to-red-700"
          : "from-gray-500 to-gray-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
        {/* HEADER */}
        <div
          className={`bg-gradient-to-r ${colorGradiente} text-white px-5 py-4 rounded-t-2xl flex items-center justify-between`}
        >
          <h2 className="text-lg font-semibold">Detalles del turno</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-white/80 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 text-sm text-gray-700">
          <Row icon={<User />} label="Paciente">
            {turno.pacienteNombre} {turno.pacienteApellido}
          </Row>

          <Row icon={<Stethoscope />} label="Profesional">
            {turno.profesionalNombre} {turno.profesionalApellido}
          </Row>

          <Row icon={<CalendarClock />} label="Fecha">
            {fecha}
          </Row>

          <Row icon={<Clock />} label="Horario">
            {horaInicio} – {horaFin}
          </Row>

          <Row label="Estado actual">
            <EstadoBadge estado={turno.estado} />
          </Row>

          {/* Se elimina edición: solo se muestra el estado actual */}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Subcomponente Row -------------------- */
function Row({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-500">{icon}</span>}
      <span className="font-semibold text-gray-800">{label}:</span>
      <span>{children}</span>
    </div>
  );
}

"use client";

import {
  X,
  User,
  Stethoscope,
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { TurnoConJoin } from "@/app/recepcionista/cal-turnos/_components/types";
import { EstadoBadge } from "./EstadoBadge";

type EstadoTurno = "Pendiente" | "Confirmado" | "Cancelado" | "Finalizado";

export function TurnoModal({
  turno,
  onClose,
}: {
  turno: TurnoConJoin;
  onClose: () => void;
}) {
  const actualizarEstado = useMutation(api.turnos.actualizarEstado);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTurno>(turno.estado);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error" | null>(null);

  const handleActualizar = async () => {
    try {
      setGuardando(true);
      await actualizarEstado({
        turnoId: turno._id,
        estado: nuevoEstado,
      });
      setMensaje("✅ Estado actualizado correctamente");
      setTipoMensaje("ok");
      setTimeout(() => {
        setMensaje(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setMensaje("❌ No se pudo actualizar el estado");
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

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

          {/* CAMBIO DE ESTADO */}
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Actualizar estado
            </h4>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoTurno)}
              className="border rounded-md p-2 text-sm w-full"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Finalizado">Finalizado</option>
            </select>

            <button
              onClick={handleActualizar}
              disabled={guardando}
              className={`mt-4 w-full flex items-center justify-center gap-2 text-white rounded-md py-2 transition ${guardando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>

          {mensaje && (
            <div
              className={`mt-3 text-center text-sm rounded-md py-2 ${tipoMensaje === "ok"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {mensaje}
            </div>
          )}
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

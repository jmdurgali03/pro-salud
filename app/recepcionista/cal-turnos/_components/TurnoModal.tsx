"use client";

import {
  X,
  CalendarClock,
  User,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TurnoConJoin } from "./types";

/* --------------------------
   🎨 Mapa de colores por estado
--------------------------- */
export const TURNO_COLOR_MAP: Record<
  "Pendiente" | "Confirmado" | "Cancelado" | "Finalizado",
  { bg: string; text: string; border: string; gradient: string }
> = {
  Pendiente: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    gradient: "from-yellow-500 to-yellow-600",
  },
  Confirmado: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    gradient: "from-emerald-600 to-emerald-700",
  },
  Cancelado: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    gradient: "from-red-600 to-red-700",
  },
  Finalizado: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    gradient: "from-blue-600 to-blue-700",
  },
};

type Modo = "ver" | "crear";

export function TurnoModal({
  turno,
  onClose,
  modo = "ver",
}: {
  turno?: TurnoConJoin;
  onClose: () => void;
  modo?: Modo;
}) {
  const crearTurno = useMutation(api.turnos.crear);
  const actualizarEstado = useMutation(api.turnos.actualizarEstado);
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const pacientes = useQuery(api.pacientes.listar, {}) ?? [];

  type EstadoTurno = "Pendiente" | "Confirmado" | "Cancelado" | "Finalizado";
  const [estado, setEstado] = useState<EstadoTurno>("Pendiente");
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTurno>(
    turno?.estado ?? "Pendiente"
  );

  const [profesionalId, setProfesionalId] = useState<string>("");
  const [pacienteId, setPacienteId] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");

  const [turnoLocal, setTurnoLocal] = useState<TurnoConJoin | undefined>(turno);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<"ok" | "error" | null>(null);

  const profesional = useMemo(
    () => profesionales.find((p) => p._id === profesionalId),
    [profesionalId, profesionales]
  );

  const horasDisponibles =
    profesionalId && fecha
      ? useQuery(api.turnos.horasDisponibles, {
          profesionalId: profesionalId as Id<"profesionales">,
          fecha,
        })
      : [];

  /* ---------------- Guardar estado ---------------- */
  const handleActualizarEstado = async () => {
    if (!turnoLocal?._id) return;
    setGuardando(true);
    setMensaje(null);

    try {
      await actualizarEstado({
        turnoId: turnoLocal._id,
        estado: nuevoEstado,
      });

      setTurnoLocal((prev) =>
        prev ? { ...prev, estado: nuevoEstado } : prev
      );

      setTipoMensaje("ok");
      setMensaje("✅ Estado actualizado correctamente.");
    } catch (err: any) {
      console.error(err);
      setTipoMensaje("error");
      setMensaje("❌ Error al actualizar el estado del turno.");
    } finally {
      setGuardando(false);
      setTimeout(() => {
        setMensaje(null);
        setTipoMensaje(null);
      }, 3000);
    }
  };

  /* ---------------- MODO VER ---------------- */
  if (modo === "ver" && turno) {
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

    const color = TURNO_COLOR_MAP[turno.estado as EstadoTurno];

    return (
      <ModalBase
        onClose={onClose}
        headerColor={color.gradient}
        title="Detalles del Turno"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <Row icon={<User />} label="Paciente">
            {turno.pacienteNombre} {turno.pacienteApellido ?? ""}
          </Row>
          <Row icon={<Stethoscope />} label="Profesional">
            {turno.profesionalNombre} {turno.profesionalApellido ?? ""}
          </Row>
          <Row icon={<CalendarClock />} label="Fecha">
            {fechaLocal}
          </Row>
          <Row icon={<Clock />} label="Horario">
            {horaInicio} a {horaFin}
          </Row>
          <Row label="Estado actual">
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}
            >
              {turno.estado}
            </span>
          </Row>
        </div>

        {/* 🔹 Gestión del turno */}
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-2">
            Gestión del turno
          </h4>
          <div className="flex flex-col gap-3">
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoTurno)}
              className="border rounded-md p-2 text-sm"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Finalizado">Finalizado</option>
            </select>

            <button
              disabled={guardando}
              onClick={handleActualizarEstado}
              className={`px-4 py-2 rounded-md text-white flex items-center justify-center gap-2 ${
                guardando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-5 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
          >
            Cerrar
          </button>
        </div>

        {/* 🔹 Mensaje de resultado */}
        {mensaje && (
          <div
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 
              w-[90%] max-w-sm text-center p-3 rounded-xl shadow-lg border
              animate-in fade-in slide-in-from-bottom-4
              ${
                tipoMensaje === "ok"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
          >
            {mensaje}
          </div>
        )}
      </ModalBase>
    );
  }

  /* ---------------- MODO CREAR ---------------- */
  // (mantén tu código original del modo crear sin cambios)
  // solo se deja el header con color verde base
  // ...
}

/* ---------------- Subcomponentes ---------------- */
function ModalBase({
  onClose,
  headerColor,
  title,
  children,
}: {
  onClose: () => void;
  headerColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
        <div
          className={`bg-gradient-to-r ${headerColor} text-white px-5 py-4 rounded-t-2xl flex items-center justify-between`}
        >
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-white/80 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

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

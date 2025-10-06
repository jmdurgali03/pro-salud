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
import { TURNO_COLOR_MAP, TurnoConJoin } from "./types";

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
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const pacientes = useQuery(api.pacientes.listar, {}) ?? [];

  const [profesionalId, setProfesionalId] = useState<string>("");
  const [pacienteId, setPacienteId] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");
  const [estado, setEstado] = useState<"Pendiente" | "Confirmado">("Pendiente");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const profesional = useMemo(
    () => profesionales.find((p) => p._id === profesionalId),
    [profesionalId, profesionales]
  );

  // 🔹 Cargar horarios disponibles según profesional y fecha
  const horasDisponibles =
    profesionalId && fecha
      ? useQuery(api.turnos.horasDisponibles, {
          profesionalId: profesionalId as Id<"profesionales">,
          fecha,
        })
      : [];

  // 🧩 Crear turno
  const handleCrear = async () => {
    if (!pacienteId || !profesionalId || !fecha || !horaSeleccionada) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }

    setError(null);
    const start = new Date(`${fecha}T${horaSeleccionada}`).getTime();
    const end = new Date(start + 30 * 60 * 1000).getTime(); // 30 min por turno

    setLoading(true);
    try {
      await crearTurno({
        pacienteId: pacienteId as Id<"pacientes">,
        profesionalId: profesionalId as Id<"profesionales">,
        tipo: "Consulta",
        estado,
        start,
        end,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear el turno.");
    } finally {
      setLoading(false);
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
    const badge = `inline-block rounded px-2 py-0.5 text-xs font-medium border ${TURNO_COLOR_MAP[turno.estado]}`;

    return (
      <ModalBase
        onClose={onClose}
        headerColor="from-emerald-600 to-emerald-700"
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
          <Row label="Estado">
            <span className={badge}>{turno.estado}</span>
          </Row>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
          >
            Cerrar
          </button>
        </div>
      </ModalBase>
    );
  }

  /* ---------------- MODO CREAR ---------------- */
  return (
    <ModalBase
      onClose={onClose}
      headerColor="from-emerald-500 to-emerald-600"
      title="Nuevo Turno"
    >
      <div className="space-y-4 text-sm text-gray-700">
        <Select
          label="Paciente"
          value={pacienteId}
          onChange={setPacienteId}
          options={pacientes.map((p: any) => ({
            value: p._id,
            label: `${p.nombre} ${p.apellido}`,
          }))}
        />

        <Select
          label="Profesional"
          value={profesionalId}
          onChange={(v) => {
            setProfesionalId(v);
            setHoraSeleccionada("");
          }}
          options={profesionales.map((p: any) => ({
            value: p._id,
            label: `${p.nombre} ${p.apellido}`,
          }))}
        />

        <div>
          <label className="block text-gray-700 font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              setHoraSeleccionada("");
            }}
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* 🔹 Horarios disponibles (24 h, sin input nativo) */}
        {profesionalId && fecha && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Horarios disponibles (24 h)
            </label>

            {!horasDisponibles ? (
              <p className="text-gray-400 text-sm">Cargando horarios...</p>
            ) : horasDisponibles.length === 0 ? (
              <p className="text-red-500 text-sm">Sin horarios disponibles</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {horasDisponibles.map((hora: string) => (
                  <button
                    key={hora}
                    onClick={() => setHoraSeleccionada(hora)}
                    className={`border rounded-md px-2 py-1 text-sm transition ${
                      horaSeleccionada === hora
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Select
          label="Estado inicial"
          value={estado}
          onChange={(v) => setEstado(v as any)}
          options={[
            { value: "Pendiente", label: "Pendiente" },
            { value: "Confirmado", label: "Confirmado" },
          ]}
        />

        {error && (
          <div className="flex items-center text-red-600 text-sm mt-2">
            <AlertCircle className="h-4 w-4 mr-1" /> {error}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-5 gap-3 border-t pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
        >
          Cancelar
        </button>
        <button
          disabled={loading}
          onClick={handleCrear}
          className={`px-4 py-2 rounded-md flex items-center gap-2 text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading ? "Guardando..." : "Crear turno"}
        </button>
      </div>
    </ModalBase>
  );
}

/* ---------------- Subcomponentes ---------------- */
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md p-2"
      >
        <option value="">Seleccionar {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

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

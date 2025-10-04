"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  defaultDate?: Date;
  turno?: any;
  trigger?: React.ReactNode;
};

export default function TurnoDialog({ defaultDate, turno, trigger }: Props) {
  const crearTurno = useMutation(api.turnos.crear);
  const editarTurno = useMutation(api.turnos.editar);
  const eliminarTurno = useMutation(api.turnos.eliminar);

  const pacientes = useQuery(api.pacientes.listar, {}) ?? [];
  const profesionales = useQuery(api.profesionales.listar, {}) ?? [];
  const especialidades = useQuery(api.especialidades.listar, {}) ?? [];

  const [open, setOpen] = useState(false);
  const [pacienteId, setPacienteId] = useState<Id<"pacientes"> | "">("");
  const [profesionalId, setProfesionalId] = useState<Id<"profesionales"> | "">("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState<"Confirmado" | "Pendiente" | "Cancelado">("Pendiente");
  const [fecha, setFecha] = useState<string>(""); // 🔹 nuevo campo de fecha
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [error, setError] = useState<string | null>(null);

  // 🔹 Solo profesionales activos
  const profesionalesConEspecialidad = profesionales
    .filter((p) => p.estado === "Activo")
    .map((p) => {
      const esp = especialidades.find((e) => e._id === p.especialidadId);
      return { ...p, especialidadNombre: esp?.nombre || "Sin especialidad" };
    });

  // Cargar datos al editar o resetear en nuevo
  useEffect(() => {
    if (turno) {
      setPacienteId(turno.pacienteId);
      setProfesionalId(turno.profesionalId);
      setTipo(turno.tipo);
      setEstado(turno.estado);
      const d1 = new Date(turno.start);
      const d2 = new Date(turno.end);
      setFecha(d1.toISOString().split("T")[0]);
      setHoraInicio(`${d1.getHours().toString().padStart(2, "0")}:${d1.getMinutes().toString().padStart(2, "0")}`);
      setHoraFin(`${d2.getHours().toString().padStart(2, "0")}:${d2.getMinutes().toString().padStart(2, "0")}`);
    } else {
      const hoy = defaultDate || new Date();
      setPacienteId("");
      setProfesionalId("");
      setTipo("");
      setEstado("Pendiente");
      setFecha(hoy.toISOString().split("T")[0]);
      setHoraInicio("09:00");
      setHoraFin("10:00");
    }
  }, [turno, open, defaultDate]);

  // Ajustar automáticamente hora fin
  useEffect(() => {
    const [hInicio, mInicio] = horaInicio.split(":").map(Number);
    const [hFin, mFin] = horaFin.split(":").map(Number);
    const diff = (hFin * 60 + mFin) - (hInicio * 60 + mInicio);
    if (diff < 30 || diff > 120) {
      const nuevaHora = new Date();
      nuevaHora.setHours(hInicio + 1, mInicio, 0, 0);
      const hh = nuevaHora.getHours().toString().padStart(2, "0");
      const mm = nuevaHora.getMinutes().toString().padStart(2, "0");
      setHoraFin(`${hh}:${mm}`);
    }
  }, [horaInicio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pacienteId) return setError("Debe seleccionar un paciente");
    if (!profesionalId) return setError("Debe seleccionar un profesional");
    if (!tipo) return setError("Debe seleccionar un tipo de consulta");
    if (!estado) return setError("Debe seleccionar un estado");
    if (!fecha) return setError("Debe seleccionar una fecha");

    const baseDate = new Date(fecha);
    const [h1, m1] = horaInicio.split(":").map(Number);
    const [h2, m2] = horaFin.split(":").map(Number);
    const start = new Date(baseDate);
    start.setHours(h1, m1, 0, 0);
    const end = new Date(baseDate);
    end.setHours(h2, m2, 0, 0);

    if (end <= start) {
      return setError("La hora de fin debe ser posterior a la de inicio");
    }

    try {
      if (turno) {
        await editarTurno({
          id: turno._id,
          pacienteId,
          profesionalId,
          tipo,
          estado,
          start: start.getTime(),
          end: end.getTime(),
        });
      } else {
        await crearTurno({
          pacienteId,
          profesionalId,
          tipo,
          estado,
          start: start.getTime(),
          end: end.getTime(),
        });
      }
      setOpen(false);
    } catch (err: any) {
      setError(err.data || "Ocurrió un error al guardar el turno");
    }
  };

  const handleDelete = async () => {
    if (turno) {
      await eliminarTurno({ id: turno._id });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-blue-600">+ Añadir Turno</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{turno ? "Editar Turno" : "Nuevo Turno"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paciente */}
          <div>
            <Label>Paciente</Label>
            <Select
              value={pacienteId || ""}
              onValueChange={(val) => setPacienteId(val as Id<"pacientes">)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.nombre} {p.apellido} – {p.dni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Profesional */}
          <div>
            <Label>Profesional</Label>
            <Select
              value={profesionalId || ""}
              onValueChange={(val) => setProfesionalId(val as Id<"profesionales">)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {profesionalesConEspecialidad.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.nombre} {p.apellido} – {p.especialidadNombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div>
            <Label>Tipo de Consulta</Label>
            <Select value={tipo} onValueChange={(val) => setTipo(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Consulta General">Consulta General</SelectItem>
                <SelectItem value="Terapia Física">Terapia Física</SelectItem>
                <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                <SelectItem value="Nutrición">Nutrición</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div>
            <Label>Estado</Label>
            <Select value={estado} onValueChange={(val) => setEstado(val as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha y horas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Hora inicio</Label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Hora fin</Label>
              <Input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between">
            {turno && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            )}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              {turno ? "Guardar cambios" : "Guardar Turno"}
            </Button>
          </div>

          {/* Error */}
          {error && <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

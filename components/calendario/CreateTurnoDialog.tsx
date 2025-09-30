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
  turno?: any; // si viene, es edición
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

  // Campos
  const [pacienteId, setPacienteId] = useState<Id<"pacientes"> | "">("");
  const [profesionalId, setProfesionalId] = useState<Id<"profesionales"> | "">("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState<"Confirmado" | "Pendiente" | "Cancelado">("Pendiente");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
const profesionalesConEspecialidad = profesionales.map((p) => {
  const esp = especialidades.find((e) => e._id === p.especialidadId);
  return { ...p, especialidadNombre: esp?.nombre || "Sin especialidad" };
});
  // 👉 estado para mensajes de error
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al editar o resetear en nuevo
  useEffect(() => {
    if (turno) {
      setPacienteId(turno.pacienteId);
      setProfesionalId(turno.profesionalId);
      setTipo(turno.tipo);
      setEstado(turno.estado);

      const d1 = new Date(turno.start);
      const d2 = new Date(turno.end);
      setHoraInicio(`${d1.getHours().toString().padStart(2, "0")}:${d1.getMinutes().toString().padStart(2, "0")}`);
      setHoraFin(`${d2.getHours().toString().padStart(2, "0")}:${d2.getMinutes().toString().padStart(2, "0")}`);
    } else {
      // reset al abrir nuevo turno
      setPacienteId("");
      setProfesionalId("");
      setTipo("");
      setEstado("Pendiente");
      setHoraInicio("09:00");
      setHoraFin("10:00");
    }
  }, [turno, open]);

  // 👇 Nuevo efecto: actualiza automáticamente la horaFin a +1 hora de horaInicio
  useEffect(() => {
    if (horaInicio) {
      const [h, m] = horaInicio.split(":").map(Number);
      const nuevaHora = new Date();
      nuevaHora.setHours(h + 1, m, 0, 0);

      const hh = nuevaHora.getHours().toString().padStart(2, "0");
      const mm = nuevaHora.getMinutes().toString().padStart(2, "0");

      setHoraFin(`${hh}:${mm}`);
    }
  }, [horaInicio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ Validaciones obligatorias
    if (!pacienteId) return setError("Debe seleccionar un paciente");
    if (!profesionalId) return setError("Debe seleccionar un profesional");
    if (!tipo) return setError("Debe seleccionar un tipo de consulta");
    if (!estado) return setError("Debe seleccionar un estado");

    const baseDate = defaultDate || (turno ? new Date(turno.start) : new Date());

    const [h1, m1] = horaInicio.split(":").map(Number);
    const [h2, m2] = horaFin.split(":").map(Number);

    const start = new Date(baseDate);
    start.setHours(h1, m1, 0, 0);

    const end = new Date(baseDate);
    end.setHours(h2, m2, 0, 0);

    // ✅ Validación: duración exacta de 1 hora
    if (end.getTime() - start.getTime() !== 60 * 60 * 1000) {
      return setError("El turno debe durar exactamente 1 hora");
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
      // 👇 Capturamos ConvexError limpio
      setError(err.data || "Ocurrió un error al guardar el turno");
      return;
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
                    {p.nombreCompleto} – {p.dni}
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
    {p.nombre} – {p.especialidadNombre}
  </SelectItem>
))}

              </SelectContent>
            </Select>
          </div>

          {/* Tipo de consulta */}
          <div>
            <Label>Tipo de Consulta</Label>
            <Select value={tipo} onValueChange={(val) => setTipo(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Consulta General">Consulta General</SelectItem>
                <SelectItem value="Terapia Física">Terapia Física</SelectItem>
                <SelectItem value="Consulta de Seguimiento">Consulta de Seguimiento</SelectItem>
                <SelectItem value="Consulta de Nutrición">Consulta de Nutrición</SelectItem>
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

          {/* Horario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hora inicio</Label>
              <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
            </div>
            <div>
              <Label>Hora fin</Label>
              <Input type="time" value={horaFin} readOnly required /> {/* 👈 ahora solo lectura */}
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

          {/* Mensaje de error elegante */}
          {error && (
            <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

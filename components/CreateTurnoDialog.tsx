"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

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

  const profesionales = useQuery(api.profesionales.listar) ?? []; // 👈 lista desde Convex

  const [open, setOpen] = useState(false);

  // Campos
  const [paciente, setPaciente] = useState("");
  const [profesionalId, setProfesionalId] = useState<Id<"profesionales"> | "">("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState<"Confirmado" | "Pendiente" | "Cancelado">("Pendiente");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");

  // Cargar datos al editar
  useEffect(() => {
    if (turno) {
      setPaciente(turno.paciente);
      setProfesionalId(turno.profesionalId); // ahora es Id
      setTipo(turno.tipo);
      setEstado(turno.estado);

      const d1 = new Date(turno.start);
      const d2 = new Date(turno.end);
      setHoraInicio(`${d1.getHours().toString().padStart(2, "0")}:${d1.getMinutes().toString().padStart(2, "0")}`);
      setHoraFin(`${d2.getHours().toString().padStart(2, "0")}:${d2.getMinutes().toString().padStart(2, "0")}`);
    }
  }, [turno]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profesionalId) return alert("Debe seleccionar un profesional");

    const baseDate = defaultDate || (turno ? new Date(turno.start) : new Date());

    const [h1, m1] = horaInicio.split(":").map(Number);
    const [h2, m2] = horaFin.split(":").map(Number);

    const start = new Date(baseDate);
    start.setHours(h1, m1, 0, 0);

    const end = new Date(baseDate);
    end.setHours(h2, m2, 0, 0);

    if (turno) {
      await editarTurno({
        id: turno._id,
        paciente,
        profesionalId, // 👈 FK
        tipo,
        estado,
        start: start.getTime(),
        end: end.getTime(),
      });
    } else {
      await crearTurno({
        paciente,
        profesionalId, // 👈 FK
        tipo,
        estado,
        start: start.getTime(),
        end: end.getTime(),
      });
    }

    setOpen(false);
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
          <div>
            <Label>Paciente</Label>
            <Input value={paciente} onChange={(e) => setPaciente(e.target.value)} required />
          </div>

          <div>
            <Label>Profesional</Label>
            <Select value={profesionalId || ""} onValueChange={(val) => setProfesionalId(val as Id<"profesionales">)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {profesionales.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.nombre} – {p.especialidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hora inicio</Label>
              <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
            </div>
            <div>
              <Label>Hora fin</Label>
              <Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
            </div>
          </div>

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
        </form>
      </DialogContent>
    </Dialog>
  );
}

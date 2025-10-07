"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [fecha, setFecha] = useState<string>("");
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [duracion, setDuracion] = useState(30);

  // 🔹 Solo profesionales activos con nombre de especialidad
  const profesionalesConEspecialidad = profesionales
    .filter((p) => p.estado === "Activo")
    .map((p) => {
      const esp = especialidades.find((e) => e._id === p.especialidadId);
      return { ...p, especialidadNombre: esp?.nombre || "Sin especialidad" };
    });

  // 🔹 Obtener franjas horarias del profesional
  const profesional = useMemo(
    () => profesionales.find((p) => p._id === profesionalId),
    [profesionalId, profesionales]
  );

  const franjas = profesional?.franjasHorarias ?? [];

  // 🔹 Traer horas disponibles dinámicamente
  const horasArgs =
    profesionalId && fecha
      ? {
        profesionalId: profesionalId as Id<"profesionales">,
        fecha,
        duracion,
      }
      : "skip";

  const horasDisponibles = useQuery(api.turnos.horasDisponibles, horasArgs) ?? [];

  // 🔹 Cargar datos al abrir (modo edición o nuevo)
  useEffect(() => {
    if (turno) {
      setPacienteId(turno.pacienteId);
      setProfesionalId(turno.profesionalId);
      setTipo(turno.tipo);
      setEstado(turno.estado);
      const d1 = new Date(turno.start);
      setFecha(d1.toISOString().split("T")[0]);
      const hora = `${d1.getHours().toString().padStart(2, "0")}:${d1
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      setHoraSeleccionada(hora);
    } else {
      const hoy = defaultDate || new Date();
      setPacienteId("");
      setProfesionalId("");
      setTipo("");
      setEstado("Pendiente");
      setFecha(hoy.toISOString().split("T")[0]);
      setHoraSeleccionada("");
    }
  }, [turno, open, defaultDate]);

  // 🧩 Crear o editar turno
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pacienteId || !profesionalId || !fecha || !horaSeleccionada)
      return setError("Debe completar todos los campos obligatorios.");

    const [year, month, day] = fecha.split("-").map(Number);
    const [h, m] = horaSeleccionada.split(":").map(Number);
    const start = new Date(year, month - 1, day, h, m, 0, 0);
    const end = new Date(start.getTime() + duracion * 60 * 1000);

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

  // 🕗 --- FILTRO DE HORARIOS SEGÚN FRANJAS HORARIAS ---
  // 🔹 Convertir "HH:mm" a minutos para comparar fácilmente
  const horaToMin = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
  };

  // 🔹 Filtrar horarios según TODAS las franjas del profesional
  const horariosFiltrados = useMemo(() => {
    if (!profesional || !horasDisponibles) return [];

    const franjas = profesional.franjasHorarias ?? [];

    // Si el profesional no tiene franjas configuradas, mostrar todo
    if (franjas.length === 0) return horasDisponibles;

    return horasDisponibles.filter((hora: string) => {
      const min = horaToMin(hora);
      const finTurno = min + duracion; // hora de fin del turno

      // ✅ Mantener solo los horarios que caen dentro de alguna franja completa
      return franjas.some((f: any) => {
        const inicioMin = horaToMin(f.inicio);
        const finMin = horaToMin(f.fin);
        return min >= inicioMin && finTurno <= finMin;
      });
    });
  }, [profesional, horasDisponibles, duracion]);


  // --- FIN DEL FILTRO ---

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-blue-600">+ Añadir Turno</Button>}
      </DialogTrigger>

      <DialogContent className="max-w-md space-y-2">
        <DialogHeader>
          <DialogTitle>{turno ? "Editar Turno" : "Nuevo Turno"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paciente */}
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>Profesional</Label>
            <Select
              value={profesionalId || ""}
              onValueChange={(val) => {
                setProfesionalId(val as Id<"profesionales">);
                setHoraSeleccionada("");
              }}
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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

          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Duración */}
          <div className="space-y-2">
            <Label>Duración del turno (minutos)</Label>
            <Input
              type="number"
              min={10}
              max={120}
              step={1}
              value={duracion}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDuracion(Number(e.target.value))
              }
              className="w-28"
            />
          </div>

          {/* Horarios disponibles */}
          {profesionalId && fecha && (
            <div className="space-y-2">
              <Label>Horarios disponibles</Label>

              {!horasDisponibles ? (
                <p className="text-gray-400 text-sm mt-1">Cargando horarios...</p>
              ) : horariosFiltrados.length === 0 ? (
                <p className="text-gray-500 text-sm mt-1">
                  No hay horarios disponibles dentro del horario de atención
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {horariosFiltrados.map((hora: string) => (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => setHoraSeleccionada(hora)}
                      className={`border rounded-md px-3 py-1 text-sm transition-all ${horaSeleccionada === hora
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

          {/* Botones */}
          <div className="flex justify-between items-center pt-3 border-t mt-3">
            {turno && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </Button>
            )}
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
            >
              {turno ? "Guardar cambios" : "Guardar Turno"}
            </Button>
          </div>

          {error && (
            <div className="mt-3 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

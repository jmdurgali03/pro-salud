"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TurnoConJoin } from "@/app/recepcionista/cal-turnos/_components/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";

export default function EditTurnoDialog({
  turno,
  open,
  onOpenChange,
}: {
  turno: TurnoConJoin | null;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const editarTurno = useMutation(api.turnos.editar);
  const profesionales = useQuery(api.profesionales.listar, {}) ?? [];

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const actualOpen = isControlled ? open : internalOpen;
  const setOpenValue = isControlled ? onOpenChange! : setInternalOpen;

  const [estado, setEstado] = useState<
    "Confirmado" | "Pendiente" | "Cancelado" | "Finalizado"
  >("Pendiente");
  const [fecha, setFecha] = useState("");
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [duracion, setDuracion] = useState(30);
  const [error, setError] = useState<string | null>(null);

  // 🧩 Calcular profesional
  const profesional =
    profesionales?.find((p) => p._id === turno?.profesionalId) ?? null;

  // 🕐 Cargar datos iniciales
  useEffect(() => {
    if (turno) {
      setEstado(turno.estado);
      const d1 = new Date(turno.start);
      setFecha(d1.toISOString().split("T")[0]);
      const hora = `${d1.getHours().toString().padStart(2, "0")}:${d1
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      setHoraSeleccionada(hora);
      setDuracion(turno.duracion ?? 30);
    }
  }, [turno]);

  // ⏰ Horas disponibles
  const horasArgs =
    profesional && fecha
      ? { profesionalId: profesional._id, fecha, duracion }
      : "skip";

  const horasDisponibles =
    useQuery(api.turnos.horasDisponibles, horasArgs) ?? [];

  const horaToMin = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
  };

  const horariosFiltrados = useMemo(() => {
    if (!profesional || !horasDisponibles) return [];
    const franjas = profesional.franjasHorarias ?? [];
    if (franjas.length === 0) return horasDisponibles;

    return horasDisponibles.filter((hora: string) => {
      const min = horaToMin(hora);
      const finTurno = min + duracion;
      return franjas.some((f: any) => {
        const inicioMin = horaToMin(f.inicio);
        const finMin = horaToMin(f.fin);
        return min >= inicioMin && finTurno <= finMin;
      });
    });
  }, [profesional, horasDisponibles, duracion]);

  // 💾 Guardar cambios
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!turno) return;
    if (!fecha || !horaSeleccionada)
      return setError("Debe seleccionar fecha y horario.");

    const [y, m, d] = fecha.split("-").map(Number);
    const [h, min] = horaSeleccionada.split(":").map(Number);
    const start = new Date(y, m - 1, d, h, min);
    const end = new Date(start.getTime() + duracion * 60 * 1000);

    const ahora = new Date();
    // Permitir cambiar estado a Finalizado/Cancelado para turnos pasados
    if (start < ahora && !(estado === "Finalizado" || estado === "Cancelado")) {
      return setError(
        "Para turnos en el pasado solo se permite cambiar el estado a Finalizado o Cancelado."
      );
    }

    try {
      await editarTurno({
        id: turno._id,
        estado,
        start: start.getTime(),
        end: end.getTime(),
        duracion,
      });
      setOpenValue(false);
    } catch (err: any) {
      console.error(err);
      setError(err.data || "Ocurrió un error al actualizar el turno.");
    }
  };

  // 🔹 Render seguro: siempre se ejecutan los hooks, aunque turno sea null
  const cargando = !turno || !profesional;

  return (
    <Dialog open={actualOpen} onOpenChange={setOpenValue}>
      <DialogContent className="max-w-md space-y-3">
        <DialogHeader>
          <DialogTitle>Editar turno</DialogTitle>
        </DialogHeader>

        {cargando ? (
          <p className="text-center text-sm text-gray-500 py-4">
            Cargando datos del turno...
          </p>
        ) : (
          <form onSubmit={handleGuardar} className="space-y-4">
            {/* 🧍 Paciente y profesional (solo lectura) */}
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Input
                value={`${turno.pacienteNombre ?? ""} ${
                  turno.pacienteApellido ?? ""
                }`}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              <Label>Profesional</Label>
              <Input
                value={`${turno.profesionalNombre ?? ""} ${
                  turno.profesionalApellido ?? ""
                }`}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Estado editable */}
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Confirmado">Confirmado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha editable */}
            <div className="space-y-1">
              <Label>Fecha</Label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>

            {/* Horarios disponibles */}
            {profesional && fecha && (
              <div className="space-y-1">
                <Label>Horario</Label>
                {!horariosFiltrados.length ? (
                  <p className="text-sm text-gray-500">
                    Sin horarios disponibles
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {horariosFiltrados.map((hora) => (
                      <button
                        key={hora}
                        type="button"
                        onClick={() => setHoraSeleccionada(hora)}
                        className={`border rounded-md px-3 py-1 text-sm transition ${
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

            {/* Duración editable */}
            <div className="space-y-1">
              <Label>Duración (min)</Label>
              <Input
                type="number"
                min={10}
                max={120}
                step={5}
                value={duracion}
                onChange={(e) => setDuracion(Number(e.target.value))}
                className="w-28"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end pt-3 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenValue(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Guardar cambios
              </Button>
            </div>

            {error && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

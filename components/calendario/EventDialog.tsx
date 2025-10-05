"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Base = {
  title: string;
  paciente: string;
  profesional: string;
  tipo: string;
  estado: "Confirmado" | "Pendiente" | "Cancelado";
  start: Date;
  end: Date;
  notas?: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<Base>;
  onClose: () => void;
  onSubmit: (data: Base) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export default function EventDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [paciente, setPaciente] = useState(initial?.paciente ?? "");
  const [profesional, setProfesional] = useState(initial?.profesional ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [estado, setEstado] = useState<
    "Confirmado" | "Pendiente" | "Cancelado"
  >(initial?.estado ?? "Confirmado");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar campos con valores previos o por defecto
  useEffect(() => {
    if (initial?.start) {
      const d = new Date(initial.start);
      const e = new Date(initial.end ?? d);
      setDate(d.toISOString().slice(0, 10));
      setStartTime(d.toTimeString().slice(0, 5));
      setEndTime(e.toTimeString().slice(0, 5));
    } else {
      const now = new Date();
      const in1h = new Date(now.getTime() + 60 * 60 * 1000);
      setDate(now.toISOString().slice(0, 10));
      setStartTime(now.toTimeString().slice(0, 5));
      setEndTime(in1h.toTimeString().slice(0, 5));
    }
  }, [initial, open]);

  const makeDate = (ds: string, ts: string) => new Date(`${ds}T${ts}:00`);

  const canSave = useMemo(
    () => !!(paciente && profesional && tipo && date && startTime && endTime),
    [paciente, profesional, tipo, date, startTime, endTime]
  );

  const handleSave = async () => {
    setError(null);
    if (!canSave) {
      setError("Complete todos los campos obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const start = makeDate(date, startTime);
      const end = makeDate(date, endTime);

      if (end <= start) {
        setError("La hora de fin debe ser posterior a la hora de inicio.");
        setSaving(false);
        return;
      }

      await onSubmit({
        title: title || `${paciente} (${tipo})`,
        paciente,
        profesional,
        tipo,
        estado,
        start,
        end,
        notas: initial?.notas,
      });
      onClose();
    } catch (err) {
      setError("Ocurrió un error al guardar el turno.");
    } finally {
      setSaving(false);
    }
  };

  const header = mode === "create" ? "Nuevo turno" : "Editar turno";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg bg-gray-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {header}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Información general */}
          <section>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Información del turno
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título (opcional)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Sofía Rodríguez (Consulta)"
                />
              </div>
              <div>
                <Label>Paciente *</Label>
                <Input
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Nombre y apellido"
                  required
                />
              </div>
              <div>
                <Label>Profesional *</Label>
                <Input
                  value={profesional}
                  onChange={(e) => setProfesional(e.target.value)}
                  placeholder="Ej: Dr. García"
                  required
                />
              </div>
              <div>
                <Label>Tipo de consulta *</Label>
                <Input
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  placeholder="Consulta, Nutrición, Terapia..."
                  required
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={estado} onValueChange={(v: any) => setEstado(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmado">Confirmado</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Programación */}
          <section>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Fecha y horario
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Hora inicio *</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Hora fin *</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 text-sm rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Acciones */}
        <DialogFooter className="gap-2 mt-2">
          {mode === "edit" && onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={saving}
            >
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button disabled={!canSave || saving} onClick={handleSave}>
            {saving ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function EventDialog({ open, mode, initial, onClose, onSubmit, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [paciente, setPaciente] = useState(initial?.paciente ?? "");
  const [profesional, setProfesional] = useState(initial?.profesional ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [estado, setEstado] = useState<"Confirmado" | "Pendiente" | "Cancelado">(initial?.estado ?? "Confirmado");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Inicializar controles a partir de initial.start/end
  useEffect(() => {
    if (initial?.start) {
      const d = initial.start instanceof Date ? initial.start : new Date(initial.start);
      const e = initial.end instanceof Date ? initial.end : new Date(initial.end!);
      const toIso = (x: Date) => x.toISOString();
      const dateStr = toIso(d).slice(0, 10); // YYYY-MM-DD
      const hhmm = (x: Date) => x.toTimeString().slice(0, 5); // HH:mm
      setDate(dateStr);
      setStartTime(hhmm(d));
      setEndTime(hhmm(e));
    } else {
      // defaults: ahora + 1 hora
      const now = new Date();
      const in1h = new Date(now.getTime() + 60 * 60 * 1000);
      setDate(now.toISOString().slice(0, 10));
      setStartTime(now.toTimeString().slice(0, 5));
      setEndTime(in1h.toTimeString().slice(0, 5));
    }
  }, [initial?.start, initial?.end, open]);

  const header = mode === "create" ? "Nuevo turno" : "Editar turno";

  const makeDate = (ds: string, ts: string) => new Date(`${ds}T${ts}:00`);

  const canSave = useMemo(() => {
    return title && paciente && profesional && tipo && date && startTime && endTime;
  }, [title, paciente, profesional, tipo, date, startTime, endTime]);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const start = makeDate(date, startTime);
      const end = makeDate(date, endTime);
      await onSubmit({ title, paciente, profesional, tipo, estado, start, end, notas: initial?.notas });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Sofía Rodríguez (Consulta)" />
          </div>

          <div>
            <Label>Paciente</Label>
            <Input value={paciente} onChange={(e) => setPaciente(e.target.value)} />
          </div>
          <div>
            <Label>Profesional</Label>
            <Input value={profesional} onChange={(e) => setProfesional(e.target.value)} />
          </div>

          <div>
            <Label>Tipo</Label>
            <Input value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Consulta, Nutrición, etc." />
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={estado} onValueChange={(v: any) => setEstado(v)}>
              <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Hora inicio</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <Label>Hora fin</Label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {mode === "edit" && onDelete && (
            <Button variant="destructive" onClick={onDelete}>Eliminar</Button>
          )}
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSave || saving} onClick={handleSave}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { Id } from "@/convex/_generated/dataModel";

export type TurnoConJoin = {
  _id: Id<"turnos">;
  start: number;
  end: number;
  tipo: string;
  estado: "Confirmado" | "Pendiente" | "Cancelado";

  // 🔹 Paciente
  pacienteId: Id<"pacientes">;
  pacienteNombre: string;
  pacienteApellido: string;

  // 🔹 Profesional
  profesionalId: Id<"profesionales">;
  profesionalNombre: string;
  profesionalEstado: "Activo" | "Inactivo";
  especialidadNombre?: string;
};

// 🔹 Colores por estado del turno
export const TURNO_COLOR_MAP: Record<string, string> = {
  Confirmado: "bg-green-100 border-green-400 text-green-700",
  Pendiente: "bg-yellow-100 border-yellow-400 text-yellow-700",
  Cancelado: "bg-red-100 border-red-400 text-red-700",
};

// 🔹 Helpers de fechas
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const startOfWeekMonday = (d: Date) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  return addDays(d, diff);
};

export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = startOfWeekMonday(firstDay);

  const days: { day: number; date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    days.push({
      day: d.getDate(), // 🔹 agregado
      date: d,
      isCurrentMonth: d.getMonth() === month,
    });
  }

  return days;
};


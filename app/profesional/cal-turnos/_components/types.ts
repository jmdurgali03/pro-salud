import { Id } from "@/convex/_generated/dataModel";

export type TurnoConJoin = {
  _id: Id<"turnos">;
  pacienteId: Id<"pacientes">;
  start: number;
  end: number;
  pacienteNombre: string;
  pacienteApellido: string;
  profesionalApellido: string;
  profesionalNombre: string;
  especialidadNombre?: string;
  estado: "Pendiente" | "Confirmado" | "Cancelado" | "Finalizado";
  tipo?: string;
  title?: string;
};

/** Utilidades compartidas */
export const TURNO_COLOR_MAP: Record<TurnoConJoin["estado"], string> = {
  Pendiente:
    "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200",
  Confirmado:
    "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
  Cancelado:
    "bg-red-100 text-red-800 border-red-300 line-through",
  Finalizado:
    "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
};

/** Utilidades de fecha */
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const startOfWeekMonday = (date: Date) => {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0=Lunes ... 6=Domingo
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  // 🟢 Ajuste: fuerza a que el lunes sea el primer día (0 = lunes)
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

  const days: { day: number; date: Date; isCurrentMonth: boolean }[] = [];

  // 🔹 Días del mes anterior para completar la primera semana
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prev = new Date(year, month, -startingDayOfWeek + i + 1);
    days.push({ day: prev.getDate(), date: prev, isCurrentMonth: false });
  }

  // 🔹 Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    const current = new Date(year, month, i);
    days.push({ day: i, date: current, isCurrentMonth: true });
  }

  // 🔹 Días del siguiente mes hasta completar 42 (6 semanas)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const next = new Date(year, month + 1, i);
    days.push({ day: i, date: next, isCurrentMonth: false });
  }

  return days;
};

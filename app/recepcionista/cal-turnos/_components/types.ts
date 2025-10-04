import { Id } from "@/convex/_generated/dataModel";

export type TurnoConJoin = {
  _id: Id<"turnos">;
  start: number;
  end: number;
  pacienteNombre: string;
  pacienteApellido: string;
  profesionalApellido: string;
  profesionalNombre: string;
  profesionalEstado: "Activo" | "Inactivo";

  especialidadNombre?: string;
  estado: "Pendiente" | "Confirmado" | "Cancelado" | "Finalizado";
  tipo?: string;
  title?: string;
};

/** Utilidades compartidas */
export const TURNO_COLOR_MAP: Record<TurnoConJoin["estado"], string> = {
  Pendiente:
    "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
  Confirmado:
    "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
  Cancelado:
    "bg-red-100 text-red-800 border-red-300 line-through",
  Finalizado:
    "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200",
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
  const startingDayOfWeek = firstDay.getDay();
  const days: { day: number; isCurrentMonth: boolean }[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }
  return days;
};
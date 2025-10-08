"use client";
import { Id } from "@/convex/_generated/dataModel";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays as addDaysFns,
} from "date-fns";
import { es } from "date-fns/locale";

/* -------------------------------------------------------------------------- */
/* 🩺 Tipos de datos                                                          */
/* -------------------------------------------------------------------------- */
export type TurnoConJoin = {
  _id: Id<"turnos">;
  start: number;
  end: number;
  tipo: string;
  duracion: number;
  estado: "Confirmado" | "Pendiente" | "Cancelado" | "Finalizado";

  // 🔹 Paciente
  pacienteId: Id<"pacientes">;
  pacienteNombre: string;
  pacienteApellido: string;

  // 🔹 Profesional
  profesionalId: Id<"profesionales">;
  profesionalNombre: string;
  profesionalApellido: string;
  profesionalEstado: "Activo" | "Inactivo";
  especialidadNombre?: string;
};

/* -------------------------------------------------------------------------- */
/* 🎨 Colores por estado del turno                                           */
/* -------------------------------------------------------------------------- */
export const TURNO_COLOR_MAP: Record<string, string> = {
  Confirmado: "bg-green-100 border-green-400 text-green-700",
  Pendiente: "bg-yellow-100 border-yellow-400 text-yellow-700",
  Cancelado: "bg-red-100 border-red-400 text-red-700",
  Finalizado: "bg-blue-100 border-blue-400 text-blue-700",

};

/* -------------------------------------------------------------------------- */
/* 🧭 Helpers de fechas                                                      */
/* -------------------------------------------------------------------------- */
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

/**
 * 🔹 Devuelve el lunes de la semana de la fecha dada (formato local argentino)
 */
export const startOfWeekMonday = (d: Date) =>
  startOfWeek(d, { weekStartsOn: 1, locale: es });

/**
 * 🔹 Genera los días visibles del mes (incluyendo días previos/siguientes
 *    para completar las 6 filas del calendario mensual).
 */
export const getDaysInMonth = (date: Date) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1, locale: es });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1, locale: es });

  const days: { day: number; date: Date; isCurrentMonth: boolean }[] = [];

  let current = start;
  while (current <= end) {
    days.push({
      day: current.getDate(),
      date: current,
      isCurrentMonth: current.getMonth() === date.getMonth(),
    });
    current = addDaysFns(current, 1);
  }

  return days;
};

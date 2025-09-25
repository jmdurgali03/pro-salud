"use client";

import { Calendar, dateFnsLocalizer, SlotInfo, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css"; // 👈 nuestro override

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
};

type Props = {
  events: CalendarEvent[];
  onRangeChange: (from: Date, to: Date, view: View) => void;
  onCreateFromSlot: (slot: { start: Date; end: Date }) => void;
  onEditEvent: (event: CalendarEvent) => void;
};

export default function TurnosCalendar({
  events,
  onRangeChange,
  onCreateFromSlot,
  onEditEvent,
}: Props) {
  return (
    <div
      className="rounded-md border bg-white p-2"
      style={{ height: 400, width: "100%" }} // 👈 altura reducida
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={["month", "week", "day"]}
        culture="es"
        messages={{
          month: "Mes",
          week: "Semana",
          day: "Día",
          today: "Hoy",
          previous: "‹",
          next: "›",
          noEventsInRange: "No hay turnos en este rango.",
        }}
        selectable
        onSelectSlot={(slot: SlotInfo) =>
          onCreateFromSlot({ start: slot.start as Date, end: slot.end as Date })
        }
        onSelectEvent={(ev: any) => onEditEvent(ev as CalendarEvent)}
        onRangeChange={(range, view) => {
          const safeView: View = view ?? "month";
          if (Array.isArray(range)) {
            onRangeChange(range[0], range[range.length - 1], safeView);
          } else {
            onRangeChange(
              (range as { start: Date; end: Date }).start,
              (range as { start: Date; end: Date }).end,
              safeView
            );
          }
        }}
      />
    </div>
  );
}

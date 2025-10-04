"use client";

import { sameDay, TURNO_COLOR_MAP, TurnoConJoin } from "./types";

type Props = {
  days: Date[];                 // 1 (día) o 7 (semana)
  turnos: TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
  startHour?: number;           // default 8
  endHour?: number;             // default 20
  slotMinutes?: number;         // default 30
};

/** Vista de agenda con huecos libres (slots de tiempo) */
export function AgendaView({
  days,
  turnos,
  onSelectTurno,
  startHour = 8,
  endHour = 20,
  slotMinutes = 30,
}: Props) {
  // Genero slots 08:00 -> 20:00 cada 30'
  const slots: Date[] = [];
  const todayBase = new Date();
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += slotMinutes) {
      const d = new Date(
        todayBase.getFullYear(),
        todayBase.getMonth(),
        todayBase.getDate(),
        h,
        m,
        0,
        0
      );
      slots.push(d);
    }
  }

  // Helper: obtiene el turno que cae exactamente en un slot (por inicio)
const getTurnoAt = (day: Date, slot: Date) =>
  turnos.find((t) => {
    const start = new Date(t.start);
    const end = new Date(t.end);
    return sameDay(start, day) && slot >= start && slot < end;
  });

  const dayHeader = (d: Date) =>
    d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <div className="flex-1 p-6 overflow-x-auto">
      {/* Encabezados por día */}
      <div
        className={`grid ${
          days.length === 1 ? "grid-cols-[80px_1fr]" : "grid-cols-[80px_repeat(7,minmax(140px,1fr))]"
        } border-b border-gray-200`}
      >
        <div className="p-2 text-xs font-semibold text-gray-500">Hora</div>
        {days.map((d, idx) => (
          <div
            key={idx}
            className="p-2 text-xs font-semibold text-gray-600 text-center bg-gray-50"
          >
            {dayHeader(d)}
          </div>
        ))}
      </div>

      {/* Grid de slots */}
      <div
        className={`grid ${
          days.length === 1 ? "grid-cols-[80px_1fr]" : "grid-cols-[80px_repeat(7,minmax(140px,1fr))]"
        }`}
      >
        {/* Columna izquierda con horas */}
        <div className="border-r border-gray-200">
          {slots.map((slot, i) => (
            <div
              key={i}
              className="h-14 border-b border-gray-100 text-[11px] text-gray-400 flex items-start justify-end pr-2 pt-1"
            >
              { slot.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })
}
            </div>
          ))}
        </div>

        {/* Columnas por día */}
        {days.map((day, colIdx) => (
          <div key={colIdx} className="border-r border-gray-200">
            {slots.map((slot, i) => {
              const turno = getTurnoAt(day, slot);
              return (
                <div
                  key={i}
                  className={`h-14 border-b border-gray-100 p-1 ${
                    turno ? "bg-purple-50" : "bg-white"
                  }`}
                >
                  {turno ? (
                    <button
                      onClick={() => onSelectTurno(turno)}
                      className={`w-full h-full rounded border text-xs px-2 py-1 text-left truncate ${TURNO_COLOR_MAP[turno.estado]}`}
                      title={`${turno.pacienteNombre} ${turno.pacienteApellido} — ${new Date(turno.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    >
                      {turno.pacienteNombre || "Paciente"} •{" "}
                      {new Date(turno.start).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })
}
                    </button>
                  ) : (
                    <div className="h-full w-full rounded bg-white"></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

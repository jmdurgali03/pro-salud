"use client";

import { TURNO_COLOR_MAP, TurnoConJoin } from "./types";

type Props = {
  diasSemana: string[];
  weeks: { day: number; isCurrentMonth: boolean }[][];
  getEventsForDay: (day: number, isCurrentMonth: boolean) => TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
};

export function CalendarioGrid({
  diasSemana,
  weeks,
  getEventsForDay,
  onSelectTurno,
}: Props) {
  return (
    <div className="flex-1 p-6">
      {/* ✅ 7 columnas, no 8 */}
      <div className="grid grid-cols-7 gap-1">
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="text-center text-xs font-semibold text-gray-500 py-2"
          >
            {dia}
          </div>
        ))}
      </div>

      {weeks.map((week, i) => (
        // ✅ También 7 columnas aquí
        <div key={i} className="grid grid-cols-7 gap-1">
          {week.map((dayObj, j) => {
            const events = getEventsForDay(dayObj.day, dayObj.isCurrentMonth);
            return (
              <div
                key={j}
                className={`min-h-28 border border-gray-200 rounded-lg p-2 ${
                  dayObj.isCurrentMonth ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    dayObj.isCurrentMonth ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {dayObj.day}
                </div>

                <div className="space-y-1">
                  {events.slice(0, 3).map((ev) => (
                    <button
                      key={ev._id}
                      onClick={() => onSelectTurno(ev)}
                      className={`w-full text-left px-2 py-1 rounded border text-xs cursor-pointer truncate ${TURNO_COLOR_MAP[ev.estado]}`}
                      title={`${ev.pacienteNombre} ${ev.pacienteApellido} — ${new Date(ev.start).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}`}
                    >
                      <span className="text-black">
                        {ev.pacienteNombre} {ev.pacienteApellido}
                      </span>
                    </button>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-gray-500 text-center">
                      +{events.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

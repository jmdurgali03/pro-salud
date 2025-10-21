"use client";

import { TURNO_COLOR_MAP, TurnoConJoin } from "./types";

type Props = {
  diasSemana: string[];
  weeks: { date: Date; isCurrentMonth: boolean }[][];
  getEventsForDay: (day: number, isCurrentMonth: boolean) => TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
};

export function CalendarioGrid({
  diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  weeks,
  getEventsForDay,
  onSelectTurno,
}: Props) {
  return (
    <div className="flex-1 p-4 md:p-6 overflow-hidden">
      {/* 🔹 Encabezado de días */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="text-center text-xs font-semibold text-gray-500 py-2 uppercase tracking-wide"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* 🔹 Celdas del calendario */}
      {weeks.map((week, i) => (
        <div key={i} className="grid grid-cols-7 gap-1">
          {week.map((dayObj, j) => {
            const events = getEventsForDay(
              dayObj.date.getDate(),
              dayObj.isCurrentMonth
            );

            return (
              <div
                key={j}
                className={`min-h-[100px] rounded-lg border border-gray-200 p-2 transition-all duration-200 ${
                  dayObj.isCurrentMonth
                    ? "bg-white hover:bg-emerald-50"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                {/* 🔸 Día */}
                <div
                  className={`text-sm font-semibold mb-1 ${
                    dayObj.isCurrentMonth ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {dayObj.date.getDate()}
                </div>

                {/* 🔸 Eventos del día */}
                <div className="space-y-1">
                  {events.slice(0, 3).map((ev) => {
  const color = TURNO_COLOR_MAP[ev.estado] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <button
      key={ev._id}
      onClick={() => onSelectTurno(ev)}
      className={`w-full text-left px-2 py-1 rounded border text-xs cursor-pointer truncate transition-all hover:opacity-90 ${color}`}
      title={`${ev.pacienteNombre} ${ev.pacienteApellido} — ${new Date(
        ev.start
      ).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`}
    >
      <span className="text-black">
        {ev.pacienteNombre} {ev.pacienteApellido}
      </span>
    </button>
  );
})}


                  {/* 🔹 Mostrar si hay más turnos */}
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

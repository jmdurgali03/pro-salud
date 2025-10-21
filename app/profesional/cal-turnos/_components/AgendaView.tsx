"use client";

import { sameDay, TURNO_COLOR_MAP, TurnoConJoin } from "./types";

type Props = {
  days: Date[];
  turnos: TurnoConJoin[];
  onSelectTurno: (t: TurnoConJoin) => void;
  startHour?: number;
  endHour?: number;
  slotMinutes?: number;
};

export function AgendaView({
  days,
  turnos,
  onSelectTurno,
  startHour = 8,
  endHour = 20,
  slotMinutes = 30,
}: Props) {
  const horas: number[] = [];
  for (let h = startHour; h <= endHour; h++) horas.push(h);

  const toLocal = (t: number) => {
    const d = new Date(t);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
  };

  const dayHeader = (d: Date) =>
    d.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

  const horaPx = 60;
  const minutosAPx = (min: number) => (min / 60) * horaPx;

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      {/* 🔹 Encabezado de días */}
      <div
        className={`grid ${
          days.length === 1
            ? "grid-cols-[80px_1fr]"
            : "grid-cols-[80px_repeat(7,minmax(140px,1fr))]"
        } border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm rounded-t-md`}
      >
        <div className="p-3 text-xs font-semibold text-gray-500 text-right pr-4">Hora</div>
        {days.map((d, idx) => (
          <div
            key={idx}
            className={`p-3 text-xs font-semibold text-gray-700 text-center ${
              sameDay(d, new Date()) ? "bg-emerald-100 text-emerald-800 rounded-t-md" : "bg-gray-50"
            }`}
          >
            {dayHeader(d)}
          </div>
        ))}
      </div>

      {/* 🔹 Cuerpo de la agenda */}
      <div
        className={`grid ${
          days.length === 1
            ? "grid-cols-[80px_1fr]"
            : "grid-cols-[80px_repeat(7,minmax(140px,1fr))]"
        } relative bg-white shadow-sm rounded-b-md`}
      >
        {/* Columna izquierda: horas */}
        <div className="border-r border-gray-200 bg-gray-50">
          {horas.map((h) => (
            <div
              key={h}
              className="h-[60px] border-b border-gray-100 text-[11px] text-gray-400 flex items-start justify-end pr-2 pt-1"
            >
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Columnas por día */}
        {days.map((day, colIdx) => (
          <div key={colIdx} className="relative border-r border-gray-100 bg-white">
            {/* Líneas de hora */}
            {horas.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-b border-gray-100"
                style={{ top: (h - startHour) * horaPx }}
              ></div>
            ))}

            {/* Turnos */}
            {turnos
              .filter((t) => sameDay(toLocal(t.start), day))
              .map((turno) => {
                const start = toLocal(turno.start);
                const end = toLocal(turno.end);
                const minutosDesdeInicio =
                  (start.getHours() - startHour) * 60 + start.getMinutes();
                const duracionMin = (end.getTime() - start.getTime()) / 60000;
                const top = minutosAPx(minutosDesdeInicio);
                const height = Math.max(minutosAPx(duracionMin), 35);

                return (
                  <button
                    key={turno._id}
                    onClick={() => onSelectTurno(turno)}
                    className={`absolute left-1 right-1 text-xs rounded-md border shadow-sm overflow-hidden transition-all hover:shadow-md focus:ring-2 focus:ring-emerald-300 ${TURNO_COLOR_MAP[turno.estado]}`}
                    style={{ top, height }}
                    title={`${turno.pacienteNombre} ${turno.pacienteApellido ?? ""} — ${start
                      .toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })} a ${end.toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}`}
                  >
                    <div className="px-2 py-1 text-left">
                      <div className="font-medium text-black truncate">{turno.pacienteNombre}</div>
                      <div className="text-[11px] text-gray-600">
                        {start.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}{" "}
                        -{" "}
                        {end.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight, CalendarDays, Grid3X3 } from "lucide-react";

type Props = {
  currentDate: Date;
  view: "month" | "week" | "day";
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (v: "month" | "week" | "day") => void;
};

export function CalendarioHeader({
  currentDate,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: Props) {
  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  return (
    <div className="bg-gradient-to-r from-sky-500 to-sky-700 p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarDays className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Calendario</h1>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <button onClick={onPrev} className="p-2 hover:bg-white/20 rounded-lg">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={onNext} className="p-2 hover:bg-white/20 rounded-lg">
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={onToday}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium"
          >
            Hoy
          </button>
          <h2 className="text-2xl font-bold">
            {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-4 py-2 rounded-lg font-medium ${view === v
                ? "bg-white text-blue-600"
                : "bg-white/20 hover:bg-white/30"
                }`}
            >
              {v === "month" ? "Mes" : v === "week" ? "Semana" : "Día"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

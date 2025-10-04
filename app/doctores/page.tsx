"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Grid3X3,
  X,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/* Tipo con joins */
type TurnoConJoin = {
  _id: Id<"turnos">;
  start: number;
  end: number;
  pacienteNombre: string;
  profesionalNombre: string;
  especialidadNombre?: string;
};

/* 🎨 Variables de colores */
const sidebarColor = "bg-blue-50"; 
const headerColor = "from-sky-500 to-sky-700"; 

export default function CalendarioProSalud() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [draggedEvent, setDraggedEvent] = useState<TurnoConJoin | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<TurnoConJoin | null>(null);

  const turnos = useQuery(api.turnos.listarConNombres, {}) as
    | TurnoConJoin[]
    | undefined;

  const meses = [
    "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
    "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE",
  ];
  const diasSemana = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  const getDaysInMonth = (date: Date) => {
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

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => setCurrentDate(new Date());

  const handleDragStart = (e: React.DragEvent, event: TurnoConJoin) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = (e: React.DragEvent, day: number, isCurrentMonth: boolean) => {
    e.preventDefault();
    if (!draggedEvent || !isCurrentMonth) return;
    console.log("Mover turno", draggedEvent._id, "a", day);
    setDraggedEvent(null);
  };

const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
  if (!turnos || !isCurrentMonth) return [];
  return turnos.filter((event) => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getFullYear() === currentDate.getFullYear() &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getDate() === day
    );
  });
};


  const days = getDaysInMonth(currentDate);
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${headerColor} p-6 text-white`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <CalendarDays className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Calendario</h1>
              </div>
              <button className="p-2 hover:bg-white/20 rounded-lg transition">
                <Grid3X3 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={previousMonth} className="p-2 hover:bg-white/20 rounded-lg">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg">
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium"
                >
                 Hoy
                </button>
                <h2 className="text-2xl font-bold">
                  {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {["month", "week", "day"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      view === v ? "bg-white text-blue-600" : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    {v === "month" ? "mes" : v === "week" ? "semana" : "día"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="flex">
            {/* Sidebar */}
            <div className={`w-80 border-r border-gray-200 p-6 ${sidebarColor}`}>
              <h3 className="font-bold text-Black mb-4">Turnos</h3>
              {!turnos ? (
                <p className="text-sm text-white/80">Cargando...</p>
              ) : (
                <div className="space-y-2">
                  {turnos.slice(0, 6).map((event) => (
                    <div
                      key={event._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onClick={() => setSelectedTurno(event)} // abrir modal
                      className="bg-white text-blue-600 p-2 rounded-lg cursor-pointer hover:opacity-90 transition text-sm font-medium"
                    >
                      {event.pacienteNombre} - {event.profesionalNombre}
                    </div>
                  ))}
                </div>
              )}
              
            </div>

            {/* Grilla de días */}
            <div className="flex-1 p-6 ">
              <div className="grid grid-cols-8 gap-1">
                
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {dia}
                  </div>
                ))}
              </div>
              {weeks.map((week, weekIndex) => {
                const firstDayOfWeek = week.find((d) => d.isCurrentMonth);
                const weekNum = firstDayOfWeek
                  ? getWeekNumber(new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfWeek.day))
                  : "";
                return (
                  <div key={weekIndex} className="grid grid-cols-8 gap-1">
                    {week.map((dayObj, dayIndex) => {
                      const events = getEventsForDay(dayObj.day, dayObj.isCurrentMonth);
                      return (
                        <div
                          key={dayIndex}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dayObj.day, dayObj.isCurrentMonth)}
                          className={`min-h-24 border border-gray-200 rounded-lg p-2 hover:bg-purple-50 transition ${
                            !dayObj.isCurrentMonth ? "bg-gray-50" : "bg-white"
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
                            {events.map((event) => (
                              <div
                                key={event._id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, event)}
                                onClick={() => setSelectedTurno(event)} // abrir modal
                                className="bg-purple-500 text-white px-2 py-1 rounded text-xs cursor-pointer hover:opacity-90 truncate"
                              >
                                {event.pacienteNombre}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Popup de Detalles */}
      {selectedTurno && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedTurno(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-purple-700 mb-4">Detalles del turno</h2>
            <p><span className="font-semibold">Paciente:</span> {selectedTurno.pacienteNombre}</p>
            <p><span className="font-semibold">Profesional:</span> {selectedTurno.profesionalNombre}</p>
            <p><span className="font-semibold">Especialidad:</span> {selectedTurno.especialidadNombre || "N/A"}</p>
            <p><span className="font-semibold">Fecha:</span> {new Date(selectedTurno.start).toLocaleDateString()}</p>
            <p><span className="font-semibold">Hora:</span> {new Date(selectedTurno.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { AppSidebar } from "@/components/sidebar";
import {
  Home,
  Calendar as CalendarIcon,
  Users,
  NotepadTextDashed,
  BriefcaseMedical,
  Calendar,
  PlusCircle,
} from "lucide-react";

import { CalendarioHeader } from "./_components/CalendarioHeader";
import { CalendarioSidebar } from "./_components/CalendarioSidebar";
import { CalendarioGrid } from "./_components/CalendarioGrid";
import { AgendaView } from "./_components/AgendaView";
import { TurnoModal } from "./_components/TurnoModal";
import TurnoDialog from "@/components/calendario/CreateTurnoDialog"; // Usa tu archivo actual

import {
  TurnoConJoin,
  getDaysInMonth,
  addDays,
  startOfWeekMonday,
} from "./_components/types";

export default function CalendarioRecepcionistaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedTurno, setSelectedTurno] = useState<TurnoConJoin | null>(null);
  const [selectedProfesional, setSelectedProfesional] = useState<string>("todos");

  // 🔹 Obtener turnos (de todos los profesionales)
  const turnos =
    (useQuery(api.turnos.listarConNombres, {}) as TurnoConJoin[] | undefined) ?? [];

  // 🔹 Obtener lista de profesionales (únicos)
  const profesionales = Array.from(
    new Map(turnos.map((t) => [t.profesionalId, t.profesionalNombre])).entries()
  ).map(([id, nombre]) => ({ id, nombre }));

  // 🔹 Filtrar por profesional seleccionado
  const turnosFiltrados =
    selectedProfesional === "todos"
      ? turnos
      : turnos.filter((t) => t.profesionalId === selectedProfesional);

  // ---- Fechas y vistas
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const weeks = useMemo(() => {
    const out: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return turnosFiltrados.filter((t) => {
      const d = new Date(t.start);
      return (
        d.getFullYear() === currentDate.getFullYear() &&
        d.getMonth() === currentDate.getMonth() &&
        d.getDate() === day
      );
    });
  };

  // ---- Navegación temporal
  const goPrev = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const goNext = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToday = () => setCurrentDate(new Date());

  const weekStart = startOfWeekMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const agendaDays = view === "day" ? [currentDate] : weekDays;

  // ---- Render
  return (
    <>
      <AppSidebar
        panelName="Panel Recepcionista"
        links={[
          { href: "/recepcionista", label: "Inicio", icon: Home },
          { href: "/recepcionista/cal-turnos", label: "Turnos", icon: Calendar },
          { href: "/recepcionista/pacientes", label: "Pacientes", icon: Users },
          { href: "/recepcionista/profesional", label: "Profesionales", icon: BriefcaseMedical },
          { href: "/recepcionista/historias", label: "Historias Clínicas", icon: NotepadTextDashed },
        ]}
      />

      <PageWrapper
        breadcrumbs={[
          { label: "Inicio", href: "/recepcionista" },
          { label: "Calendario", href: "/recepcionista/cal-turnos" },
        ]}
      >
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto">
            {/* ---- Encabezado del calendario */}
            <CalendarioHeader
              currentDate={currentDate}
              view={view}
              onPrev={goPrev}
              onNext={goNext}
              onToday={goToday}
              onViewChange={setView}
            />

            {/* ---- Barra de acciones */}
            <div className="flex justify-between items-center px-6 py-3 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-600">Profesional:</label>
                <select
                  value={selectedProfesional}
                  onChange={(e) => setSelectedProfesional(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="todos">Todos</option>
                  {profesionales.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* 🔹 Botón de creación de turno */}
              <TurnoDialog
                defaultDate={currentDate}
                trigger={
                  <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg shadow transition-all">
                    <PlusCircle className="w-4 h-4" />
                    Nuevo turno
                  </button>
                }
              />
            </div>

            {/* ---- Contenido principal */}
            <div className="flex">
              <CalendarioSidebar
                turnos={turnosFiltrados}
                onSelectTurno={setSelectedTurno}
              />

              {view === "month" ? (
                <CalendarioGrid
                  diasSemana={["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]}
                  weeks={weeks}
                  getEventsForDay={getEventsForDay}
                  onSelectTurno={setSelectedTurno}
                />
              ) : (
                <AgendaView
                  days={agendaDays}
                  turnos={turnosFiltrados}
                  onSelectTurno={setSelectedTurno}
                  slotMinutes={30}
                  startHour={8}
                  endHour={20}
                />
              )}
            </div>
          </div>
        </div>

        {/* ---- Modal de detalle */}
        {selectedTurno && (
          <TurnoModal turno={selectedTurno} onClose={() => setSelectedTurno(null)} />
        )}
      </PageWrapper>
    </>
  );
}

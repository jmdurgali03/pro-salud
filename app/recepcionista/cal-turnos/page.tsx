"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import {
  Calendar as CalendarIcon,
  PlusCircle,
} from "lucide-react";

import { CalendarioHeader } from "./_components/CalendarioHeader";
import { CalendarioSidebar } from "./_components/CalendarioSidebar";
import { CalendarioGrid } from "./_components/CalendarioGrid";
import { AgendaView } from "./_components/AgendaView";
import { TurnoModal } from "./_components/TurnoModal";
import TurnoDialog from "@/components/calendario/CreateTurnoDialog";
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

  // 🔹 Limitar la consulta al mes visible (mejor rendimiento)
  // 🔹 Calcular rango dinámico según la vista actual
  const getRangeForView = (view: string, base: Date) => {
    const start = new Date(base);
    const end = new Date(base);

    if (view === "month") {
      start.setDate(1);
      end.setMonth(base.getMonth() + 1, 0);
    } else if (view === "week") {
      const day = base.getDay();
      const diffToMonday = (day + 6) % 7;
      start.setDate(base.getDate() - diffToMonday);
      end.setDate(start.getDate() + 6);
    } else {
      // vista 'day'
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return {
      from: start.getTime(),
      to: end.getTime(),
    };
  };

  const { from, to } = getRangeForView(view, currentDate);

  // 🔹 Consultar turnos solo dentro del rango visible
  const turnos =
    (useQuery(api.turnos.listarRango, { from, to }) as TurnoConJoin[] | undefined) ??
    [];

  // 🔹 Profesionales únicos (nombre + apellido)
  const profesionales = Array.from(
    new Map(
      turnos.map((t) => [
        t.profesionalId,
        { nombre: t.profesionalNombre, apellido: t.profesionalApellido },
      ])
    ).entries()
  ).map(([id, datos]) => ({ id, ...datos }));


  // 🔹 Filtro por profesional
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

  // 🔹 Corrige comparación de días (sin desfase UTC)
  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth && view === "month") return [];
    return turnosFiltrados.filter((t) => {
      const fecha = new Date(t.start);
      return (
        fecha.getFullYear() === currentDate.getFullYear() &&
        fecha.getMonth() === currentDate.getMonth() &&
        fecha.getDate() === day
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

  // ---- Render principal
  return (
    <>
      <PageWrapper
        breadcrumbs={[
          { label: "Inicio", href: "/recepcionista" },
          { label: "Calendario", href: "/recepcionista/cal-turnos" },
        ]}
      >
        <div className="min-h-screen p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mx-auto w-[98%] max-w-[1920px]">

            {/* ---- Encabezado del calendario */}
            <CalendarioHeader
              currentDate={currentDate}
              view={view}
              onPrev={goPrev}
              onNext={goNext}
              onToday={goToday}
              onViewChange={setView}
            />

            {/* ---- Barra superior de acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-3 border-b bg-gray-50">
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
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* 🔹 Indicador de cantidad de turnos */}
              <div className="text-sm text-gray-500">
                {turnosFiltrados.length > 0
                  ? `${turnosFiltrados.length} turno${turnosFiltrados.length === 1 ? "" : "s"} en este período`
                  : "No hay turnos disponibles"}
              </div>

              {/* 🔹 Botón de nuevo turno */}
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

            {/* ---- Contenido principal (sidebar + calendario) */}
            <div className="grid grid-cols-[260px_1fr] gap-6 px-6 pb-8 relative">
              {/* Sidebar fijo con sombra sutil */}
              <aside className="sticky top-24 h-fit rounded-xl border border-gray-100 shadow-sm p-3 mt-10">
                <CalendarioSidebar
                  turnos={turnosFiltrados}
                  onSelectTurno={setSelectedTurno}
                />
              </aside>

              {/* Zona del calendario ampliada */}
              <section className="overflow-hidden rounded-xl bg-white">
                {view === "month" ? (
                  <CalendarioGrid
                    diasSemana={["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}

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
              </section>
              {/* Leyenda de colores (extendida y más grande) */}
              <div className="col-span-2 mt-4 px-6 py-4 bg-white rounded-xl border border-gray-100 shadow-sm w-full">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <span className="inline-block w-5 h-5 rounded bg-yellow-100 border border-yellow-400"></span>
                    <span className="text-gray-800">Pendiente</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <span className="inline-block w-5 h-5 rounded bg-red-100 border border-red-400"></span>
                    <span className="text-gray-800">Cancelado</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <span className="inline-block w-5 h-5 rounded bg-blue-100 border border-blue-400"></span>
                    <span className="text-gray-800">Finalizado</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <span className="inline-block w-5 h-5 rounded bg-green-100 border border-green-400"></span>
                    <span className="text-gray-800">Confirmado</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>


        {/* ---- Modal de detalle de turno */}
        {selectedTurno && (
          <TurnoModal turno={selectedTurno} onClose={() => setSelectedTurno(null)} />
        )}
      </PageWrapper>
    </>
  );
}

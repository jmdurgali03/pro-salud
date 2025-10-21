"use client";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PageWrapper } from "@/components/page-wrapper";
import { AppSidebar } from "@/components/sidebar";
import { Home, Calendar as CalendarIcon, Users, Calendar, NotepadTextDashed } from "lucide-react";

import { CalendarioHeader } from "./_components/CalendarioHeader";
import { CalendarioSidebar } from "./_components/CalendarioSidebar";
import { CalendarioGrid } from "./_components/CalendarioGrid";
import { AgendaView } from "./_components/AgendaView";
import { TurnoModal } from "./_components/TurnoModal";
import {
  TurnoConJoin,
  getDaysInMonth,
  addDays,
  startOfWeekMonday,
} from "./_components/types";

// 🔹 Formateador de fechas consistente (evita hydration mismatch)
const formatFechaArg = (timestamp: number) => {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  return formatter.format(date);
};

export default function CalendarioPage() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedTurno, setSelectedTurno] = useState<TurnoConJoin | null>(null);

  // 🔹 Buscar el profesional asociado al Clerk User
  const profesional = useQuery(api.profesionales.getByClerkUser, {
    clerkUserId: user?.id ?? "",
  });

  // 🔹 Traer turnos SOLO de ese profesional (ejecución segura)
  const turnos =
    useQuery(
      api.turnos.listarConNombres,
      profesional?._id ? { profesionalId: profesional._id } : "skip"
    ) ?? [];

  // ---- Calcular días y semanas para el calendario
  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);
  const weeks = useMemo(() => {
    const out: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  // ---- Filtro de eventos por día (vista mensual)
  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return turnos.filter((t) => {
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
    if (view === "month")
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    else if (view === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const goNext = () => {
    if (view === "month")
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    else if (view === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  // ---- Datos para vista semanal o diaria
  const weekStart = startOfWeekMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const agendaDays = view === "day" ? [currentDate] : weekDays;

  return (
    <>
      <PageWrapper
        
        breadcrumbs={[
          { label: "Inicio", href: "/profesional" },
          { label: "Calendario", href: "/profesional/cal-turnos" },
        ]}
      >
        <div className="w-full max-w-8xl mx-auto pt-2 pb-6 px-8">


          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mx-auto ">
            <CalendarioHeader
              currentDate={currentDate}
              view={view}
              onPrev={goPrev}
              onNext={goNext}
              onToday={goToday}
              onViewChange={setView}
            />

            <div className="flex">
              <CalendarioSidebar
                turnos={turnos}
                onSelectTurno={setSelectedTurno}
              />

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
                  turnos={turnos}
                  onSelectTurno={setSelectedTurno}
                  slotMinutes={30}
                  startHour={8}
                  endHour={20}
                />
              )}
            </div>
            {/* Leyenda de colores (horizontal y grande) */}
            <div className="mt-4 px-6 py-4 bg-white border-t border-gray-100">
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

        {selectedTurno && (
          <TurnoModal
            turno={selectedTurno}
            onClose={() => setSelectedTurno(null)}
            pacienteId={selectedTurno.pacienteId}
          />
        )}
      </PageWrapper>
    </>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import CompactCalendar from "@/components/calendario/CompactCalendar";
import TurnoDialog from "@/components/calendario/CreateTurnoDialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";

// 🔹 Definimos el tipo enriquecido que devuelve la query
type TurnoConJoin = {
  _id: Id<"turnos">;
  start: number;
  end: number;
  tipo: string;
  estado: "Confirmado" | "Pendiente" | "Cancelado";

  pacienteNombre: string;
  pacienteApellido: string;
  profesionalNombre: string;
  profesionalApellido: string; 
  profesionalEstado: "Activo" | "Inactivo";
  especialidadNombre: string;
  obrasSocialesPaciente: string[]; // ⚡ array de obras sociales
};

export default function TurnosPage() {
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 🔹 Query Convex ya devuelve nombres resueltos
  const turnos =
    (useQuery(api.turnos.listarRango, {
      from: new Date(2025, 0, 1).getTime(), // desde enero 2025
      to: new Date(2025, 11, 31).getTime(), // hasta diciembre 2025
    }) as TurnoConJoin[]) ?? [];

  // 🔹 Filtrar turnos según vista
  let turnosFiltrados: TurnoConJoin[] = [];
  if (selectedDate) {
    if (view === "day") {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      turnosFiltrados = turnos.filter((t) => {
        const d = new Date(t.start);
        return d >= start && d <= end;
      });
    } else if (view === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      turnosFiltrados = turnos.filter((t) => {
        const d = new Date(t.start);
        return d >= start && d <= end;
      });
    } else if (view === "month") {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      turnosFiltrados = turnos.filter((t) => {
        const d = new Date(t.start);
        return d >= start && d <= end;
      });
    }
  }

  return (
    <PageWrapper breadcrumbs={[
      { label: "Inicio", href: "/recepcionista" },
      { label: "Turnos", href: "/recepcionista/cal-turnos" },
    ]}
    >
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header con botón crear */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Calendario de Turnos</h1>
          <TurnoDialog defaultDate={selectedDate} />
        </div>
        <p className="text-gray-500">
          Visualiza y gestiona los turnos de pacientes por día, semana o mes.
        </p>

        {/* Tabs Día / Semana / Mes */}
        <div className="flex gap-6 border-b mb-6">
          {(["day", "week", "month"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`pb-2 capitalize ${view === tab
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab === "day" ? "Día" : tab === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>

        {/* Calendario compacto */}
        <CompactCalendar
          mode={view}
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
        />

        {/* Tabla de turnos */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">
            {view === "day" &&
              `Turnos para el ${selectedDate.toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}`}
            {view === "week" &&
              `Turnos de la semana del ${startOfWeek(selectedDate, {
                weekStartsOn: 1,
              }).toLocaleDateString("es-AR")} al ${endOfWeek(selectedDate, {
                weekStartsOn: 1,
              }).toLocaleDateString("es-AR")}`}
            {view === "month" &&
              `Turnos de ${selectedDate.toLocaleDateString("es-AR", {
                month: "long",
                year: "numeric",
              })}`}
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Profesional</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Obra Social</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turnosFiltrados.length > 0 ? (
                turnosFiltrados.map((t) => (
                  <TableRow key={t._id} className="text-sm">
                    <TableCell>
                      {new Date(t.start).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(t.start).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(t.end).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{t.pacienteNombre} {t.pacienteApellido}</TableCell>


                    <TableCell className="text-blue-600">
                      {t.profesionalNombre} {t.profesionalApellido}
                    </TableCell>
                    <TableCell>{t.especialidadNombre}</TableCell>

                    <TableCell>{t.obrasSocialesPaciente.join(", ") || "—"}</TableCell>

                    <TableCell>{t.tipo}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          t.estado === "Confirmado"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : t.estado === "Pendiente"
                              ? "bg-yellow-500 text-black hover:bg-yellow-600"
                              : "bg-red-500 text-white hover:bg-red-600"
                        }
                      >
                        {t.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TurnoDialog
                        turno={t}
                        trigger={
                          <Button variant="outline" disabled className=" cursor-not-allowed">
                            Editar
                          </Button>
                        }
                      />
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400">
                    No hay turnos para esta vista.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageWrapper>
  );
}

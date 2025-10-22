"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Stethoscope } from "lucide-react";

/* ==========================================================
   🔹 COMPONENTE PRINCIPAL
   ========================================================== */
export function TurnosPorEspecialidadesView({
  turnos,
  especialidades,
}: {
  turnos: any[];
  especialidades: any[];
}) {
  const [modoVista, setModoVista] = useState<"una" | "todas">("una");
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [modoTiempo, setModoTiempo] = useState<"dia" | "mes">("dia");

  // 🧩 Generador de datos según modo
  const generarDatos = (turnosFiltrados: any[]) => {
  if (modoTiempo === "dia") {
    const fechas: Record<string, number> = {};
    for (const t of turnosFiltrados) {
      const fecha = new Date(t.start);
      const clave = fecha.toISOString().split("T")[0]; // formato YYYY-MM-DD ordenable
      fechas[clave] = (fechas[clave] || 0) + 1;
    }

    // 🔹 Ordenar por fecha antes de devolver
    return Object.entries(fechas)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([fecha, cantidad]) => ({
        fecha: new Date(fecha).toLocaleDateString("es-AR"),
        cantidad,
      }));
  } else {
    const meses: Record<string, number> = {};
    for (const t of turnosFiltrados) {
      const f = new Date(t.start);
      const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
      meses[key] = (meses[key] || 0) + 1;
    }

    return Object.entries(meses)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([fecha, cantidad]) => {
        const [year, month] = fecha.split("-");
        return { fecha: `${month}/${year}`, cantidad };
      });
  }
};


  const especialidadesFiltradas = especialidades.filter((e) =>
    turnos.some((t) => t.especialidadNombre === e.nombre)
  );

  const renderGrafico = (nombre: string, datos: any[]) => (
    <div key={nombre} className="mb-8">
      <h3 className="text-lg font-medium text-gray-700 mb-2">{nombre}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="cantidad"
            stroke="#0EA5E9"
            strokeWidth={2.2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  /* ==========================================================
     🔹 VISTA
     ========================================================== */
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* 🔹 Encabezado con selectores */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-indigo-600" /> Turnos por
          Especialidad
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={modoVista}
            onChange={(e) => setModoVista(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="una">Una especialidad</option>
            <option value="todas">Todas las especialidades</option>
          </select>

          {modoVista === "una" && (
            <select
              value={especialidadSeleccionada}
              onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Seleccione una especialidad</option>
              {especialidadesFiltradas.map((esp) => (
                <option key={esp._id} value={esp.nombre}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          )}

          <select
            value={modoTiempo}
            onChange={(e) => setModoTiempo(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
          </select>
        </div>
      </div>

      {/* 🔹 Render dinámico */}
      {modoVista === "una" ? (
        especialidadSeleccionada ? (
          renderGrafico(
            especialidadSeleccionada,
            generarDatos(
              turnos.filter(
                (t) => t.especialidadNombre === especialidadSeleccionada
              )
            )
          )
        ) : (
          <p className="text-gray-500 text-sm text-center">
            Selecciona una especialidad para visualizar los turnos.
          </p>
        )
      ) : (
        especialidadesFiltradas.length > 0 ? (
          especialidadesFiltradas.map((esp) =>
            renderGrafico(
              esp.nombre,
              generarDatos(
                turnos.filter((t) => t.especialidadNombre === esp.nombre)
              )
            )
          )
        ) : (
          <p className="text-gray-500 text-sm text-center">
            No hay datos disponibles para las especialidades.
          </p>
        )
      )}
    </div>
  );
}

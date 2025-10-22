"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Stethoscope, Info } from "lucide-react";

type Turno = {
  start: string | number;
  especialidadNombre?: string;
};

export function TurnosPorEspecialidad({
  turnos,
  especialidades,
  especialidadSeleccionada,
  setEspecialidadSeleccionada,
  modoEspecialidad,
  setModoEspecialidad,
  fechaEspecialidad,
  setFechaEspecialidad,
}: {
  turnos: Turno[];
  especialidades: { _id: string; nombre: string }[];
  especialidadSeleccionada: string;
  setEspecialidadSeleccionada: (v: string) => void;
  modoEspecialidad: "dia" | "mes" | "año";
  setModoEspecialidad: (v: "dia" | "mes" | "año") => void;
  fechaEspecialidad: string;
  setFechaEspecialidad: (v: string) => void;
}) {
  const datos = useMemo(() => {
    const [año, mes] = fechaEspecialidad.split("-").map(Number);
    const resultado: { fecha: string; cantidad: number }[] = [];

    const agregar = (key: string, n = 0) => {
      const e = resultado.find((d) => d.fecha === key);
      if (e) e.cantidad += n;
      else resultado.push({ fecha: key, cantidad: n });
    };

    if (!especialidadSeleccionada) return [];

    const turnosFiltrados = turnos.filter(
      (t) => t.especialidadNombre === especialidadSeleccionada
    );

    if (modoEspecialidad === "dia") {
      const fin = new Date(año, mes, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${mes}/${año}`);
      for (const t of turnosFiltrados) {
        const f = new Date(t.start);
        if (f.getFullYear() === año && f.getMonth() + 1 === mes)
          agregar(`${f.getDate()}/${mes}/${año}`, 1);
      }
    }

    if (modoEspecialidad === "mes") {
      for (let m = 1; m <= 12; m++) agregar(`${m}/${año}`);
      for (const t of turnosFiltrados) {
        const f = new Date(t.start);
        if (f.getFullYear() === año) agregar(`${f.getMonth() + 1}/${año}`, 1);
      }
    }

    if (modoEspecialidad === "año") {
      const años = Array.from(
        { length: new Date().getFullYear() - 2018 + 1 },
        (_, i) => 2018 + i
      );
      for (const y of años) agregar(`${y}`);
      for (const t of turnosFiltrados)
        agregar(`${new Date(t.start).getFullYear()}`, 1);
    }

    return resultado;
  }, [turnos, especialidadSeleccionada, modoEspecialidad, fechaEspecialidad]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          Turnos por Especialidad
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={modoEspecialidad}
            onChange={(e) =>
              setModoEspecialidad(e.target.value as "dia" | "mes" | "año")
            }
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
            <option value="año">Por año</option>
          </select>
          {modoEspecialidad !== "año" && (
            <input
              type="month"
              value={fechaEspecialidad}
              onChange={(e) => setFechaEspecialidad(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
          )}
        </div>
      </div>

      {/* Filtro de especialidad */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Especialidad:</span>
        <select
          value={especialidadSeleccionada}
          onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">Seleccione una especialidad</option>
          {especialidades.map((e) => (
            <option key={e._id} value={e.nombre}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Contenido */}
      {especialidadSeleccionada ? (
        datos.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cantidad"
                stroke="#0EA5E9"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm text-center py-6">
            No hay turnos registrados para esta especialidad en el periodo
            seleccionado.
          </p>
        )
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500 py-6">
          <Info className="w-5 h-5 text-blue-500 mb-1" />
          <p className="text-sm">
            Selecciona una especialidad para visualizar los turnos.
          </p>
        </div>
      )}
    </div>
  );
}

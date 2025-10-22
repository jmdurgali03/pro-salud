"use client";

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

export function TurnosPorTodasLasEspecialidades({
  turnos,
  especialidades,
}: {
  turnos: any[];
  especialidades: any[];
}) {
  if (!turnos.length || !especialidades.length)
    return (
      <p className="text-center text-gray-500 text-sm">
        No hay datos suficientes para generar gráficos por especialidad.
      </p>
    );

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-8">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-indigo-600" /> Turnos por
        Especialidad
      </h2>

      {especialidades.map((esp) => {
        const datos = turnos
          .filter((t) => t.especialidadNombre === esp.nombre)
          .map((t) => ({
            fecha: new Date(t.start).toLocaleDateString("es-AR"),
            cantidad: 1,
          }));

        // Agrupar por fecha
        const resumen: Record<string, number> = {};
        for (const d of datos)
          resumen[d.fecha] = (resumen[d.fecha] || 0) + 1;

        const dataFinal = Object.entries(resumen).map(([fecha, cantidad]) => ({
          fecha,
          cantidad,
        }));

        return (
          <div key={esp._id}>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {esp.nombre}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataFinal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

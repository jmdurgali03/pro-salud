"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Activity } from "lucide-react";

// 🧮 Helpers para rangos de fechas
function rangoSemanaActual() {
  const hoy = new Date();
  const diaSemana = hoy.getDay() || 7;
  const desde = new Date(hoy);
  desde.setDate(hoy.getDate() - (diaSemana - 1));
  const hasta = new Date(desde);
  hasta.setDate(desde.getDate() + 7);
  return { from: desde, to: hasta };
}

function rangoMesActual() {
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
  return { from: desde, to: hasta };
}

export function EmbudoEstados({ turnos }: { turnos: any[] }) {
  const [periodoEmbudo, setPeriodoEmbudo] = useState<"semana" | "mes" | "trimestre">("semana");

  // 🔹 Calcula rango de fechas según período
  let from: Date, to: Date;
  if (periodoEmbudo === "semana") ({ from, to } = rangoSemanaActual());
  else if (periodoEmbudo === "mes") ({ from, to } = rangoMesActual());
  else {
    const hoy = new Date();
    from = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
    to = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
  }

  // 🔹 Filtra turnos en el rango seleccionado
  const enPeriodo = turnos.filter((t) => {
    const d = new Date(t.start);
    return d >= from && d < to;
  });

  const total = enPeriodo.length || 1;
  const c = (estado: string) => enPeriodo.filter((t) => t.estado === estado).length;

  const data = [
    { name: "Pendiente", value: c("Pendiente"), color: "#EAB308" },
    { name: "Confirmado", value: c("Confirmado"), color: "#22C55E" },
    { name: "Finalizado", value: c("Finalizado"), color: "#3B82F6" },
    { name: "Cancelado", value: c("Cancelado"), color: "#EF4444" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* 🔹 Encabezado con selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" /> Embudo de Estados
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={periodoEmbudo}
            onChange={(e) => setPeriodoEmbudo(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="semana">Semana actual</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Últimos 3 meses</option>
          </select>
        </div>
      </div>

      {/* 🔹 Gráfico de barras */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(v: any) => `${v} (${((v / total) * 100).toFixed(1)}%)`}
          />
          <Bar dataKey="value">
            {data.map((e, i) => (
              <Cell key={i} fill={e.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Las barras muestran la distribución de turnos por estado en el periodo seleccionado.
      </p>
    </div>
  );
}

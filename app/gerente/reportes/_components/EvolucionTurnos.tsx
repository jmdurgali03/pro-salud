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
  Legend,
} from "recharts";
import { CalendarDays } from "lucide-react";

/* ===========================================================
   🔹 Tipado de datos
=========================================================== */
type Turno = {
  start: string | number;
  estado: "Pendiente" | "Confirmado" | "Cancelado" | "Finalizado";
  profesionalId?: string;
};

type Profesional = {
  _id: string;
  nombre: string;
  apellido: string;
};

/* ===========================================================
   🔹 Funciones auxiliares
=========================================================== */
const rangoMesActual = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { from, to };
};

const rangoSemanaActual = () => {
  const now = new Date();
  const day = now.getDay(); // 0 domingo
  const diff = (day === 0 ? -6 : 1) - day;
  const from = new Date(now);
  from.setDate(now.getDate() + diff);
  const to = new Date(from);
  to.setDate(from.getDate() + 7);
  return { from, to };
};

/* ===========================================================
   🔹 Componente principal
=========================================================== */
export function EvolucionTurnos({
  turnos,
  profesionales,
}: {
  turnos: Turno[];
  profesionales: Profesional[];
}) {
  const [evolPeriodo, setEvolPeriodo] = useState<"semana" | "mes" | "trimestre">("mes");
  const [evolProfesional, setEvolProfesional] = useState<string>("");
  const [evolEstados, setEvolEstados] = useState<
    Record<"Confirmado" | "Cancelado" | "Finalizado" | "Pendiente", boolean>
  >({
    Confirmado: true,
    Cancelado: true,
    Finalizado: true,
    Pendiente: false,
  });

  const estadoBtn: Record<
    keyof typeof evolEstados,
    { on: string; off: string }
  > = {
    Confirmado: {
      on: "bg-green-100 border-green-300 text-green-700",
      off: "bg-white text-gray-600 hover:bg-gray-50",
    },
    Cancelado: {
      on: "bg-red-100 border-red-300 text-red-700",
      off: "bg-white text-gray-600 hover:bg-gray-50",
    },
    Finalizado: {
      on: "bg-blue-100 border-blue-300 text-blue-700",
      off: "bg-white text-gray-600 hover:bg-gray-50",
    },
    Pendiente: {
      on: "bg-amber-100 border-amber-300 text-amber-700",
      off: "bg-white text-gray-600 hover:bg-gray-50",
    },
  };

  const esEstado = (t: Turno, estado: string) => t.estado === estado;

  /* ===========================================================
     🔹 Cálculo de la evolución de turnos
  ============================================================ */
  const datos = useMemo(() => {
    const resultado: Record<
      string,
      { fecha: string; Confirmado: number; Cancelado: number; Finalizado: number; Pendiente: number }
    > = {};

    const agregar = (fecha: string, estado: keyof typeof evolEstados) => {
      if (!resultado[fecha]) {
        resultado[fecha] = {
          fecha,
          Confirmado: 0,
          Cancelado: 0,
          Finalizado: 0,
          Pendiente: 0,
        };
      }
      resultado[fecha][estado]++;
    };

    // --- Determinar rango temporal
    let from: Date, to: Date;
    if (evolPeriodo === "semana") ({ from, to } = rangoSemanaActual());
    else if (evolPeriodo === "mes") ({ from, to } = rangoMesActual());
    else {
      const hoy = new Date();
      from = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
      to = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    }

    // --- Inicializar fechas
    const cursor = new Date(from);
    while (cursor < to) {
      const key = cursor.toLocaleDateString("es-AR");
      resultado[key] = {
        fecha: key,
        Confirmado: 0,
        Cancelado: 0,
        Finalizado: 0,
        Pendiente: 0,
      };
      cursor.setDate(cursor.getDate() + 1);
    }

    // --- Filtrar por profesional (si aplica)
    const filtrados = evolProfesional
      ? turnos.filter((t) => String(t.profesionalId) === evolProfesional)
      : turnos;

    // --- Procesar turnos
    for (const t of filtrados) {
      const f = new Date(t.start);
      if (f >= from && f < to) {
        const key = f.toLocaleDateString("es-AR");
        if (resultado[key]) agregar(key, t.estado);
      }
    }

    return Object.values(resultado);
  }, [turnos, evolPeriodo, evolProfesional, evolEstados]);

  /* ===========================================================
     🔹 Render
  ============================================================ */
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* Encabezado */}
      <div className="flex justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-600" /> Evolución de Turnos
        </h2>

        <div className="flex items-center gap-2">
          <select
            value={evolPeriodo}
            onChange={(e) => setEvolPeriodo(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="semana">Semana actual</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Últimos 3 meses</option>
          </select>
        </div>
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(evolEstados).map((estado) => (
          <button
            key={estado}
            onClick={() =>
              setEvolEstados((prev) => ({
                ...prev,
                [estado]: !prev[estado as keyof typeof prev],
              }))
            }
            className={`border rounded-lg px-3 py-1.5 text-sm transition-all ${
              evolEstados[estado as keyof typeof evolEstados]
                ? estadoBtn[estado as keyof typeof evolEstados].on
                : estadoBtn[estado as keyof typeof evolEstados].off
            }`}
          >
            {estado}
          </button>
        ))}

        <select
          value={evolProfesional}
          onChange={(e) => setEvolProfesional(e.target.value)}
          className="ml-auto border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">Todos los profesionales</option>
          {profesionales.map((p) => (
            <option key={String(p._id)} value={String(p._id)}>
              {p.apellido} {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          {evolEstados.Confirmado && (
            <Line
              type="monotone"
              dataKey="Confirmado"
              stroke="#22C55E"
              strokeWidth={2}
              dot={false}
              name="Confirmado"
            />
          )}
          {evolEstados.Finalizado && (
            <Line
              type="monotone"
              dataKey="Finalizado"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              name="Finalizado"
            />
          )}
          {evolEstados.Cancelado && (
            <Line
              type="monotone"
              dataKey="Cancelado"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              name="Cancelado"
            />
          )}
          {evolEstados.Pendiente && (
            <Line
              type="monotone"
              dataKey="Pendiente"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Pendiente"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

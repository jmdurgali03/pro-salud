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
import { Users } from "lucide-react";

/* ===========================================================
   🔹 Tipado
=========================================================== */
type Paciente = {
  _creationTime: number;
};

/* ===========================================================
   🔹 Componente principal
=========================================================== */
export function PacientesNuevos({ pacientes }: { pacientes: Paciente[] }) {
  const [modo, setModo] = useState<"dia" | "mes" | "año">("mes");
  const [fecha, setFecha] = useState(
    new Date().toISOString().slice(0, 7) // formato "YYYY-MM"
  );

  // ===========================================================
  // 🔹 Calcular agrupación según modo seleccionado
  // ===========================================================
  const datos = useMemo(() => {
    const [año, mes] = fecha.split("-").map(Number);
    const datos: { fecha: string; nuevos: number }[] = [];

    const agregar = (key: string, n = 0) => {
      const e = datos.find((d) => d.fecha === key);
      if (e) e.nuevos += n;
      else datos.push({ fecha: key, nuevos: n });
    };

    if (modo === "dia") {
      // Agrupar por día del mes seleccionado
      const fin = new Date(año, mes, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${mes}/${año}`);
      for (const p of pacientes) {
        const f = new Date(p._creationTime);
        if (f.getFullYear() === año && f.getMonth() + 1 === mes)
          agregar(`${f.getDate()}/${mes}/${año}`, 1);
      }
    }

    if (modo === "mes") {
      // Agrupar por mes del año seleccionado
      for (let m = 1; m <= 12; m++) agregar(`${m}/${año}`);
      for (const p of pacientes) {
        const f = new Date(p._creationTime);
        if (f.getFullYear() === año) agregar(`${f.getMonth() + 1}/${año}`, 1);
      }
    }

    if (modo === "año") {
      // Agrupar por año desde 2018 hasta el actual
      const años = Array.from(
        { length: new Date().getFullYear() - 2018 + 1 },
        (_, i) => 2018 + i
      );
      for (const y of años) agregar(`${y}`);
      for (const p of pacientes) {
        const y = new Date(p._creationTime).getFullYear();
        agregar(`${y}`, 1);
      }
    }

    return datos;
  }, [pacientes, modo, fecha]);

  // ===========================================================
  // 🔹 Render del gráfico
  // ===========================================================
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Pacientes Nuevos
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
            <option value="año">Por año</option>
          </select>
          {modo !== "año" && (
            <input
              type="month"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            />
          )}
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
          />
          <Line
            type="monotone"
            dataKey="nuevos"
            name="Pacientes Nuevos"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

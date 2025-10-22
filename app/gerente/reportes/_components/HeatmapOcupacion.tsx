"use client";

import { useState, useMemo, Fragment } from "react";
import { CalendarDays } from "lucide-react";

/* ===========================================================
   🔹 Tipado
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
   🔹 Helpers de fecha
=========================================================== */
const rangoMesActual = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { from, to };
};

const rangoSemanaActual = () => {
  const now = new Date();
  const day = now.getDay();
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
export function HeatmapOcupacion({
  turnos,
  profesionales,
}: {
  turnos: Turno[];
  profesionales: Profesional[];
}) {
  const [heatPeriodo, setHeatPeriodo] = useState<"semana" | "mes" | "trimestre">("mes");
  const [heatProfesional, setHeatProfesional] = useState<string>("");
  const [heatTip, setHeatTip] = useState<any>(null);

  // ===========================================================
  // 🔹 Cálculo de matriz de ocupación
  // ===========================================================
  const { matriz, max } = useMemo(() => {
    const startHour = 8,
      endHour = 20;
    const grid = Array.from({ length: 7 }, () => Array(endHour - startHour).fill(0));

    // Rango temporal
    let from: Date, to: Date;
    if (heatPeriodo === "semana") ({ from, to } = rangoSemanaActual());
    else if (heatPeriodo === "mes") ({ from, to } = rangoMesActual());
    else {
      const hoy = new Date();
      from = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
      to = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    }

    // Filtrar turnos válidos
    const filtrados = turnos.filter((t) => {
      const d = new Date(t.start);
      if (d < from || d >= to) return false;
      if (heatProfesional && String(t.profesionalId) !== heatProfesional) return false;
      return ["Confirmado", "Finalizado"].includes(t.estado);
    });

    // Construir matriz
    filtrados.forEach((t) => {
      const d = new Date(t.start);
      const i = (d.getDay() + 6) % 7; // Lunes = 0
      const h = d.getHours();
      if (h >= startHour && h < endHour) grid[i][h - startHour]++;
    });

    return { matriz: grid, max: Math.max(1, ...grid.flat()) };
  }, [turnos, heatPeriodo, heatProfesional]);

  const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const startHour = 8,
    endHour = 20;

  // ===========================================================
  // 🔹 Render
  // ===========================================================
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-amber-600" /> Ocupación semanal (Heatmap)
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={heatPeriodo}
            onChange={(e) => setHeatPeriodo(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="semana">Semana actual</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Últimos 3 meses</option>
          </select>
        </div>
      </div>

      {/* Filtro profesional */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Profesional:</span>
        <select
          value={heatProfesional}
          onChange={(e) => setHeatProfesional(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          {profesionales.map((p) => (
            <option key={String(p._id)} value={String(p._id)}>
              {p.apellido} {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1">
          <div></div>
          {Array.from({ length: endHour - startHour }, (_, i) => (
            <div key={i} className="text-xs text-gray-500 text-center">
              {String(startHour + i).padStart(2, "0")}
            </div>
          ))}

          {matriz.map((row, r) => (
            <Fragment key={r}>
              <div className="text-xs text-gray-600 py-1 text-right pr-2">
                {dias[r]}
              </div>
              {row.map((v, c) => {
                const intensity = v / max;
                const bg = `rgba(34,197,94,${0.1 + intensity * 0.7})`;
                const hora = `${String(startHour + c).padStart(2, "0")}:00`;
                const label = `${dias[r]} ${hora}`;
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{ backgroundColor: bg }}
                    className="h-6 rounded cursor-pointer transition-all"
                    onMouseEnter={(e) =>
                      setHeatTip({
                        x: (e as any).clientX,
                        y: (e as any).clientY,
                        val: v,
                        label,
                      })
                    }
                    onMouseMove={(e) =>
                      setHeatTip({
                        x: (e as any).clientX,
                        y: (e as any).clientY,
                        val: v,
                        label,
                      })
                    }
                    onMouseLeave={() => setHeatTip(null)}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>

        {/* Tooltip flotante */}
        {heatTip && (
          <div
            style={{
              position: "fixed",
              left: heatTip.x + 12,
              top: heatTip.y + 12,
              zIndex: 50,
            }}
            className="px-2 py-1 rounded-md bg-black/80 text-white text-xs shadow-md"
          >
            <div className="font-medium">{heatTip.label}</div>
            <div>{heatTip.val} turno{heatTip.val === 1 ? "" : "s"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

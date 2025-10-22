"use client";

import { useState, useMemo } from "react";
import { BriefcaseMedical } from "lucide-react";

/* ============================
   🔹 Tipos de datos
=============================== */
type Profesional = {
  _id: string;
  nombre: string;
  apellido: string;
  especialidadId?: string;
};

type Especialidad = {
  _id: string;
  nombre: string;
};

type Turno = {
  profesionalId: string;
  start: string | number;
  estado: "Pendiente" | "Confirmado" | "Cancelado" | "Finalizado";
};

/* ============================
   🔹 Helpers de fecha
=============================== */
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

/* ============================
   🔹 Componente principal
=============================== */
export function RankingProfesionales({
  turnos,
  profesionales,
  especialidades,
}: {
  turnos: Turno[];
  profesionales: Profesional[];
  especialidades: Especialidad[];
}) {
  // --- Estados de filtro
  const [rankPeriodo, setRankPeriodo] = useState<"semana" | "mes" | "trimestre">("mes");
  const [rankEspecialidad, setRankEspecialidad] = useState("");
  const [rankOrden, setRankOrden] = useState<
    "tasa" | "finalizados" | "pendientes" | "cancelados" | "total"
  >("tasa");
  const [rankDir, setRankDir] = useState<"asc" | "desc">("desc");

  /* ============================
     🔹 Cálculo del ranking
  =============================== */
  const filas = useMemo(() => {
    // --- Determinar rango temporal
    let from: Date, to: Date;
    if (rankPeriodo === "semana") ({ from, to } = rangoSemanaActual());
    else if (rankPeriodo === "mes") ({ from, to } = rangoMesActual());
    else {
      const hoy = new Date();
      from = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
      to = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    }

    // --- Mapas de referencia
    const profMap = new Map<string, Profesional>();
    profesionales.forEach((p) => profMap.set(String(p._id), p));

    const espMap = new Map<string, string>();
    especialidades.forEach((e) => espMap.set(String(e._id), e.nombre));

    // --- Filtrar turnos por rango
    const enPeriodo = turnos.filter((t) => {
      const d = new Date(t.start);
      return d >= from && d < to;
    });

    // --- Contar turnos por profesional
    const porProf: Record<
      string,
      {
        nombre: string;
        especialidad?: string;
        finalizados: number;
        confirmados: number;
        pendientes: number;
        cancelados: number;
      }
    > = {};

    enPeriodo.forEach((t) => {
      const pid = String(t.profesionalId);
      const prof = profMap.get(pid);
      if (!prof) return;
      const espNombre = espMap.get(String(prof.especialidadId));
      if (rankEspecialidad && espNombre !== rankEspecialidad) return;

      const nombre =
        [prof.apellido, prof.nombre].filter(Boolean).join(", ") || "Profesional";

      porProf[pid] ||= {
        nombre,
        especialidad: espNombre,
        finalizados: 0,
        confirmados: 0,
        pendientes: 0,
        cancelados: 0,
      };

      if (t.estado === "Finalizado") porProf[pid].finalizados++;
      else if (t.estado === "Confirmado") porProf[pid].confirmados++;
      else if (t.estado === "Pendiente") porProf[pid].pendientes++;
      else if (t.estado === "Cancelado") porProf[pid].cancelados++;
    });

    // --- Calcular métricas
    let data = Object.values(porProf).map((p) => ({
      ...p,
      total:
        p.finalizados + p.confirmados + p.pendientes + p.cancelados,
      tasa:
        (p.finalizados /
          (p.finalizados + p.confirmados + p.pendientes + p.cancelados || 1)) *
        100,
    }));

    // --- Ordenar
    const dir = rankDir === "asc" ? 1 : -1;
    data = data
      .sort((a, b) => {
        if (rankOrden === "tasa") return dir * (a.tasa - b.tasa);
        if (rankOrden === "finalizados") return dir * (a.finalizados - b.finalizados);
        if (rankOrden === "pendientes") return dir * (a.pendientes - b.pendientes);
        if (rankOrden === "cancelados") return dir * (a.cancelados - b.cancelados);
        return dir * (a.total - b.total);
      })
      .slice(0, 12);

    return data;
  }, [turnos, profesionales, especialidades, rankPeriodo, rankEspecialidad, rankOrden, rankDir]);

  /* ============================
     🔹 Render
  =============================== */
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      {/* --- Encabezado con filtros --- */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BriefcaseMedical className="w-5 h-5 text-emerald-600" />
          Ranking de Profesionales
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={rankPeriodo}
            onChange={(e) => setRankPeriodo(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="semana">Semana actual</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Últimos 3 meses</option>
          </select>

          <select
            value={rankEspecialidad}
            onChange={(e) => setRankEspecialidad(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Todas las especialidades</option>
            {especialidades.map((e) => (
              <option key={String(e._id)} value={e.nombre}>
                {e.nombre}
              </option>
            ))}
          </select>

          <select
            value={rankOrden}
            onChange={(e) => setRankOrden(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="tasa">Tasa de finalización</option>
            <option value="finalizados">Finalizados</option>
            <option value="pendientes">Pendientes</option>
            <option value="cancelados">Cancelados</option>
            <option value="total">Total</option>
          </select>

          <select
            value={rankDir}
            onChange={(e) => setRankDir(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>

      {/* --- Tabla de resultados --- */}
      {filas.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-600 bg-gray-50">
              <tr>
                <th className="p-2 text-left">Profesional</th>
                <th className="p-2 text-left">Especialidad</th>
                <th className="p-2 text-center">Finalizados</th>
                <th className="p-2 text-center">Confirmados</th>
                <th className="p-2 text-center">Pendientes</th>
                <th className="p-2 text-center">Cancelados</th>
                <th className="p-2 text-center">Total</th>
                <th className="p-2 text-center">Tasa fin.</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">{f.nombre}</td>
                  <td className="p-2">{f.especialidad || "—"}</td>
                  <td className="p-2 text-center text-blue-700">{f.finalizados}</td>
                  <td className="p-2 text-center text-green-700">{f.confirmados}</td>
                  <td className="p-2 text-center text-amber-700">{f.pendientes}</td>
                  <td className="p-2 text-center text-red-700">{f.cancelados}</td>
                  <td className="p-2 text-center">{f.total}</td>
                  <td className="p-2 text-center font-semibold">
                    {f.tasa.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          Sin datos para los filtros seleccionados.
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import {
  Users,
  BriefcaseMedical,
  CalendarDays,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GerenteDashboardPage() {
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  });
  const [modoTurnos, setModoTurnos] = useState<"dia" | "mes" | "anio">("dia");
  const [modoPacientes, setModoPacientes] = useState<"dia" | "mes" | "anio">("dia");
  const [mostrarAtendidos, setMostrarAtendidos] = useState(true);
  const [mostrarCancelados, setMostrarCancelados] = useState(true);
  const [mostrarPacientes, setMostrarPacientes] = useState(true);

  // 📊 Consultas
  const pacientes = useQuery(api.pacientes.listar, { search: "" }) ?? [];
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];
  const turnos = useQuery(api.turnos.listar) ?? [];

  const esEstado = (t: any, ...estados: string[]) => estados.includes(t.estado as string);

  /* ----------------------------- 📈 Indicadores ------------------------------ */
  const indicadores = useMemo(() => {
    const [anio, mes] = mesSeleccionado.split("-").map(Number);
    const turnosMes = turnos.filter((t) => {
      const fecha = new Date(t.start);
      return fecha.getFullYear() === anio && fecha.getMonth() + 1 === mes;
    });

    const total = turnosMes.length;
    const confirmados = turnosMes.filter((t) => esEstado(t, "Confirmado", "Atendido")).length;
    const cancelados = turnosMes.filter((t) => esEstado(t, "Cancelado")).length;

    const porcentajeConfirmados = total ? ((confirmados / total) * 100).toFixed(1) : 0;
    const porcentajeCancelados = total ? ((cancelados / total) * 100).toFixed(1) : 0;

    const diasUnicos = new Set(turnosMes.map((t) => new Date(t.start).toDateString()));
    const promedioDia = diasUnicos.size ? Math.ceil(total / diasUnicos.size) : 0;

    return { porcentajeConfirmados, porcentajeCancelados, promedioDia };
  }, [turnos, mesSeleccionado]);

  /* ----------------------------- 📉 Turnos ------------------------------ */
  const turnosAgrupados = useMemo(() => {
    const [anioSel, mesSel] = mesSeleccionado.split("-").map(Number);
    const datos: { fecha: string; atendidos: number; cancelados: number }[] = [];
    const agregar = (key: string, a = 0, c = 0) => {
      const existente = datos.find((d) => d.fecha === key);
      if (existente) {
        existente.atendidos += a;
        existente.cancelados += c;
      } else {
        datos.push({ fecha: key, atendidos: a, cancelados: c });
      }
    };

    if (modoTurnos === "dia") {
      const fin = new Date(anioSel, mesSel, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${mesSel}/${anioSel}`);
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f.getFullYear() === anioSel && f.getMonth() + 1 === mesSel) {
          const key = `${f.getDate()}/${mesSel}/${anioSel}`;
          if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    }

    if (modoTurnos === "mes") {
      for (let m = 1; m <= 12; m++) agregar(`${m}/${anioSel}`);
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f.getFullYear() === anioSel) {
          const key = `${f.getMonth() + 1}/${anioSel}`;
          if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    }

    if (modoTurnos === "anio") {
      const anios = Array.from(new Set(turnos.map((t) => new Date(t.start).getFullYear())));
      const min = Math.min(...anios, anioSel - 1);
      const max = Math.max(...anios, anioSel);
      for (let y = min; y <= max; y++) agregar(`${y}`);
      for (const t of turnos) {
        const y = new Date(t.start).getFullYear();
        const key = `${y}`;
        if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
        if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
      }
    }

    return datos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [turnos, mesSeleccionado, modoTurnos]);

  /* ----------------------------- 👥 Pacientes ------------------------------ */
  const pacientesAgrupados = useMemo(() => {
    const [anioSel, mesSel] = mesSeleccionado.split("-").map(Number);
    const datos: { fecha: string; nuevos: number }[] = [];
    const agregar = (key: string, n = 0) => {
      const existente = datos.find((d) => d.fecha === key);
      if (existente) existente.nuevos += n;
      else datos.push({ fecha: key, nuevos: n });
    };

    if (modoPacientes === "dia") {
      const fin = new Date(anioSel, mesSel, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${mesSel}/${anioSel}`);
      for (const p of pacientes) {
        const f = new Date((p as any).fechaRegistro || (p as any)._creationTime);
        if (f.getFullYear() === anioSel && f.getMonth() + 1 === mesSel)
          agregar(`${f.getDate()}/${mesSel}/${anioSel}`, 1);
      }
    }

    if (modoPacientes === "mes") {
      for (let m = 1; m <= 12; m++) agregar(`${m}/${anioSel}`);
      for (const p of pacientes) {
        const f = new Date((p as any).fechaRegistro || (p as any)._creationTime);
        if (f.getFullYear() === anioSel) agregar(`${f.getMonth() + 1}/${anioSel}`, 1);
      }
    }

    if (modoPacientes === "anio") {
      const anios = Array.from(new Set(pacientes.map((p) => new Date((p as any)._creationTime).getFullYear())));
      const min = Math.min(...anios, anioSel - 1);
      const max = Math.max(...anios, anioSel);
      for (let y = min; y <= max; y++) agregar(`${y}`);
      for (const p of pacientes) {
        const y = new Date((p as any)._creationTime).getFullYear();
        agregar(`${y}`, 1);
      }
    }

    return datos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [pacientes, mesSeleccionado, modoPacientes]);

  /* ----------------------------- UI ------------------------------ */
  return (
    <PageWrapper breadcrumbs={[{ label: "Inicio", href: "/gerente" }, { label: "Reportes", href: "/gerente/reportes" }]}>
      <div className="w-full px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            Panel de Control del Gerente
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPI icon={<Users className="w-6 h-6 text-blue-500" />} title="Pacientes activos" value={pacientes.length} />
          <KPI icon={<BriefcaseMedical className="w-6 h-6 text-green-500" />} title="Profesionales activos" value={profesionales.length} />
          <KPI icon={<CalendarDays className="w-6 h-6 text-amber-500" />} title="Turnos registrados" value={turnos.length} />
          <KPI icon={<Activity className="w-6 h-6 text-rose-500" />} title="Obras Sociales" value={obrasSociales.length} />
        </div>

        {/* 📅 Turnos */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              Evolución de turnos ({modoTurnos})
            </h2>
            <div className="flex gap-3 items-center">
              <select value={modoTurnos} onChange={(e) => setModoTurnos(e.target.value as any)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="dia">Por día</option>
                <option value="mes">Por mes</option>
                <option value="anio">Por año</option>
              </select>
              <input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={turnosAgrupados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              {mostrarAtendidos && (
                <Line
                  type="monotone"
                  dataKey="atendidos"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  dot={false}
                  name="Atendidos"
                />
              )}
              {mostrarCancelados && (
                <Line
                  type="monotone"
                  dataKey="cancelados"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 6" // línea punteada
                  name="Cancelados"
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-6 mt-4 text-sm">
            <button onClick={() => setMostrarAtendidos(!mostrarAtendidos)} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm border" style={{ backgroundColor: mostrarAtendidos ? "#22C55E" : "transparent", borderColor: "#22C55E" }} />
              <span className={mostrarAtendidos ? "text-gray-800" : "text-gray-400"}>Atendidos</span>
            </button>
            <button onClick={() => setMostrarCancelados(!mostrarCancelados)} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm border" style={{ backgroundColor: mostrarCancelados ? "#EF4444" : "transparent", borderColor: "#EF4444" }} />
              <span className={mostrarCancelados ? "text-gray-800" : "text-gray-400"}>Cancelados</span>
            </button>
          </div>
        </div>

        {/* 👥 Pacientes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Nuevos pacientes ({modoPacientes})
            </h2>
            <div className="flex gap-3 items-center">
              <select value={modoPacientes} onChange={(e) => setModoPacientes(e.target.value as any)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="dia">Por día</option>
                <option value="mes">Por mes</option>
                <option value="anio">Por año</option>
              </select>
              <input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pacientesAgrupados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              {mostrarPacientes && (
                <Line
                  type="monotone"
                  dataKey="nuevos"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  name="Nuevos pacientes"
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-6 mt-4 text-sm">
            <button onClick={() => setMostrarPacientes(!mostrarPacientes)} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm border" style={{ backgroundColor: mostrarPacientes ? "#3B82F6" : "transparent", borderColor: "#3B82F6" }} />
              <span className={mostrarPacientes ? "text-gray-800" : "text-gray-400"}>Nuevos pacientes</span>
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ---------- KPI ---------- */
function KPI({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, Fragment } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import {
  Users,
  BriefcaseMedical,
  CalendarDays,
  Activity,
  TrendingUp,
  HeartPulse,
  Stethoscope,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* =============================================================== */
/* ====================== DASHBOARD GERENTE ====================== */
/* =============================================================== */

export default function GerenteDashboardPage() {
  const ahora = new Date();
  const defaultMes = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;

  // Filtros por gráfico
  const [modoTurnos, setModoTurnos] = useState<"dia" | "mes" | "año">("dia");
  const [fechaTurnos, setFechaTurnos] = useState(defaultMes);
  const [modoEspecialidad, setModoEspecialidad] = useState<"dia" | "mes" | "año">("dia");
  const [fechaEspecialidad, setFechaEspecialidad] = useState(defaultMes);
  const [modoPacientes, setModoPacientes] = useState<"dia" | "mes" | "año">("dia");
  const [fechaPacientes, setFechaPacientes] = useState(defaultMes);

  // Filtros específicos
  const [mostrarAtendidos, setMostrarAtendidos] = useState(true);
  const [mostrarCancelados, setMostrarCancelados] = useState(true);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>("");

  // Datos Convex
  const pacientes = useQuery(api.pacientes.listar, { search: "" }) ?? [];
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];
  const turnos = useQuery(api.turnos.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasPorUso = useQuery(api.obrasSociales.contarPacientesPorObraSocial) ?? [];

  const COLORS = ["#3B82F6", "#22C55E", "#EAB308", "#EC4899", "#A855F7", "#14B8A6"];
  const esEstado = (t: any, ...estados: string[]) => estados.includes(t.estado as string);

  // ===== Evolución de turnos: nuevos filtros =====
  const [evolPeriodo, setEvolPeriodo] = useState<"semana"|"mes"|"trimestre">("mes");
  const [evolEstados, setEvolEstados] = useState<Record<"Confirmado"|"Cancelado"|"Finalizado"|"Pendiente", boolean>>({
    Confirmado: true,
    Cancelado: true,
    Finalizado: true,
    Pendiente: false,
  });
  const [evolProfesional, setEvolProfesional] = useState<string>("");

  const estadoBtn: Record<string,{on:string;off:string}> = {
    Confirmado: { on: "bg-green-100 border-green-300 text-green-700", off: "bg-white text-gray-600 hover:bg-gray-50" },
    Cancelado: { on: "bg-red-100 border-red-300 text-red-700", off: "bg-white text-gray-600 hover:bg-gray-50" },
    Finalizado: { on: "bg-blue-100 border-blue-300 text-blue-700", off: "bg-white text-gray-600 hover:bg-gray-50" },
    Pendiente: { on: "bg-amber-100 border-amber-300 text-amber-700", off: "bg-white text-gray-600 hover:bg-gray-50" },
  };

  const evolSeries = useMemo(() => {
    // Determinar rango
    const hoy = new Date();
    let from: Date, to: Date, labels: string[] = [];
    const monday = (d: Date) => { const x=new Date(d); const w=(x.getDay()+6)%7; x.setDate(x.getDate()-w); x.setHours(0,0,0,0); return x; };
    if (evolPeriodo === "semana") {
      from = monday(hoy); to = new Date(from); to.setDate(to.getDate()+7);
      for (let i=0;i<7;i++){ const d=new Date(from); d.setDate(from.getDate()+i); labels.push(d.toLocaleDateString('es-AR')); }
    } else if (evolPeriodo === "mes") {
      from = new Date(hoy.getFullYear(), hoy.getMonth(), 1); to = new Date(hoy.getFullYear(), hoy.getMonth()+1,1);
      const days = new Date(hoy.getFullYear(), hoy.getMonth()+1,0).getDate();
      for (let i=1;i<=days;i++){ labels.push(`${i}/${hoy.getMonth()+1}/${hoy.getFullYear()}`); }
    } else {
      // Últimos 3 meses, bucket por semana
      to = new Date(hoy.getFullYear(), hoy.getMonth()+1,1); from = new Date(hoy.getFullYear(), hoy.getMonth()-2,1);
      // generar semanas
      let cursor = monday(from);
      while (cursor < to){ labels.push(`Sem ${Math.ceil(((+cursor - +new Date(cursor.getFullYear(),0,1))/86400000 + 1)/7)}`); cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()+7); }
    }

    const data = labels.map(l=>({ label:l, Confirmado:0, Cancelado:0, Finalizado:0, Pendiente:0 }));
    const inRange = (d: Date) => d >= from! && d < to!;
    const prof = evolProfesional;
    for (const t of turnos as any[]) {
      const d = new Date(t.start); if (!inRange(d)) continue;
      if (prof && String(t.profesionalId) !== prof) continue;
      let keyIdx = -1;
      if (evolPeriodo === 'trimestre'){
        // find week bucket index approximately by week start sequence
        const start = evolPeriodo==='trimestre' ? new Date(from!) : new Date(from!);
        const weekIdx = Math.floor((+monday(d) - +monday(start))/ (7*86400000));
        keyIdx = Math.max(0, Math.min(weekIdx, data.length-1));
      } else if (evolPeriodo==='semana'){
        const label = d.toLocaleDateString('es-AR'); keyIdx = data.findIndex(x=>x.label===label);
      } else {
        const label = `${d.getDate()}/${from!.getMonth()+1}/${from!.getFullYear()}`; keyIdx = data.findIndex(x=>x.label===label);
      }
      if (keyIdx>=0){ (data as any)[keyIdx][t.estado] = ((data as any)[keyIdx][t.estado]||0)+1; }
    }
    return data;
  }, [turnos, evolPeriodo, evolEstados, evolProfesional]);

  // Rangos utilitarios
  const rangoSemanaActual = () => {
    const hoy = new Date();
    const monday = new Date(hoy);
    const dow = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    const fin = new Date(monday);
    fin.setDate(fin.getDate() + 7);
    return { from: monday, to: fin };
  };
  const rangoMesActual = () => {
    const hoy = new Date();
    const from = new Date(hoy.getFullYear(), hoy.getMonth(), 1, 0, 0, 0, 0);
    const to = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1, 0, 0, 0, 0);
    return { from, to };
  };

  // Filtros de periodo (Semana/Mes) por sección
  const [periodoEvolucion, setPeriodoEvolucion] = useState<"semana" | "mes">("mes");
  const [periodoHeatmap, setPeriodoHeatmap] = useState<"semana" | "mes">("semana");
  // Heatmap filtros: periodo y profesional (solo Confirmado/Finalizado)
  const [heatPeriodo, setHeatPeriodo] = useState<"semana"|"mes"|"trimestre">("semana");
  const [heatProfesional, setHeatProfesional] = useState<string>("");
  const [heatTip, setHeatTip] = useState<{ x: number; y: number; val: number; label: string } | null>(null);
  // Ranking: nuevos filtros (3)
  const [rankPeriodo, setRankPeriodo] = useState<"semana"|"mes"|"trimestre">("mes");
  const [rankEspecialidad, setRankEspecialidad] = useState<string>("");
  const [rankOrden, setRankOrden] = useState<"tasa"|"finalizados"|"pendientes"|"cancelados"|"total">("tasa");
  const [rankDir, setRankDir] = useState<"desc"|"asc">("desc");
  const [periodoEmbudo, setPeriodoEmbudo] = useState<"semana" | "mes">("mes");

  /* =============================================================== */
  /* =================== INDICADORES GLOBALES ====================== */
  /* =============================================================== */

  const indicadoresGlobales = useMemo(() => {
    const total = turnos.length;
    const confirmados = turnos.filter((t) => esEstado(t, "Confirmado")).length;
    const cancelados = turnos.filter((t) => esEstado(t, "Cancelado")).length;
    const pendientes = turnos.filter((t) => esEstado(t, "Pendiente")).length;
    const finalizados = turnos.filter((t) => esEstado(t, "Finalizado")).length;

    const porcentajeConfirmados = total ? ((confirmados / total) * 100).toFixed(1) : 0;
    const porcentajeCancelados = total ? ((cancelados / total) * 100).toFixed(1) : 0;
    const porcentajePendientes = total ? ((pendientes / total) * 100).toFixed(1) : 0;
    const porcentajeFinalizados = total ? ((finalizados / total) * 100).toFixed(1) : 0;

    const diasUnicos = new Set(turnos.map((t) => new Date(t.start).toDateString()));
    const promedioDia = diasUnicos.size ? Math.ceil(total / diasUnicos.size) : 0;

    const conteoEspecialidades: Record<string, number> = {};
    for (const t of turnos) {
      const nombre = (t as any).especialidadNombre;
      if (!nombre) continue;
      conteoEspecialidades[nombre] = (conteoEspecialidades[nombre] || 0) + 1;
    }

    const topEspecialidades = Object.entries(conteoEspecialidades)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([nombre]) => nombre);

    return { porcentajeConfirmados, porcentajeCancelados, porcentajePendientes, porcentajeFinalizados, promedioDia, topEspecialidades };
  }, [turnos]);

  /* =============================================================== */
  /* ====================== EVOLUCIÓN DE TURNOS ==================== */
  /* =============================================================== */

  const turnosEvolucion = useMemo(() => {
    const datos: { fecha: string; atendidos: number; cancelados: number }[] = [];
    const agregar = (key: string, a = 0, c = 0) => {
      const e = datos.find((d) => d.fecha === key);
      if (e) {
        e.atendidos += a;
        e.cancelados += c;
      } else datos.push({ fecha: key, atendidos: a, cancelados: c });
    };

    if (periodoEvolucion === "mes") {
      const { from, to } = rangoMesActual();
      const fin = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${from.getMonth() + 1}/${from.getFullYear()}`);
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f >= from && f < to) {
          const key = `${f.getDate()}/${from.getMonth() + 1}/${from.getFullYear()}`;
          if (esEstado(t, "Confirmado")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    } else {
      const { from, to } = rangoSemanaActual();
      for (let i = 0; i < 7; i++) {
        const d = new Date(from); d.setDate(from.getDate() + i);
        agregar(`${d.toLocaleDateString("es-AR")}`);
      }
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f >= from && f < to) {
          const key = `${f.toLocaleDateString("es-AR")}`;
          if (esEstado(t, "Confirmado")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    }
    return datos;
  }, [turnos, periodoEvolucion]);

  /* =============================================================== */
  /* ====================== TURNOS POR ESPECIALIDAD ================= */
  /* =============================================================== */

  const turnosPorEspecialidad = useMemo(() => {
    const [año, mes] = fechaEspecialidad.split("-").map(Number);
    const datos: { fecha: string; cantidad: number }[] = [];
    const agregar = (key: string, n = 0) => {
      const e = datos.find((d) => d.fecha === key);
      if (e) e.cantidad += n;
      else datos.push({ fecha: key, cantidad: n });
    };

    if (!especialidadSeleccionada) return [];
    const turnosFiltrados = turnos.filter(
      (t) => (t as any).especialidadNombre === especialidadSeleccionada
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
      const años = Array.from({ length: new Date().getFullYear() - 2018 + 1 }, (_, i) => 2018 + i);
      for (const y of años) agregar(`${y}`);
      for (const t of turnosFiltrados)
        agregar(`${new Date(t.start).getFullYear()}`, 1);
    }

    return datos;
  }, [turnos, especialidadSeleccionada, modoEspecialidad, fechaEspecialidad]);

  /* =============================================================== */
  /* ========================= PACIENTES NUEVOS ==================== */
  /* =============================================================== */

  const pacientesAgrupados = useMemo(() => {
    const [año, mes] = fechaPacientes.split("-").map(Number);
    const datos: { fecha: string; nuevos: number }[] = [];
    const agregar = (key: string, n = 0) => {
      const e = datos.find((d) => d.fecha === key);
      if (e) e.nuevos += n;
      else datos.push({ fecha: key, nuevos: n });
    };

    if (modoPacientes === "dia") {
      const fin = new Date(año, mes, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${mes}/${año}`);
      for (const p of pacientes) {
        const f = new Date((p as any)._creationTime);
        if (f.getFullYear() === año && f.getMonth() + 1 === mes)
          agregar(`${f.getDate()}/${mes}/${año}`, 1);
      }
    }

    if (modoPacientes === "mes") {
      for (let m = 1; m <= 12; m++) agregar(`${m}/${año}`);
      for (const p of pacientes) {
        const f = new Date((p as any)._creationTime);
        if (f.getFullYear() === año) agregar(`${f.getMonth() + 1}/${año}`, 1);
      }
    }

    if (modoPacientes === "año") {
      const años = Array.from({ length: new Date().getFullYear() - 2018 + 1 }, (_, i) => 2018 + i);
      for (const y of años) agregar(`${y}`);
      for (const p of pacientes)
        agregar(`${new Date((p as any)._creationTime).getFullYear()}`, 1);
    }

    return datos;
  }, [pacientes, modoPacientes, fechaPacientes]);

  // ==== Utilidades y estado para Heatmap semanal ====
  const getCurrentISOWeek = () => {
    const d = new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  };
  const isoWeekToMonday = (iso: string) => {
    const [yStr, wStr] = iso.split('-W');
    const y = Number(yStr); const w = Number(wStr);
    const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
    const dow = (simple.getUTCDay() + 6) % 7; // lunes=0
    const monday = new Date(simple);
    monday.setUTCDate(simple.getUTCDate() - dow);
    monday.setUTCHours(0, 0, 0, 0);
    return monday;
  };
  const [semanaHeatmap, setSemanaHeatmap] = useState<string>(getCurrentISOWeek());

  /* =============================================================== */
  /* ============================= UI ============================== */
  /* =============================================================== */

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Reportes", href: "/gerente/reportes" },
      ]}
    >
      <div className="w-full px-10 py-10 space-y-8">
        {/* INDICADORES GLOBALES */}
<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
    <TrendingUp className="w-6 h-6 text-indigo-600" />
    Indicadores Generales del Centro
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 text-gray-700">
    <div className="flex flex-col items-start">
      <span className="text-lg font-semibold text-green-600">
        ✅ {indicadoresGlobales.porcentajeConfirmados}%
      </span>
      <span className="text-base text-gray-500">Confirmados</span>
    </div>

    <div className="flex flex-col items-start">
      <span className="text-lg font-semibold text-red-600">
        🚫 {indicadoresGlobales.porcentajeCancelados}%
      </span>
      <span className="text-base text-gray-500">Cancelados</span>
    </div>

    <div className="flex flex-col items-start">
      <span className="text-lg font-semibold text-amber-600">
        ⏳ {indicadoresGlobales.porcentajePendientes}%
      </span>
      <span className="text-base text-gray-500">Pendientes</span>
    </div>

    <div className="flex flex-col items-start">
      <span className="text-lg font-semibold text-blue-600">
        🔵 {indicadoresGlobales.porcentajeFinalizados}%
      </span>
      <span className="text-base text-gray-500">Finalizados</span>
    </div>
  </div>
</div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPI icon={<Users className="w-6 h-6 text-blue-500" />} title="Pacientes activos" value={pacientes.length} />
          <KPI icon={<BriefcaseMedical className="w-6 h-6 text-green-500" />} title="Profesionales activos" value={profesionales.length} />
          <KPI icon={<CalendarDays className="w-6 h-6 text-amber-500" />} title="Turnos registrados" value={turnos.length} />
          <KPI icon={<Activity className="w-6 h-6 text-rose-500" />} title="Obras Sociales" value={obrasSociales.length} />
        </div>

        {/* EVOLUCIÓN DE TURNOS (con nuevos filtros) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" /> Evolución de Turnos
            </h2>
            {/* Filtro 1: Periodo */}
            <div className="flex items-center gap-2">
              <select
                value={evolPeriodo}
                onChange={(e)=>setEvolPeriodo(e.target.value as any)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="semana">Semana actual</option>
                <option value="mes">Mes actual</option>
                <option value="trimestre">Últimos 3 meses</option>
              </select>
            </div>
          </div>

          {/* Filtro 2: Estados */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {(["Confirmado","Cancelado","Finalizado","Pendiente"] as const).map((e)=> (
              <button key={e}
                onClick={()=>setEvolEstados(s=>({...s,[e]:!s[e]}))}
                className={`px-3 py-1.5 rounded-full text-sm border ${evolEstados[e] ? estadoBtn[e].on : estadoBtn[e].off}`}
              >{e}</button>
            ))}
          </div>

          {/* Filtro 3: Profesional */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Profesional:</span>
            <select
              value={evolProfesional}
              onChange={(e)=>setEvolProfesional(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              {profesionales.map((p:any)=> (
                <option key={String(p._id)} value={String(p._id)}>
                  {p.apellido} {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={evolSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              {evolEstados.Confirmado && (
                <Line type="monotone" dataKey="Confirmado" stroke="#22C55E" strokeWidth={2.5} dot={false} />
              )}
              {evolEstados.Cancelado && (
                <Line type="monotone" dataKey="Cancelado" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="6 6" />
              )}
              {evolEstados.Finalizado && (
                <Line type="monotone" dataKey="Finalizado" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
              )}
              {evolEstados.Pendiente && (
                <Line type="monotone" dataKey="Pendiente" stroke="#EAB308" strokeWidth={2} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* HEATMAP DE OCUPACIÓN SEMANAL */
        /* Filtros: Periodo (semana/mes/trimestre), Estados, Profesional */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-600" /> Ocupación semanal (heatmap)
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={heatPeriodo}
                onChange={(e)=>setHeatPeriodo(e.target.value as any)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="semana">Semana actual</option>
                <option value="mes">Mes actual</option>
                <option value="trimestre">Últimos 3 meses</option>
              </select>
            </div>
          </div>
          {/* Estados: no se muestran; el heatmap usa solo Confirmado/Finalizado */}
          {/* Profesional */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Profesional:</span>
            <select
              value={heatProfesional}
              onChange={(e)=>setHeatProfesional(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              {profesionales.map((p:any)=> (
                <option key={`hp-${String(p._id)}`} value={String(p._id)}>
                  {p.apellido} {p.nombre}
                </option>
              ))}
            </select>
          </div>
          {(() => {
            // Construir heatmap para el periodo seleccionado
            const startHour = 8, endHour = 20;
            const matriz: number[][] = Array.from({ length: 7 }, () => Array(endHour - startHour).fill(0));
            // Rango según filtro
            let from: Date, to: Date;
            if (heatPeriodo === 'semana') { ({from, to} = rangoSemanaActual()); }
            else if (heatPeriodo === 'mes') { ({from, to} = rangoMesActual()); }
            else { // trimestre: últimos 3 meses completos
              const hoy = new Date();
              from = new Date(hoy.getFullYear(), hoy.getMonth()-2, 1);
              to = new Date(hoy.getFullYear(), hoy.getMonth()+1, 1);
            }
            const prof = heatProfesional;
            turnos.forEach((t: any) => {
              const d = new Date(t.start);
              if (d >= from && d < to) {
                if (prof && String(t.profesionalId) !== prof) return;
                // Solo considerar Confirmados o Finalizados en el heatmap (histórico / futuros confirmados)
                if (!(t.estado === 'Confirmado' || t.estado === 'Finalizado')) return;
                const i = (d.getDay() + 6) % 7;
                const h = d.getHours();
                if (h >= startHour && h < endHour) matriz[i][h - startHour] += 1;
              }
            });
            const max = Math.max(1, ...matriz.flat());
            const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
            return (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1">
                  <div></div>
                  {Array.from({ length: endHour - startHour }, (_, i) => (
                    <div key={i} className="text-xs text-gray-500 text-center">
                      {String(startHour + i).padStart(2, "0")}
                    </div>
                  ))}
                  {matriz.map((row, r) => (
                    <Fragment key={`row-${r}`}>
                      <div className="text-xs text-gray-600 py-1 text-right pr-2">{dias[r]}</div>
                      {row.map((v, c) => {
                        const intensity = v / max; // 0..1
                        const bg = `rgba(34,197,94,${0.1 + intensity * 0.7})`;
                        const hora = `${String(startHour + c).padStart(2, '0')}:00`;
                        const label = `${dias[r]} ${hora}`;
                        return (
                          <div
                            key={`c-${r}-${c}`}
                            style={{ backgroundColor: bg }}
                            className="h-6 rounded cursor-pointer"
                            onMouseEnter={(e)=> setHeatTip({ x: (e as any).clientX, y: (e as any).clientY, val: v, label })}
                            onMouseMove={(e)=> setHeatTip({ x: (e as any).clientX, y: (e as any).clientY, val: v, label })}
                            onMouseLeave={()=> setHeatTip(null)}
                            onClick={(e)=> setHeatTip({ x: (e as any).clientX, y: (e as any).clientY, val: v, label })}
                          />
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
                {heatTip && (
                  <div
                    style={{ position: 'fixed', left: heatTip.x + 10, top: heatTip.y + 10, zIndex: 50 }}
                    className="px-2 py-1 rounded-md bg-black/80 text-white text-xs shadow"
                  >
                    <div className="font-medium">{heatTip.label}</div>
                    <div>{heatTip.val} turno{heatTip.val === 1 ? '' : 's'}</div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* RANKING DE PROFESIONALES (filtros: periodo, especialidad, ordenar) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BriefcaseMedical className="w-5 h-5 text-emerald-600" /> Ranking de profesionales
            </h2>
            <div className="flex items-center gap-2">
              <select value={rankPeriodo} onChange={(e)=>setRankPeriodo(e.target.value as any)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="semana">Semana actual</option>
                <option value="mes">Mes actual</option>
                <option value="trimestre">Últimos 3 meses</option>
              </select>
              <select value={rankEspecialidad} onChange={(e)=>setRankEspecialidad(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="">Todas las especialidades</option>
                {especialidades.map((e)=> (<option key={String(e._id)} value={e.nombre}>{e.nombre}</option>))}
              </select>
              <select value={rankOrden} onChange={(e)=>setRankOrden(e.target.value as any)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="tasa">Tasa de finalización</option>
                <option value="finalizados">Finalizados</option>
                <option value="pendientes">Pendientes</option>
                <option value="cancelados">Cancelados</option>
                <option value="total">Total</option>
              </select>
              <select value={rankDir} onChange={(e)=>setRankDir(e.target.value as any)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
          {(() => {
            // Rango temporal
            let from: Date, to: Date;
            if (rankPeriodo==='semana'){ ({from,to} = rangoSemanaActual()); }
            else if (rankPeriodo==='mes'){ ({from,to} = rangoMesActual()); }
            else { const hoy=new Date(); from=new Date(hoy.getFullYear(), hoy.getMonth()-2, 1); to=new Date(hoy.getFullYear(), hoy.getMonth()+1,1); }

            // Mapas de referencia reales
            const profMap = new Map<string, any>();
            (profesionales as any[]).forEach(p=> profMap.set(String(p._id), p));
            const espMap = new Map<string, string>();
            (especialidades as any[]).forEach(e=> espMap.set(String(e._id), e.nombre));

            const enPeriodo = (turnos as any[]).filter(t=>{ const d=new Date(t.start); return d>=from && d<to; });
            const porProf: Record<string,{nombre:string; especialidad?:string; finalizados:number; confirmados:number; pendientes:number; cancelados:number}> = {};

            enPeriodo.forEach((t:any)=>{
              const pid = String(t.profesionalId);
              const prof = profMap.get(pid);
              if (!prof) return; // turno sin profesional consistente
              const espNombre = espMap.get(String(prof.especialidadId));
              if (rankEspecialidad && espNombre !== rankEspecialidad) return;
              const nombre = [prof.apellido, prof.nombre].filter(Boolean).join(", ") || "Profesional";
              porProf[pid] ||= {nombre, especialidad: espNombre, finalizados:0, confirmados:0, pendientes:0, cancelados:0};
              if (t.estado === 'Finalizado') porProf[pid].finalizados++;
              else if (t.estado === 'Confirmado') porProf[pid].confirmados++;
              else if (t.estado === 'Pendiente') porProf[pid].pendientes++;
              else if (t.estado === 'Cancelado') porProf[pid].cancelados++;
            });
            let filas = Object.values(porProf).map(p=>({
              ...p,
              total: p.finalizados+p.confirmados+p.pendientes+p.cancelados,
              tasa: (p.finalizados/(p.finalizados+p.confirmados+p.pendientes+p.cancelados || 1))*100,
            }));
            const dir = rankDir === 'asc' ? 1 : -1;
            filas = filas.sort((a,b)=>{
              if (rankOrden==='tasa') return dir * (a.tasa - b.tasa);
              if (rankOrden==='finalizados') return dir * (a.finalizados - b.finalizados);
              if (rankOrden==='pendientes') return dir * (a.pendientes - b.pendientes);
              if (rankOrden==='cancelados') return dir * (a.cancelados - b.cancelados);
              return dir * (a.total - b.total);
            }).slice(0,12);

            return filas.length? (
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
                    {filas.map((f,i)=> (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-2">{f.nombre}</td>
                        <td className="p-2">{f.especialidad || '—'}</td>
                        <td className="p-2 text-center text-blue-700">{f.finalizados}</td>
                        <td className="p-2 text-center text-green-700">{f.confirmados}</td>
                        <td className="p-2 text-center text-amber-700">{f.pendientes}</td>
                        <td className="p-2 text-center text-red-700">{f.cancelados}</td>
                        <td className="p-2 text-center">{f.total}</td>
                        <td className="p-2 text-center font-semibold">{f.tasa.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ): <p className="text-gray-500 text-sm">Sin datos para los filtros seleccionados.</p>;
          })()}
        </div>

        {/* EMBUDO DE ESTADOS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" /> Embudo de estados
            </h2>
            <div className="flex items-center gap-2">
              <select value={periodoEmbudo} onChange={(e)=>setPeriodoEmbudo(e.target.value as any)} className="border rounded-lg px-3 py-1.5 text-sm">
                <option value="semana">Semana actual</option>
                <option value="mes">Mes actual</option>
                <option value="trimestre">Últimos 3 meses</option>
              </select>
            </div>
          </div>
          {(() => {
            let from: Date, to: Date;
            if (periodoEmbudo === 'semana') { ({from, to} = rangoSemanaActual()); }
            else if (periodoEmbudo === 'mes') { ({from, to} = rangoMesActual()); }
            else { const hoy = new Date(); from = new Date(hoy.getFullYear(), hoy.getMonth()-2, 1); to = new Date(hoy.getFullYear(), hoy.getMonth()+1, 1); }
            const enPeriodo = turnos.filter((t:any)=>{ const d=new Date(t.start); return d>=from && d<to; });
            const total = enPeriodo.length || 1;
            const c = (estado:string)=> enPeriodo.filter(t=>t.estado===estado).length;
            const data = [
              {name:'Pendiente', value:c('Pendiente'), color:'#EAB308'},
              {name:'Confirmado', value:c('Confirmado'), color:'#22C55E'},
              {name:'Finalizado', value:c('Finalizado'), color:'#3B82F6'},
              {name:'Cancelado', value:c('Cancelado'), color:'#EF4444'},
            ];
            return (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(v:any)=>`${v} (${(v/total*100).toFixed(1)}%)`} />
                  <Bar dataKey="value">
                    {data.map((e,i)=>(<Cell key={i} fill={e.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
          <p className="text-xs text-gray-500 mt-2">Las barras muestran la distribución por estado en el periodo seleccionado.</p>
        </div>

        {/* (Eliminado) Mix por obra social con detalle */}

        {/* TURNOS POR ESPECIALIDAD */}
        <SeccionGrafico
          titulo="Turnos por Especialidad"
          icono={<Stethoscope className="w-5 h-5 text-blue-600" />}
          modo={modoEspecialidad}
          setModo={setModoEspecialidad}
          fecha={fechaEspecialidad}
          setFecha={setFechaEspecialidad}
          extraFiltro={
            <select
              value={especialidadSeleccionada}
              onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">Seleccionar especialidad</option>
              {especialidades.map((e) => (
                <option key={e._id} value={e.nombre}>
                  {e.nombre}
                </option>
              ))}
            </select>
          }
        >
          {especialidadSeleccionada ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={turnosPorEspecialidad}>
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
            <p className="text-gray-500 text-center text-sm">
              Selecciona una especialidad para visualizar los turnos.
            </p>
          )}
        </SeccionGrafico>

        {/* TORTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Torta
            titulo="Distribución por Obras Sociales"
            icon={<HeartPulse className="w-5 h-5 text-rose-600" />}
            data={obrasPorUso.map((o: any) => ({
              name: o.nombre || "Sin nombre",
              value: o.valor || o.cantidad || 0,
            }))}
            colors={COLORS}
            dataKey="value"
            nameKey="name"
          />
          <Torta
            titulo="Distribución por Género"
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            data={[
              { name: "Masculino", value: pacientes.filter((p: any) => p.genero === "Masculino").length },
              { name: "Femenino", value: pacientes.filter((p: any) => p.genero === "Femenino").length },
                            {
                name: "Otro",
                value: pacientes.filter(
                  (p: any) => !["Masculino", "Femenino"].includes(p.genero)
                ).length,
              },
            ]}
            colors={["#3B82F6", "#EC4899", "#FACC15"]}
            dataKey="value"
            nameKey="name"
          />
        </div>

        {/* NUEVOS PACIENTES */}
        <SeccionGrafico
          titulo="Nuevos Pacientes"
          icono={<Users className="w-5 h-5 text-blue-600" />}
          modo={modoPacientes}
          setModo={setModoPacientes}
          fecha={fechaPacientes}
          setFecha={setFechaPacientes}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pacientesAgrupados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="nuevos"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SeccionGrafico>
      </div>
    </PageWrapper>
  );
}

/* =============================================================== */
/* ================ COMPONENTE SECCIÓN GRÁFICO =================== */
/* =============================================================== */

function SeccionGrafico({
  titulo,
  icono,
  modo,
  setModo,
  fecha,
  setFecha,
  children,
  extraFiltro,
}: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          {icono} {titulo} ({modo})
        </h2>
        <div className="flex items-center gap-3">
          {extraFiltro}
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
            <option value="año">Por año</option>
          </select>
          <input
            type="month"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      {children}
    </div>
  );
}

/* =============================================================== */
/* ======================== COMPONENTE TORTA ====================== */
/* =============================================================== */

function Torta({ titulo, icon, data, colors, dataKey, nameKey }: any) {
  const total = data.reduce((acc: number, item: any) => acc + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {icon} {titulo}
      </h2>
      {data.length > 0 && total > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              labelLine={false}
              label={(entry: any) =>
                `${entry.name}: ${((entry.value / total) * 100).toFixed(1)}%`
              }
            >
              {data.map((_: any, i: number) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-semibold fill-gray-700"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-center text-sm">No hay datos disponibles.</p>
      )}
    </div>
  );
}

/* =============================================================== */
/* ======================== COMPONENTE KPI ======================= */
/* =============================================================== */

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

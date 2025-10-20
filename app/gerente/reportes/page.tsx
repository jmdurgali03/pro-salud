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

  /* =============================================================== */
  /* =================== INDICADORES GLOBALES ====================== */
  /* =============================================================== */

  const indicadoresGlobales = useMemo(() => {
    const total = turnos.length;
    const confirmados = turnos.filter((t) => esEstado(t, "Confirmado", "Atendido")).length;
    const cancelados = turnos.filter((t) => esEstado(t, "Cancelado")).length;

    const porcentajeConfirmados = total ? ((confirmados / total) * 100).toFixed(1) : 0;
    const porcentajeCancelados = total ? ((cancelados / total) * 100).toFixed(1) : 0;

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

    return { porcentajeConfirmados, porcentajeCancelados, promedioDia, topEspecialidades };
  }, [turnos]);

  /* =============================================================== */
  /* ====================== EVOLUCIÓN DE TURNOS ==================== */
  /* =============================================================== */

  const turnosAgrupados = useMemo(() => {
    const [año, mes] = fechaTurnos.split("-").map(Number);
    const datos: { fecha: string; atendidos: number; cancelados: number }[] = [];
    const agregar = (key: string, a = 0, c = 0) => {
      const e = datos.find((d) => d.fecha === key);
      if (e) {
        e.atendidos += a;
        e.cancelados += c;
      } else datos.push({ fecha: key, atendidos: a, cancelados: c });
    };

    if (modoTurnos === "dia") {
      const fin = new Date(año, mes, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${mes}/${año}`);
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f.getFullYear() === año && f.getMonth() + 1 === mes) {
          const key = `${f.getDate()}/${mes}/${año}`;
          if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    }

    if (modoTurnos === "mes") {
      for (let m = 1; m <= 12; m++) agregar(`${m}/${año}`);
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f.getFullYear() === año) {
          const key = `${f.getMonth() + 1}/${año}`;
          if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    }

    if (modoTurnos === "año") {
      const años = Array.from({ length: new Date().getFullYear() - 2018 + 1 }, (_, i) => 2018 + i);
      for (const y of años) agregar(`${y}`);
      for (const t of turnos) {
        const y = new Date(t.start).getFullYear();
        const key = `${y}`;
        if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
        if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
      }
    }
    return datos;
  }, [turnos, modoTurnos, fechaTurnos]);

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

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-gray-700">
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
      <span className="text-lg font-semibold text-indigo-600">
        📅 {indicadoresGlobales.promedioDia}
      </span>
      <span className="text-base text-gray-500">Promedio diario</span>
    </div>

    <div className="flex flex-col items-start">
      <span className="text-lg font-semibold text-blue-800">
        💬 {indicadoresGlobales.topEspecialidades.join(" y ") || "Sin datos"}
      </span>
      <span className="text-base text-gray-500">Destacadas</span>
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

        {/* EVOLUCIÓN DE TURNOS */}
        <SeccionGrafico
          titulo="Evolución de Turnos"
          icono={<CalendarDays className="w-5 h-5 text-indigo-600" />}
          modo={modoTurnos}
          setModo={setModoTurnos}
          fecha={fechaTurnos}
          setFecha={setFechaTurnos}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={turnosAgrupados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              {mostrarAtendidos && (
                <Line type="monotone" dataKey="atendidos" stroke="#22C55E" strokeWidth={2.5} dot={false} />
              )}
              {mostrarCancelados && (
                <Line type="monotone" dataKey="cancelados" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="6 6" />
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-4 mt-5">
            <button
              onClick={() => setMostrarAtendidos(!mostrarAtendidos)}
              className={`px-5 py-1.5 rounded-full text-white text-sm ${
                mostrarAtendidos ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 text-gray-700"
              }`}
            >
              🟢 Atendidos
            </button>
            <button
              onClick={() => setMostrarCancelados(!mostrarCancelados)}
              className={`px-5 py-1.5 rounded-full text-white text-sm ${
                mostrarCancelados ? "bg-red-600 hover:bg-red-700" : "bg-gray-300 text-gray-700"
              }`}
            >
              🔴 Cancelados
            </button>
          </div>
        </SeccionGrafico>

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


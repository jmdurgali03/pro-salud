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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function GerenteDashboardPage() {
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  });
  const [modoTurnos, setModoTurnos] = useState<"dia" | "mes" | "año">("dia");
  const [modoPacientes, setModoPacientes] = useState<"dia" | "mes" | "año">("dia");
  const [mostrarAtendidos, setMostrarAtendidos] = useState(true);
  const [mostrarCancelados, setMostrarCancelados] = useState(true);
  const [mostrarPacientes, setMostrarPacientes] = useState(true);

  // 📊 Datos Convex
  const pacientes = useQuery(api.pacientes.listar, { search: "" }) ?? [];
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];
  const turnos = useQuery(api.turnos.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasPorUso = useQuery(api.obrasSociales.contarPacientesPorObraSocial) ?? [];

  const COLORS = ["#3B82F6", "#22C55E", "#EAB308", "#EC4899", "#A855F7", "#14B8A6"];
  const esEstado = (t: any, ...estados: string[]) => estados.includes(t.estado as string);

  /* ---------------------- 📈 Indicadores ---------------------- */
  const indicadores = useMemo(() => {
    const [año, mes] = mesSeleccionado.split("-").map(Number);
    const turnosMes = turnos.filter((t) => {
      const fecha = new Date(t.start);
      return fecha.getFullYear() === año && fecha.getMonth() + 1 === mes;
    });

    const total = turnosMes.length;
    const confirmados = turnosMes.filter((t) => esEstado(t, "Confirmado", "Atendido")).length;
    const cancelados = turnosMes.filter((t) => esEstado(t, "Cancelado")).length;

    const porcentajeConfirmados = total ? ((confirmados / total) * 100).toFixed(1) : 0;
    const porcentajeCancelados = total ? ((cancelados / total) * 100).toFixed(1) : 0;

    const diasUnicos = new Set(turnosMes.map((t) => new Date(t.start).toDateString()));
    const promedioDia = diasUnicos.size ? Math.ceil(total / diasUnicos.size) : 0;

    const conteoEspecialidades: Record<string, number> = {};
    for (const t of turnosMes) {
      const nombre = (t as any).especialidadNombre;
      if (!nombre) continue;
      conteoEspecialidades[nombre] = (conteoEspecialidades[nombre] || 0) + 1;
    }
    const topEspecialidades = Object.entries(conteoEspecialidades)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([nombre]) => nombre);

    return {
      porcentajeConfirmados,
      porcentajeCancelados,
      promedioDia,
      topEspecialidades,
    };
  }, [turnos, mesSeleccionado]);

  /* ---------------------- 📊 Turnos por especialidad ---------------------- */
  const turnosPorEspecialidad = useMemo(() => {
    if (!especialidades.length) return [];
    const conteo = new Map<string, number>();
    for (const e of especialidades) conteo.set(e.nombre, 0);
    for (const t of turnos) {
      const nombre = (t as any).especialidadNombre;
      if (nombre && conteo.has(nombre))
        conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
    }
    return Array.from(conteo.entries()).map(([nombre, turnos]) => ({ nombre, turnos }));
  }, [turnos, especialidades]);

  /* ---------------------- 👩‍⚕️ Pacientes por género ---------------------- */
  const pacientesPorGenero = useMemo(() => {
    const totalMasculino = pacientes.filter((p: any) => p.genero === "Masculino").length;
    const totalFemenino = pacientes.filter((p: any) => p.genero === "Femenino").length;
    const totalOtro = pacientes.filter((p: any) => !["Masculino", "Femenino"].includes(p.genero)).length;

    return [
      { name: "Masculino", value: totalMasculino },
      { name: "Femenino", value: totalFemenino },
      { name: "Otro", value: totalOtro },
    ];
  }, [pacientes]);

  const totalPacientes = pacientesPorGenero.reduce((acc, item) => acc + item.value, 0);

  /* ---------------------- 📈 Turnos por fecha (ahora muestra todos los años) ---------------------- */
  const turnosAgrupados = useMemo(() => {
    const [añoSel, mesSel] = mesSeleccionado.split("-").map(Number);
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
      const fin = new Date(añoSel, mesSel, 0).getDate();
      for (let d = 1; d <= fin; d++) agregar(`${d}/${mesSel}/${añoSel}`);
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f.getFullYear() === añoSel && f.getMonth() + 1 === mesSel) {
          const key = `${f.getDate()}/${mesSel}/${añoSel}`;
          if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    }

    if (modoTurnos === "mes") {
      for (let m = 1; m <= 12; m++) agregar(`${m}/${añoSel}`);
      for (const t of turnos) {
        const f = new Date(t.start);
        if (f.getFullYear() === añoSel) {
          const key = `${f.getMonth() + 1}/${añoSel}`;
          if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
          if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
        }
      }
    }

    if (modoTurnos === "año") {
      const todosaños = Array.from({ length: new Date().getFullYear() - 2018 + 1 }, (_, i) => 2018 + i);
      for (const y of todosaños) agregar(`${y}`);
      for (const t of turnos) {
        const y = new Date(t.start).getFullYear();
        const key = `${y}`;
        if (esEstado(t, "Confirmado", "Atendido")) agregar(key, 1, 0);
        if (esEstado(t, "Cancelado")) agregar(key, 0, 1);
      }
    }

    return datos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [turnos, mesSeleccionado, modoTurnos]);

  /* ---------------------- 👥 Pacientes nuevos (años completos) ---------------------- */
  const pacientesAgrupados = useMemo(() => {
  const [añoSel, mesSel] = mesSeleccionado.split("-").map(Number);

  // Elegí el año base que quieras (si tu sistema empezó después de 2018, cambialo)
  const BASE_YEAR = 2018;
  const CURRENT_YEAR = new Date().getFullYear();

  // Para armar los puntos
  const datos: Array<{ fecha: number | string; nuevos: number }> = [];
  const agregar = (key: number | string, n = 0) => {
    const idx = datos.findIndex((d) => d.fecha === key);
    if (idx >= 0) datos[idx].nuevos += n;
    else datos.push({ fecha: key, nuevos: n });
  };

  if (modoPacientes === "dia") {
    const fin = new Date(añoSel, mesSel, 0).getDate();
    for (let d = 1; d <= fin; d++) agregar(`${d}/${mesSel}/${añoSel}`, 0);
    for (const p of pacientes) {
      const f = new Date((p as any)._creationTime);
      if (f.getFullYear() === añoSel && f.getMonth() + 1 === mesSel) {
        agregar(`${f.getDate()}/${mesSel}/${añoSel}`, 1);
      }
    }
    return datos.sort(
      (a, b) =>
        new Date(String(a.fecha)).getTime() - new Date(String(b.fecha)).getTime()
    );
  }

  if (modoPacientes === "mes") {
    for (let m = 1; m <= 12; m++) agregar(`${m}/${añoSel}`, 0);
    for (const p of pacientes) {
      const f = new Date((p as any)._creationTime);
      if (f.getFullYear() === añoSel) agregar(`${f.getMonth() + 1}/${añoSel}`, 1);
    }
    return datos.sort(
      (a, b) =>
        new Date(String(a.fecha)).getTime() - new Date(String(b.fecha)).getTime()
    );
  }

  // === modoPacientes === "año" ===
  // Usamos eje X numérico (años) para evitar parseos raros de fechas string
  for (let y = BASE_YEAR; y <= CURRENT_YEAR; y++) agregar(y, 0);
  for (const p of pacientes) {
    const y = new Date((p as any)._creationTime).getFullYear();
    if (y >= BASE_YEAR && y <= CURRENT_YEAR) agregar(y, 1);
  }
  // Orden numérico simple
  return datos.sort(
    (a, b) => (a.fecha as number) - (b.fecha as number)
  );
}, [pacientes, mesSeleccionado, modoPacientes]);
  /* ---------------------- UI ---------------------- */
  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Reportes", href: "/gerente/reportes" },
      ]}
    >
      <div className="w-full px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
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

        {/* 📊 Turnos por Especialidad */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" /> Turnos por Especialidad
          </h2>
          {turnosPorEspecialidad.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={turnosPorEspecialidad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="nombre" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="turnos" radius={[6, 6, 0, 0]}>
                  {turnosPorEspecialidad.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center text-sm">No hay datos disponibles.</p>
          )}
        </div>

        {/* 📊 Distribuciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Obras Sociales */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" /> Distribución por Obras Sociales
            </h2>
            {obrasPorUso.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={obrasPorUso}
                    dataKey="valor"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    label={(entry: any) =>
                      `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`
                    }
                    labelLine={false}
                  >
                    {obrasPorUso.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center text-sm">No hay datos disponibles.</p>
            )}
          </div>

          {/* Género */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Distribución por Género
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pacientesPorGenero}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  label={(entry: any) =>
                    `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`
                  }
                  labelLine={false}
                >
                  {pacientesPorGenero.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
                  {totalPacientes}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📈 Evolución de Turnos */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" /> Evolución de turnos ({modoTurnos})
            </h2>
            <div className="flex gap-3 items-center">
              <select
                value={modoTurnos}
                onChange={(e) => setModoTurnos(e.target.value as any)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="dia">Por día</option>
                <option value="mes">Por mes</option>
                <option value="año">Por año</option>
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
                  strokeDasharray="6 6"
                  name="Cancelados"
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-6 mt-4 text-sm">
            <button
              onClick={() => setMostrarAtendidos(!mostrarAtendidos)}
              className="flex items-center gap-2"
            >
              <span
                className="w-4 h-4 rounded-sm border"
                style={{
                  backgroundColor: mostrarAtendidos ? "#22C55E" : "transparent",
                  borderColor: "#22C55E",
                }}
              />
              <span className={mostrarAtendidos ? "text-gray-800" : "text-gray-400"}>
                Atendidos
              </span>
            </button>

            <button
              onClick={() => setMostrarCancelados(!mostrarCancelados)}
              className="flex items-center gap-2"
            >
              <span
                className="w-4 h-4 rounded-sm border"
                style={{
                  backgroundColor: mostrarCancelados ? "#EF4444" : "transparent",
                  borderColor: "#EF4444",
                }}
              />
              <span className={mostrarCancelados ? "text-gray-800" : "text-gray-400"}>
                Cancelados
              </span>
            </button>
          </div>
        </div>

        {/* 📊 Indicadores */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <ul className="space-y-3 text-sm text-gray-700">
            <li>✅ <b>{indicadores.porcentajeConfirmados}%</b> confirmados</li>
            <li>🚫 <b>{indicadores.porcentajeCancelados}%</b> cancelados</li>
            <li>📅 Promedio diario: <b>{indicadores.promedioDia}</b></li>
            <li>💬 Destacadas: <b>{indicadores.topEspecialidades.join(" y ") || "Sin datos"}</b></li>
          </ul>
        </div>

        {/* 👥 Nuevos pacientes */}
<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <div className="flex justify-between mb-4">
    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
      <Users className="w-5 h-5 text-blue-600" />
      Nuevos pacientes ({modoPacientes})
    </h2>
    <div className="flex gap-3 items-center">
      <select
        value={modoPacientes}
        onChange={(e) => setModoPacientes(e.target.value as any)}
        className="border rounded-lg px-3 py-1.5 text-sm"
      >
        <option value="dia">Por día</option>
        <option value="mes">Por mes</option>
        <option value="año">Por año</option>
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
    <XAxis
      dataKey="fecha"
      // tipo numérico si es por año; categórico para día/mes
      type={modoPacientes === "año" ? "number" : "category"}
      domain={modoPacientes === "año" ? ["dataMin", "dataMax"] : undefined}
      allowDecimals={false}
      tick={{ fontSize: 11 }}
      tickFormatter={(v) =>
        modoPacientes === "año" ? String(v) : (v as string)
      }
    />
    <YAxis allowDecimals={false} />
    <Tooltip />
    <Line
      type="monotone"
      dataKey="nuevos"
      stroke="#3B82F6"
      strokeWidth={2.5}
      dot={{ r: 3 }}
      name="Nuevos pacientes"
      isAnimationActive
    />
  </LineChart>
</ResponsiveContainer>



  {/* Indicador fijo debajo del gráfico */}
  <div className="flex justify-center mt-4 text-sm text-gray-700 items-center gap-2">
    <span
      className="w-4 h-4 rounded-sm border"
      style={{
        backgroundColor: "#3B82F6",
        borderColor: "#3B82F6",
      }}
    />
    <span className="font-medium">Nuevos pacientes</span>
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

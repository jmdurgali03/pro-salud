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
} from "recharts";

export default function GerenteDashboardPage() {
  // 📆 Mes solo para indicadores de actividad
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  });

  // 📊 Consultas reales
  const pacientes = useQuery(api.pacientes.listar, { search: "" }) ?? [];
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];
  const turnos = useQuery(api.turnos.listar) ?? [];

  // 🔹 Canon de especialidades para que la barra muestre SOLO las que existen
  const especialidades = useQuery(api.especialidades.listar) ?? [];

  // 🔹 Nueva query: pacientes únicos por obra social (para torta)
  const obrasPorUso = useQuery(api.obrasSociales.contarPacientesPorObraSocial) ?? [];

  const COLORS = ["#3B82F6", "#22C55E", "#EAB308", "#EC4899", "#14B8A6", "#8B5CF6"];

  /* -----------------------------
     📈 Indicadores filtrados por mes
  ------------------------------ */
  const indicadores = useMemo(() => {
    const [anio, mes] = mesSeleccionado.split("-").map(Number);

    const turnosMes = turnos.filter((t) => {
      const fecha = new Date(t.start);
      return fecha.getFullYear() === anio && fecha.getMonth() + 1 === mes;
    });

    const total = turnosMes.length;
    const confirmados = turnosMes.filter((t) => t.estado === "Confirmado").length;
    const cancelados = turnosMes.filter((t) => t.estado === "Cancelado").length;

    const porcentajeConfirmados = total ? ((confirmados / total) * 100).toFixed(1) : 0;
    const porcentajeCancelados = total ? ((cancelados / total) * 100).toFixed(1) : 0;

    // Promedio de turnos por día (redondeado hacia arriba)
    const diasUnicos = new Set(turnosMes.map((t) => new Date(t.start).toDateString()));
    const promedioDia = diasUnicos.size ? Math.ceil(total / diasUnicos.size) : 0;

    // Top especialidades del mes (usa el nombre de la especialidad real)
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
      total,
      confirmados,
      cancelados,
      porcentajeConfirmados,
      porcentajeCancelados,
      promedioDia,
      topEspecialidades,
    };
  }, [turnos, mesSeleccionado]);

  /* -----------------------------
     📊 Turnos por especialidad (DINÁMICO y CANÓNICO)
     - Usa especialidadNombre del turno
     - Muestra SOLO las especialidades existentes en el sistema
  ------------------------------ */
  const turnosPorEspecialidad = useMemo(() => {
    if (!especialidades.length) {
      // Fallback: si aún no cargó la lista, contamos por lo que venga en los turnos
      const conteo: Record<string, number> = {};
      for (const t of turnos) {
        const nombre = (t as any).especialidadNombre;
        if (!nombre) continue;
        conteo[nombre] = (conteo[nombre] || 0) + 1;
      }
      return Object.entries(conteo).map(([nombre, turnos]) => ({ nombre, turnos }));
    }

    // Inicializo con 0 para que salgan todas (Cardiología, Traumatología, Urología, Ginecología, Dermatología, etc.)
    const conteo = new Map<string, number>();
    for (const e of especialidades) conteo.set(e.nombre, 0);

    // Sumo por la especialidad REAL del turno
    for (const t of turnos) {
      const nombre = (t as any).especialidadNombre;
      if (nombre && conteo.has(nombre)) {
        conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
      }
    }

    return Array.from(conteo.entries()).map(([nombre, turnos]) => ({ nombre, turnos }));
  }, [turnos, especialidades]);

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

        {/* KPIs Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPI icon={<Users className="w-6 h-6 text-blue-500" />} title="Pacientes activos" value={pacientes.length} />
          <KPI icon={<BriefcaseMedical className="w-6 h-6 text-green-500" />} title="Profesionales activos" value={profesionales.length} />
          <KPI icon={<CalendarDays className="w-6 h-6 text-amber-500" />} title="Turnos registrados" value={turnos.length} />
          <KPI icon={<Activity className="w-6 h-6 text-rose-500" />} title="Obras Sociales" value={obrasSociales.length} />
        </div>

        {/* Gráficos Generales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Turnos por especialidad (usa solo las reales) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Turnos por Especialidad
            </h2>
            {turnosPorEspecialidad.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={turnosPorEspecialidad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis
                    dataKey="nombre"
                    tick={turnosPorEspecialidad.length <= 5}
                    interval={0}
                    angle={turnosPorEspecialidad.length > 5 ? 0 : -15}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [`Turnos: ${value}`, "Cantidad"]}
                    labelFormatter={(label: string) => `Especialidad: ${label}`}
                  />
                  <Bar dataKey="turnos" radius={[4, 4, 0, 0]}>
                    {turnosPorEspecialidad.map((_, index) => {
                      const colors = [
                        "#3B82F6", "#22C55E", "#EAB308", "#EC4899",
                        "#14B8A6", "#8B5CF6", "#F97316", "#06B6D4",
                      ];
                      return <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center text-sm">No hay datos disponibles.</p>
            )}
          </div>

          {/* Distribución por obra social (PACIENTES ÚNICOS) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
                    outerRadius={100}
                    label
                  >
                    {obrasPorUso.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center text-sm">No hay datos disponibles.</p>
            )}
          </div>
        </div>

        {/* Indicadores de Actividad con filtro mensual */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" /> Indicadores de Actividad
            </h2>
            <input
              type="month"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-semibold">✅</span>
              <span><b>{indicadores.porcentajeConfirmados}%</b> de turnos confirmados en {mesSeleccionado}.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-semibold">🚫</span>
              <span><b>{indicadores.porcentajeCancelados}%</b> de turnos cancelados en {mesSeleccionado}.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-semibold">📅</span>
              <span>Cantidad promedio de turnos por día: <b>{indicadores.promedioDia}</b>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-semibold">💬</span>
              <span>
                Especialidades con mayor demanda:{" "}
                {indicadores.topEspecialidades.length > 0 ? (
                  <b>{indicadores.topEspecialidades.join(" y ")}</b>
                ) : (
                  "Sin datos."
                )}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ---------- Componente KPI ---------- */
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
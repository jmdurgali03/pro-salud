"use client";

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
  // ✅ Consultas
  const pacientes = useQuery(api.pacientes.listar, {}) ?? [];
  const profesionales = useQuery(api.profesionales.listar, {}) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar, {}) ?? [];
  const turnos = useQuery(api.turnos.listar, {}) ?? [];

  // ✅ Datos simulados de ejemplo (puedes reemplazar con tus queries)
  const turnosPorEspecialidad = [
    { nombre: "Cardiología", turnos: 45 },
    { nombre: "Pediatría", turnos: 28 },
    { nombre: "Dermatología", turnos: 18 },
    { nombre: "Traumatología", turnos: 22 },
  ];

  const obrasPorUso = [
    { nombre: "IPS", valor: 40 },
    { nombre: "OSDE", valor: 25 },
    { nombre: "Swiss Medical", valor: 20 },
    { nombre: "Sancor Salud", valor: 15 },
  ];

  const COLORS = ["#3B82F6", "#22C55E", "#EAB308", "#EC4899"];

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Reportes", href: "/gerente/reportes" }
      ]}
    >
      <div className="w-full px-8 py-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-sky-500 rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">
              Panel de Control del Gerente
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-5">
            Visualiza el estado general de la institución y el desempeño de las áreas.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPI
            icon={<Users className="w-6 h-6 text-blue-500" />}
            title="Pacientes activos"
            value={pacientes.length}
          />
          <KPI
            icon={<BriefcaseMedical className="w-6 h-6 text-green-500" />}
            title="Profesionales activos"
            value={profesionales.length}
          />
          <KPI
            icon={<CalendarDays className="w-6 h-6 text-amber-500" />}
            title="Turnos registrados"
            value={turnos.length}
          />
          <KPI
            icon={<Activity className="w-6 h-6 text-rose-500" />}
            title="Obras Sociales"
            value={obrasSociales.length}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Turnos por especialidad */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Turnos por Especialidad
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnosPorEspecialidad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="turnos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por obra social */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" /> Distribución por Obras Sociales
            </h2>
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
          </div>
        </div>

        {/* Indicadores adicionales */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Indicadores de Actividad
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li>✅ <b>90%</b> de los turnos del mes fueron confirmados.</li>
            <li>🚫 <b>7%</b> de ausencias o cancelaciones.</li>
            <li>🕒 Tiempo promedio de espera: <b>12 minutos</b>.</li>
            <li>💬 Especialidades con mayor demanda: <b>Cardiología</b> y <b>Pediatría</b>.</li>
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
    <div className="flex items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import {
  FileDown,
  TrendingUp,
  Users,
  BriefcaseMedical,
  CalendarDays,
  Activity,
  BarChart3,
} from "lucide-react";

import { jsPDF } from "jspdf";
import { generarReporteProsaludPDF } from "./_utils/pdfReport";
// 🔹 Componentes modularizados
import { KPI } from "./_components/KPI";
import { Torta } from "./_components/Torta";
import { HeatmapOcupacion } from "./_components/HeatmapOcupacion";
import { RankingProfesionales } from "./_components/RankingProfesionales";
import { EmbudoEstados } from "./_components/EmbudoEstados";
import { PacientesNuevos } from "./_components/PacientesNuevos";
import { EvolucionTurnos } from "./_components/EvolucionTurnos";
import { TurnosPorEspecialidadesView } from "./_components/TurnosPorEspecialidadesView";

export default function GerenteReportesPage() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState(false);

  // 🔹 Datos desde Convex
  const pacientes = useQuery(api.pacientes.listar, { search: "" }) ?? [];
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];
  const turnos = useQuery(api.turnos.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasPorUso =
    useQuery(api.obrasSociales.contarPacientesPorObraSocial) ?? [];

  // 🔹 Utilidad para comparar estados
  const esEstado = (t: any, ...estados: string[]) => estados.includes(t.estado);

  // ================================================================
  // INDICADORES GLOBALES
  // ================================================================
  const indicadores = useMemo(() => {
    const total = turnos.length;
    const pct = (f: number) => (total ? ((f / total) * 100).toFixed(1) : 0);
    const confirm = turnos.filter((t) => esEstado(t, "Confirmado")).length;
    const cancel = turnos.filter((t) => esEstado(t, "Cancelado")).length;
    const pend = turnos.filter((t) => esEstado(t, "Pendiente")).length;
    const fin = turnos.filter((t) => esEstado(t, "Finalizado")).length;
    return {
      confirm: pct(confirm),
      cancel: pct(cancel),
      pend: pct(pend),
      fin: pct(fin),
    };
  }, [turnos]);

  // ================================================================
  // EXPORTAR PDF MULTIPÁGINA (ajustada)
  // ================================================================
const handleExportPdf = async () => {
  await generarReporteProsaludPDF({
    turnos,
    pacientes,
    profesionales,
    obrasSociales,
    obrasPorUso,
    especialidades,
  });
};



  const COLORS = [
    "#3B82F6",
    "#22C55E",
    "#EAB308",
    "#EC4899",
    "#A855F7",
    "#14B8A6",
  ];

  // ================================================================
  // RENDER PRINCIPAL
  // ================================================================
  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Reportes", href: "/gerente/reportes" },
      ]}
    >
      {/* Overlay de carga */}
      {exportando && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="flex items-center gap-3 bg-emerald-600 px-6 py-3 rounded-xl shadow-lg text-white animate-pulse">
            <FileDown className="w-5 h-5" />
            Generando reporte PDF…
          </div>
        </div>
      )}

      {/* Botón Exportar */}


      {/* === CONTENIDO PRINCIPAL === */}
      <div
        ref={dashboardRef}
        className="w-full px-6 py-6 space-y-8 page-break-inside-avoid"
      >
        {/* === TÍTULO PRINCIPAL === */}
        <div className="bg-white p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            {/* 🔹 Título con línea teal */}
            <div className="flex items-center">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-teal-400 to-teal-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Reporte General del Centro Médico
              </h1>
            </div>

            {/* 🔹 Botón Exportar PDF */}
            <button
              onClick={handleExportPdf}
              disabled={exportando}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50"
            >
              <FileDown className="w-5 h-5" />
              {exportando ? "Generando PDF…" : "Exportar PDF"}
            </button>
          </div>

          <p className="text-gray-500 text-sm">
            Reporte del {new Date().toLocaleDateString("es-AR")}
          </p>
        </div>

        {/* === Indicadores globales === */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" /> Indicadores Generales
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Porcentaje de turnos según estado actual.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-green-600 text-lg font-bold">
                ✅ {indicadores.confirm}%
              </p>
              <p>Confirmados</p>
            </div>
            <div>
              <p className="text-red-600 text-lg font-bold">
                🚫 {indicadores.cancel}%
              </p>
              <p>Cancelados</p>
            </div>
            <div>
              <p className="text-amber-600 text-lg font-bold">
                ⏳ {indicadores.pend}%
              </p>
              <p>Pendientes</p>
            </div>
            <div>
              <p className="text-blue-600 text-lg font-bold">
                🔵 {indicadores.fin}%
              </p>
              <p>Finalizados</p>
            </div>
          </div>
        </div>

        {/* === KPIs === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 page-break-inside-avoid">
          <KPI
            icon={<Users className="w-6 h-6 text-blue-500" />}
            title="Pacientes"
            value={pacientes.length}
          />
          <KPI
            icon={<BriefcaseMedical className="w-6 h-6 text-green-500" />}
            title="Profesionales"
            value={profesionales.length}
          />
          <KPI
            icon={<CalendarDays className="w-6 h-6 text-amber-500" />}
            title="Turnos"
            value={turnos.length}
          />
          <KPI
            icon={<Activity className="w-6 h-6 text-rose-500" />}
            title="Obras Sociales"
            value={obrasSociales.length}
          />
        </div>
{/* === Gráficos principales === */}
<div className="page-break-inside-avoid print:break-inside-avoid">
  <EvolucionTurnos turnos={turnos} profesionales={profesionales} />
</div>

{/* === Turnos por especialidades === */}
<div className="page-break-inside-avoid print:break-inside-avoid">
  <TurnosPorEspecialidadesView
    turnos={turnos}
    especialidades={especialidades}
  />
</div>

{/* === Otros gráficos === */}
<div className="page-break-inside-avoid print:break-inside-avoid">
  <HeatmapOcupacion turnos={turnos} profesionales={profesionales} />
</div>

<div className="page-break-inside-avoid print:break-inside-avoid">
  <RankingProfesionales
    turnos={turnos}
    profesionales={profesionales}
    especialidades={especialidades}
  />
</div>

<div className="page-break-inside-avoid print:break-inside-avoid">
  <PacientesNuevos pacientes={pacientes} />
</div>

{/* === Gráficos de torta === */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 page-break-inside-avoid print:break-inside-avoid">
  <Torta
    titulo="Distribución por Obras Sociales"
    icon={<Activity className="w-5 h-5 text-rose-600" />}
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
      {
        name: "Masculino",
        value: pacientes.filter((p: any) => p.genero === "Masculino").length,
      },
      {
        name: "Femenino",
        value: pacientes.filter((p: any) => p.genero === "Femenino").length,
      },
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

      </div>
    </PageWrapper>
  );
}

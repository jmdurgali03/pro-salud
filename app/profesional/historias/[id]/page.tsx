// app/profesional/historias/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Componentes
import Section from "../../../recepcionista/pacientes/_components/Section";
import ConsultasTable from "../../../recepcionista/pacientes/_components/ConsultasTable";
import NuevaConsultaModal from "../../../recepcionista/pacientes/_components/NuevaConsultaModal";
import NuevoDiagnosticoModal from "../../../recepcionista/pacientes/_components/NuevoDiagnosticoModal";
import NuevoTratamientoModal from "../../../recepcionista/pacientes/_components/NuevoTratamientoModal";
import TratamientosTable from "../../../recepcionista/pacientes/_components/TratamientosTable";
import NuevaNotaMedicaModal from "../../../recepcionista/pacientes/_components/NuevaNotaMedicaModal";
import NotasMedicasTable, { Nota } from "../../../recepcionista/pacientes/_components/NotasMedicasTable";
import HeroPaciente from "../../../recepcionista/pacientes/_components/HeroPaciente";
import Panel from "../../../recepcionista/pacientes/_components/Panel";
import { KPIGrid } from "../../../recepcionista/pacientes/_components/KPI";

// Nuevos helpers UI
import BigTabs from "../../../recepcionista/pacientes/_components/BigTabs";
import Pagination from "../../../recepcionista/pacientes/_components/Pagination";

// Icons para los tabs
import { LayoutGrid, Stethoscope, NotebookText, Pill } from "lucide-react";

/* -------------------- Tipos locales -------------------- */
type PacienteExtendido = {
  _id: Id<"pacientes">;
  _creationTime: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  dni: string;
  fechaNacimiento?: string | number;
  genero?: "Masculino" | "Femenino";
  creadoEn: number;
  actualizadoEn: number;
  obrasSocialesNombres: string[];
};

type Consulta = {
  _id: Id<"consultas">;
  motivo: string;
  fecha: number;
  profesionalId: Id<"profesionales">;
  notas?: string;
};

type Diagnostico = {
  _id: Id<"diagnosticos">;
  consultaId: Id<"consultas">;
  descripcion: string;
  profesionalId: Id<"profesionales">;
  estado: "Presuntivo" | "Definitivo";
  fecha: number;
};

type Tratamiento = {
  _id: Id<"tratamientos">;
  pacienteId: Id<"pacientes">;
  profesional: string;
  titulo: string;
  indicaciones: string;
  fechaInicio: number;
  fechaFin?: number | null;
  estado: "Activo" | "Suspendido" | "Finalizado";
  cronico?: boolean;
  notas?: string;
};
/* ------------------------------------------------------ */

const PAGE_SIZE = 10;
type TabKey = "resumen" | "consultas" | "notas" | "tratamientos";

export default function HistorialPacientePage() {
  const { id } = useParams();
  const pacienteId = id as Id<"pacientes">;

  // Queries
  const paciente = useQuery(api.pacientes.getById, { id: pacienteId }) as PacienteExtendido | null;
  const consultasQ = useQuery(api.consultas.listarPorPaciente, { pacienteId }) as Consulta[] | undefined;
  const diagnosticosQ = useQuery(api.diagnosticos.listarPorPaciente, { pacienteId }) as Diagnostico[] | undefined;
  const tratamientosQ = useQuery(api.tratamientos.listarPorPaciente, { pacienteId }) as Tratamiento[] | undefined;
  const notasQ = useQuery(api.observaciones.listarPorPaciente, { pacienteId }) as Nota[] | undefined;

  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];

  const espNombrePorId = useMemo(() => {
    const m = new Map<Id<"especialidades">, string>();
    for (const e of especialidades) m.set(e._id, e.nombre);
    return m;
  }, [especialidades]);

  const profNombrePorId = useMemo(() => {
    const m = new Map<Id<"profesionales">, string>();
    for (const p of profesionales) m.set(p._id, `${p.apellido}, ${p.nombre}`);
    return m;
  }, [profesionales]);

  // Mutations
  const crearConsulta = useMutation(api.consultas.crear);
  const crearDiagnostico = useMutation(api.diagnosticos.crear);
  const crearTratamiento = useMutation(api.tratamientos.crear);
  const cambiarEstadoTrat = useMutation(api.tratamientos.cambiarEstado);
  const crearNota = useMutation(api.observaciones.crear);

  // UI state
  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);
  const [openTrat, setOpenTrat] = useState(false);
  const [openNota, setOpenNota] = useState(false);

  // Tabs + paginación
  const [tab, setTab] = useState<TabKey>("resumen");
  const [pageCons, setPageCons] = useState(1);
  const [pageNotas, setPageNotas] = useState(1);
  const [pageTrat, setPageTrat] = useState(1);

  // Scroll al entrar
  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  // Normalización
  const consultas = consultasQ ?? [];
  const diagnosticos = diagnosticosQ ?? [];
  const tratamientos = tratamientosQ ?? [];
  const notas = notasQ ?? [];

  // Reset de página cuando cambian tamaños
  useEffect(() => setPageCons(1), [consultas.length]);
  useEffect(() => setPageNotas(1), [notas.length]);
  useEffect(() => setPageTrat(1), [tratamientos.length]);

  // Diagnósticos por consulta
  const dxPorConsulta = useMemo(() => {
    const m = new Map<string, Diagnostico[]>();
    for (const dx of diagnosticos) {
      const key = dx.consultaId as unknown as string;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(dx);
    }
    return m;
  }, [diagnosticos]);

  const hayConsultas = consultas.length > 0;

  // Slices paginados
  const paginatedConsultas = useMemo(() => {
    const start = (pageCons - 1) * PAGE_SIZE;
    return consultas.slice(start, start + PAGE_SIZE);
  }, [consultas, pageCons]);

  const paginatedNotas = useMemo(() => {
    const start = (pageNotas - 1) * PAGE_SIZE;
    return notas.slice(start, start + PAGE_SIZE);
  }, [notas, pageNotas]);

  const paginatedTratamientos = useMemo(() => {
    const start = (pageTrat - 1) * PAGE_SIZE;
    return tratamientos.slice(start, start + PAGE_SIZE);
  }, [tratamientos, pageTrat]);

  // Handlers (sin cambios funcionales)
  const submitConsulta = async (data: {
    motivo: string;
    profesionalId: Id<"profesionales">;
    notas?: string;
  }) => {
    await crearConsulta({ pacienteId, ...data });
    setOpenConsulta(false);
  };

  const submitDiagnostico = async (data: {
    consultaId: Id<"consultas">;
    descripcion: string;
    profesionalId: Id<"profesionales">;
    estado: "Presuntivo" | "Definitivo";
    fecha?: number;
  }) => {
    await crearDiagnostico({ pacienteId, ...data });
    setOpenDx(false);
  };

  const submitTratamiento = async (data: {
    titulo: string;
    profesional: string;
    indicaciones: string;
    fechaInicio?: number;
    fechaFin?: number | null;
    estado: "Activo" | "Suspendido" | "Finalizado";
    cronico?: boolean;
    notas?: string;
  }) => {
    await crearTratamiento({ pacienteId, ...data } as any);
    setOpenTrat(false);
  };

  const submitNota = async (data: {
    profesionalId: Id<"profesionales">;
    consultaId?: Id<"consultas">;
    fecha?: number;
    categoria: "Evolución" | "Indicación" | "Interconsulta" | "Epicrisis" | "Administrativa";
    visibilidad: "Equipo" | "Privada";
    titulo?: string;
    texto: string;
  }) => {
    await crearNota({ pacienteId, ...data });
    setOpenNota(false);
  };

  /* ========================== RENDER ========================== */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <HeroPaciente
        nombre={paciente?.nombre}
        apellido={paciente?.apellido}
        dni={paciente?.dni}
        genero={paciente?.genero}
        fechaNacimiento={paciente?.fechaNacimiento}
        email={paciente?.email}
        telefono={paciente?.telefono}
        obrasSociales={paciente?.obrasSocialesNombres}
        onNuevaConsulta={() => setOpenConsulta(true)}
        onNuevoDiagnostico={() => setOpenDx(true)}
        onNuevaNota={() => setOpenNota(true)}
        onNuevoTratamiento={() => setOpenTrat(true)}
        diagnosticoHabilitado={hayConsultas}
      />

      {/* TABS GRANDES */}
      <div className="mx-auto max-w-6xl px-6 pt-4">
        <BigTabs
          value={tab}
          onChange={(t) => {
            setTab(t as TabKey);
            setPageCons(1);
            setPageNotas(1);
            setPageTrat(1);
          }}
          items={[
            { key: "resumen", label: "Resumen", icon: LayoutGrid, helper: "Todo" },
            { key: "consultas", label: "Consultas", icon: Stethoscope, helper: "Sólo consultas" },
            { key: "notas", label: "Notas médicas", icon: NotebookText, helper: "Sólo notas" },
            { key: "tratamientos", label: "Tratamientos", icon: Pill, helper: "Sólo tratamientos" },
          ]}
        />
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <main className="min-w-0 space-y-6">
          {/* Resumen (KPIs) */}
          {(tab === "resumen") && (
            <section id="resumen" ref={resumenRef} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <KPIGrid
                consultas={consultas.length}
                diagnosticos={diagnosticos.length}
                tratamientos={tratamientos.length}
                notas={notas.length}
              />
            </section>
          )}

          {/* Consultas */}
          {(tab === "resumen" || tab === "consultas") && (
            <Section
              id="consultas"
              title="Consultas"
              right={
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpenConsulta(true)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                  >
                    Nueva consulta
                  </button>
                  <button
                    onClick={() => setOpenDx(true)}
                    disabled={!hayConsultas}
                    title={hayConsultas ? "Crear diagnóstico" : "Primero registrá una consulta"}
                    className={`rounded-lg px-4 py-2 text-sm font-medium border shadow-sm ${
                      hayConsultas
                        ? "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Nuevo diagnóstico
                  </button>
                </div>
              }
            >
              <Panel>
                <ConsultasTable
                  data={paginatedConsultas}
                  dxByConsulta={dxPorConsulta}
                  getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
                />
              </Panel>
              <Pagination
                page={pageCons}
                pageCount={Math.max(1, Math.ceil(consultas.length / PAGE_SIZE))}
                onPageChange={setPageCons}
              />
            </Section>
          )}

          {/* Notas médicas */}
          {(tab === "resumen" || tab === "notas") && (
            <Section
              id="notas"
              title="Notas médicas"
              right={
                <button
                  onClick={() => setOpenNota(true)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
                  title="Registrar nota médica (evolución, indicación, etc.)"
                >
                  Nueva nota
                </button>
              }
            >
              <Panel>
                <NotasMedicasTable
                  data={paginatedNotas}
                  getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
                />
              </Panel>
              <Pagination
                page={pageNotas}
                pageCount={Math.max(1, Math.ceil(notas.length / PAGE_SIZE))}
                onPageChange={setPageNotas}
              />
            </Section>
          )}

          {/* Tratamientos */}
          {(tab === "resumen" || tab === "tratamientos") && (
            <Section
              id="tratamientos"
              title="Tratamientos"
              right={
                <button
                  onClick={() => setOpenTrat(true)}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm hover:bg-cyan-100"
                >
                  Asignar tratamiento
                </button>
              }
            >
              <Panel>
                <TratamientosTable
                  data={paginatedTratamientos}
                  onChangeEstado={async ({ id, estado }) => {
                    await cambiarEstadoTrat({ id: id as Id<"tratamientos">, estado });
                  }}
                />
              </Panel>
              <Pagination
                page={pageTrat}
                pageCount={Math.max(1, Math.ceil(tratamientos.length / PAGE_SIZE))}
                onPageChange={setPageTrat}
              />
            </Section>
          )}
        </main>
      </div>

      {/* Modales */}
      <NuevaConsultaModal
        open={openConsulta}
        onClose={() => setOpenConsulta(false)}
        onSubmit={submitConsulta}
        profesionales={profesionales}
        espNombrePorId={espNombrePorId}
      />

      <NuevoDiagnosticoModal
        open={openDx}
        onClose={() => setOpenDx(false)}
        onSubmit={submitDiagnostico}
        profesionales={profesionales}
        consultas={consultas}
        getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
      />

      <NuevaNotaMedicaModal
        open={openNota}
        onClose={() => setOpenNota(false)}
        onSubmit={submitNota}
        profesionales={profesionales}
        consultas={consultas}
        getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
      />

      <NuevoTratamientoModal
        open={openTrat}
        onClose={() => setOpenTrat(false)}
        onSubmit={submitTratamiento}
      />
    </div>
  );
}

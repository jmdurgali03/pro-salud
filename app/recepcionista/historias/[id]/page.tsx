// app/recepcionista/historias/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import Section from "@/components/pacientes/Section";
import ConsultasTable from "@/components/pacientes/ConsultasTable";
import NuevaConsultaModal from "@/components/pacientes/NuevaConsultaModal";
import NuevoDiagnosticoModal from "@/components/pacientes/NuevoDiagnosticoModal";
import NuevoTratamientoModal from "@/components/pacientes/NuevoTratamientoModal";
import TratamientosTable from "@/components/pacientes/TratamientosTable";
import NuevaNotaMedicaModal from "@/components/pacientes/NuevaNotaMedicaModal";
import NotasMedicasTable, { Nota } from "@/components/pacientes/NotasMedicasTable";
import { PageWrapper } from "@/components/page-wrapper";

// Nuevos componentes UI
import HeroPaciente from "@/components/pacientes/HeroPaciente";
import Panel from "@/components/pacientes/Panel";
import { KPIGrid } from "@/components/pacientes/KPI";
import BigTabs from "@/components/pacientes/BigTabs";
import Pagination from "@/components/pacientes/Pagination";

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

  // Mutations (se mantienen)
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

  const [tab, setTab] = useState<TabKey>("resumen");
  const [pageCons, setPageCons] = useState(1);
  const [pageNotas, setPageNotas] = useState(1);
  const [pageTrat, setPageTrat] = useState(1);

  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  // Normalización
  const consultas = consultasQ ?? [];
  const diagnosticos = diagnosticosQ ?? [];
  const tratamientos = tratamientosQ ?? [];
  const notas = notasQ ?? [];

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

  // Handlers (sin cambios)
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
      {/* HERO (con no-ops para cumplir el tipo) */}
      <HeroPaciente
        nombre={paciente?.nombre}
        apellido={paciente?.apellido}
        dni={paciente?.dni}
        genero={paciente?.genero}
        fechaNacimiento={paciente?.fechaNacimiento}
        email={paciente?.email}
        telefono={paciente?.telefono}
        obrasSociales={paciente?.obrasSocialesNombres}
        onNuevaConsulta={() => {}}
        onNuevoDiagnostico={() => {}}
        onNuevaNota={() => {}}
        onNuevoTratamiento={() => {}}
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
            { key: "resumen", label: "Resumen", icon: LayoutGrid },
            { key: "consultas", label: "Consultas", icon: Stethoscope},
            { key: "notas", label: "Notas médicas", icon: NotebookText},
            { key: "tratamientos", label: "Tratamientos", icon: Pill},
          ]}
        />
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <main className="min-w-0 space-y-6">
          {tab === "resumen" && (
            <section id="resumen" className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <KPIGrid
                consultas={consultas.length}
                diagnosticos={diagnosticos.length}
                tratamientos={tratamientos.length}
                notas={notas.length}
              />
            </section>
          )}

          {(tab === "resumen" || tab === "consultas") && (
            <Section id="consultas" title="Consultas">
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

          {(tab === "resumen" || tab === "notas") && (
            <Section id="notas" title="Notas médicas">
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

          {(tab === "resumen" || tab === "tratamientos") && (
            <Section id="tratamientos" title="Tratamientos">
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

      {/* Modales (se mantienen por compatibilidad) */}
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

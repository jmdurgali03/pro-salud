// app/recepcionista/historias/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import Section from "../../pacientes/_components/Section";
import ConsultasTable from "../../pacientes/_components/ConsultasTable";
import NuevaConsultaModal from "../../pacientes/_components/NuevaConsultaModal";
import NuevoDiagnosticoModal from "../../pacientes/_components/NuevoDiagnosticoModal";
import NuevoTratamientoModal from "../../pacientes/_components/NuevoTratamientoModal";
import TratamientosTable from "../../pacientes/_components/TratamientosTable";
import NuevaNotaMedicaModal from "../../pacientes/_components/NuevaNotaMedicaModal";
import NotasMedicasTable, { Nota } from "../../pacientes/_components/NotasMedicasTable";

// Nuevos componentes
import HeroPaciente from "../../pacientes/_components/HeroPaciente";
import SubnavSticky from "../../pacientes/_components/SubnavSticky";
import Panel from "../../pacientes/_components/Panel";
import { KPIGrid } from "../../pacientes/_components/KPI";

/* -------------------- Tipos locales (sin cambios funcionales) -------------------- */
type PacienteExtendido = {
  _id: Id<"pacientes">;
  _creationTime: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  dni: string;
  fechaNacimiento?: string | number; // dejamos string|number para tolerar ambos casos
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

export default function HistorialPacientePage() {
  const { id } = useParams();
  const pacienteId = id as Id<"pacientes">;

  // Queries (sin cambios)
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

  // Mutations (sin cambios)
  const crearConsulta = useMutation(api.consultas.crear);
  const crearDiagnostico = useMutation(api.diagnosticos.crear);
  const crearTratamiento = useMutation(api.tratamientos.crear);
  const cambiarEstadoTrat = useMutation(api.tratamientos.cambiarEstado);
  const crearNota = useMutation(api.observaciones.crear);

  // UI state (sin cambios)
  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);
  const [openTrat, setOpenTrat] = useState(false);
  const [openNota, setOpenNota] = useState(false);

  // Scroll a resumen al entrar (sin cambios)
  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  // Normalización (sin cambios)
  const consultas = consultasQ ?? [];
  const diagnosticos = diagnosticosQ ?? [];
  const tratamientos = tratamientosQ ?? [];
  const notas = notasQ ?? [];

  // Mapa de diagnósticos por consulta (sin cambios)
  const dxPorConsulta = (() => {
    const m = new Map<string, Diagnostico[]>();
    for (const dx of diagnosticos) {
      const key = dx.consultaId as unknown as string;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(dx);
    }
    return m;
  })();

  const hayConsultas = consultas.length > 0;

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
      {/* HERO: datos grandes + acciones + obras sociales */}
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

      {/* SUBNAV sticky */}
      <SubnavSticky
        items={[
          { href: "#resumen", label: "Resumen" },
          { href: "#consultas", label: "Consultas" },
          { href: "#notas", label: "Notas médicas" },
          { href: "#tratamientos", label: "Tratamientos" },
        ]}
      />

      {/* CONTENIDO */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <main className="min-w-0 space-y-6">
          {/* Resumen (solo KPIs, sin datos repetidos) */}
          <section id="resumen" ref={resumenRef} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <KPIGrid
              consultas={consultas.length}
              diagnosticos={diagnosticos.length}
              tratamientos={tratamientos.length}
              notas={notas.length}
            />
          </section>

          {/* Consultas */}
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
                data={consultas}
                dxByConsulta={dxPorConsulta}
                getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
              />
            </Panel>
          </Section>

          {/* Notas médicas */}
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
                data={notas}
                getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
              />
            </Panel>
          </Section>

          {/* Tratamientos */}
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
                data={tratamientos}
                onChangeEstado={async ({ id, estado }) => {
                  await cambiarEstadoTrat({ id, estado });
                }}
              />
            </Panel>
          </Section>
        </main>
      </div>

      {/* Modales (sin cambios) */}
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

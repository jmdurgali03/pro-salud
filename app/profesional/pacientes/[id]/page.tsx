"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

import Section from "@/components/pacientes/Section";
import ConsultasTable from "@/components/pacientes/ConsultasTable";
import NuevaConsultaModal from "@/components/pacientes/NuevaConsultaModal";
import NuevoDiagnosticoModal from "@/components/pacientes/NuevoDiagnosticoModal";
import NuevoTratamientoModal from "@/components/pacientes/NuevoTratamientoModal";
import TratamientosTable from "@/components/pacientes/TratamientosTable";
import NuevaNotaMedicaModal from "@/components/pacientes/NuevaNotaMedicaModal";
import NotasMedicasTable, { Nota } from "@/components/pacientes/NotasMedicasTable";
import HeroPaciente from "@/components/pacientes/HeroPaciente";
import Panel from "@/components/pacientes/Panel";
import { KPIGrid } from "@/components/pacientes/KPI";
import BigTabs from "@/components/pacientes/BigTabs";
import Pagination from "@/components/pacientes/Pagination";
import { LayoutGrid, Stethoscope, NotebookText, Pill, CheckCircle2, AlertCircle } from "lucide-react";

type PacienteExtendido = {
  _id: Id<"pacientes">;
  nombre: string;
  apellido: string;
  dni: string;
  genero?: "Masculino" | "Femenino";
  fechaNacimiento?: string | number;
  email?: string;
  telefono?: string;
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
  const { user } = useUser();

  const profesionalActual = useQuery(api.profesionales.getByClerkUser, {
    clerkUserId: user?.id || "",
  });

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

  const crearConsulta = useMutation(api.consultas.crear);
  const crearDiagnostico = useMutation(api.diagnosticos.crear);
  const crearTratamiento = useMutation(api.tratamientos.crear);
  const cambiarEstadoTrat = useMutation(api.tratamientos.cambiarEstado);
  const crearNota = useMutation(api.observaciones.crear);

  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);
  const [openTrat, setOpenTrat] = useState(false);
  const [openNota, setOpenNota] = useState(false);

  const [tab, setTab] = useState<TabKey>("resumen");
  const [pageCons, setPageCons] = useState(1);
  const [pageNotas, setPageNotas] = useState(1);
  const [pageTrat, setPageTrat] = useState(1);

  // 🟣 Estado para los toasts
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  const consultas = consultasQ ?? [];
  const diagnosticos = diagnosticosQ ?? [];
  const tratamientos = tratamientosQ ?? [];
  const notas = notasQ ?? [];

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

  const ensureProfesional = () => {
    if (!profesionalActual?._id) {
      throw new Error("No se encontró el profesional vinculado a este usuario.");
    }
    return profesionalActual;
  };

  // 🟢 SUBMITS con toasts
  const submitConsulta = async (data: { motivo: string; notas?: string }) => {
    try {
      const yo = ensureProfesional();
      await crearConsulta({
        pacienteId,
        motivo: data.motivo,
        notas: data.notas,
        profesionalId: yo._id,
      });
      setOpenConsulta(false);
      setToast({ msg: "Consulta cargada correctamente.", type: "success" });
    } catch {
      setToast({ msg: "Error al cargar la consulta.", type: "error" });
    }
  };

  const submitDiagnostico = async (data: {
    consultaId: Id<"consultas">;
    descripcion: string;
    estado: "Presuntivo" | "Definitivo";
    fecha?: number;
  }) => {
    try {
      const yo = ensureProfesional();
      await crearDiagnostico({
        pacienteId,
        consultaId: data.consultaId,
        descripcion: data.descripcion,
        estado: data.estado,
        fecha: data.fecha ?? Date.now(),
        profesionalId: yo._id,
      });
      setOpenDx(false);
      setToast({ msg: "Diagnóstico cargado correctamente.", type: "success" });
    } catch {
      setToast({ msg: "Error al cargar el diagnóstico.", type: "error" });
    }
  };

  const submitTratamiento = async (data: {
    titulo: string;
    indicaciones: string;
    fechaInicio?: number;
    fechaFin?: number | null;
    estado: "Activo" | "Suspendido" | "Finalizado";
    cronico?: boolean;
    notas?: string;
  }) => {
    try {
      const yo = ensureProfesional();
      const profesionalStr = `${yo.apellido}, ${yo.nombre}`;
      await crearTratamiento({
        pacienteId,
        titulo: data.titulo,
        indicaciones: data.indicaciones,
        fechaInicio: data.fechaInicio ?? Date.now(),
        fechaFin: data.fechaFin ?? undefined,
        estado: data.estado,
        cronico: data.cronico,
        notas: data.notas,
        profesional: profesionalStr,
      } as any);
      setOpenTrat(false);
      setToast({ msg: "Tratamiento cargado correctamente.", type: "success" });
    } catch {
      setToast({ msg: "Error al cargar el tratamiento.", type: "error" });
    }
  };

  const submitNota = async (data: {
    consultaId?: Id<"consultas">;
    categoria: string;
    visibilidad: string;
    titulo?: string;
    texto: string;
  }) => {
    try {
      const yo = ensureProfesional();
      await crearNota({
        pacienteId,
        consultaId: data.consultaId,
        fecha: Date.now(),
        categoria: data.categoria as any,
        visibilidad: data.visibilidad as any,
        titulo: data.titulo,
        texto: data.texto,
        profesionalId: yo._id,
      });
      setOpenNota(false);
      setToast({ msg: "Nota médica cargada correctamente.", type: "success" });
    } catch {
      setToast({ msg: "Error al cargar la nota médica.", type: "error" });
    }
  };

  // 🟣 RENDER
  return (
    <div className="min-h-screen bg-gray-50">
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
        diagnosticoHabilitado={consultas.length > 0}
      />

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
            { key: "consultas", label: "Consultas", icon: Stethoscope },
            { key: "notas", label: "Notas médicas", icon: NotebookText },
            { key: "tratamientos", label: "Tratamientos", icon: Pill },
          ]}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <main className="min-w-0 space-y-6">
          {tab === "resumen" && (
            <section ref={resumenRef} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <KPIGrid
                consultas={consultas.length}
                diagnosticos={diagnosticos.length}
                tratamientos={tratamientos.length}
                notas={notas.length}
              />
            </section>
          )}

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

          {(tab === "resumen" || tab === "notas") && (
            <Section
              id="notas"
              title="Notas médicas"
              right={
                <button
                  onClick={() => setOpenNota(true)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
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

      {/* 🟣 Modales */}
      <NuevaConsultaModal
        open={openConsulta}
        onClose={() => setOpenConsulta(false)}
        onSubmit={submitConsulta}
        profesionales={profesionalActual ? [profesionalActual] : []}
        espNombrePorId={espNombrePorId}
        fixedProfesionalId={profesionalActual?._id}
      />

      <NuevoDiagnosticoModal
        open={openDx}
        onClose={() => setOpenDx(false)}
        onSubmit={submitDiagnostico}
        profesionales={profesionalActual ? [profesionalActual] : []}
        consultas={consultas}
        getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
        fixedProfesionalId={profesionalActual?._id}
      />

      <NuevaNotaMedicaModal
        open={openNota}
        onClose={() => setOpenNota(false)}
        onSubmit={submitNota}
        profesionales={profesionalActual ? [profesionalActual] : []}
        consultas={consultas}
        getProfesionalNombre={(id) => profNombrePorId.get(id) ?? "—"}
        fixedProfesionalId={profesionalActual?._id}
      />

      <NuevoTratamientoModal
        open={openTrat}
        onClose={() => setOpenTrat(false)}
        onSubmit={submitTratamiento}
        fixedProfesionalName={
          profesionalActual ? `${profesionalActual.apellido}, ${profesionalActual.nombre}` : undefined
        }
      />

      {/* ✅ Toast abajo a la derecha */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
            toast.type === "success"
              ? "bg-emerald-600 border-emerald-400"
              : "bg-red-600 border-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <p className="font-medium">{toast.msg}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white hover:text-gray-100 text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

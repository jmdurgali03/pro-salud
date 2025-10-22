"use client";

import { useParams } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

import HeroPaciente from "@/components/pacientes/HeroPaciente";
import Section from "@/components/pacientes/Section";
import Panel from "@/components/pacientes/Panel";
import BigTabs from "@/components/pacientes/BigTabs";
import Pagination from "@/components/pacientes/Pagination";

import IndicacionesTable, { IndicRow } from "@/components/pacientes/IndicacionesTable";
import NuevaIndicacionModal from "@/components/pacientes/NuevaIndicacionModal";
import DetalleIndicacionModal from "@/components/pacientes/DetalleIndicacionModal";

import DiagnosticosTable from "@/components/pacientes/DiagnosticosTable";

import MedicamentosTable, { MedRow } from "@/components/pacientes/MedicamentosTable";
import DetalleMedicamentoModal from "@/components/pacientes/DetalleMedicamentoModal";
import NuevoMedicamentoModal from "@/components/pacientes/NuevoMedicamentoModal";
import NuevoDiagnosticoModal from "@/components/pacientes/NuevoDiagnosticoModal";

import {
  LayoutGrid,
  Pill,
  ClipboardList,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ================= Tipos ================= */
type PacienteExtendido = {
  _id: Id<"pacientes">;
  nombre: string;
  apellido: string;
  dni: string;
  genero?: "Masculino" | "Femenino" | "Otro";
  fechaNacimiento?: string | number;
  email?: string;
  telefono?: string;
  obrasSocialesNombres: string[];
};

type Diagnostico = {
  _id: Id<"diagnosticos">;
  descripcion: string;
  profesionalId: Id<"profesionales">;
  estado: "Presuntivo" | "Definitivo";
  fecha?: number;
};

type Indicacion = IndicRow;
type Medicamento = MedRow;

type FormaLiteral =
  | "Comprimidos"
  | "Cápsulas"
  | "Jarabe"
  | "Solución"
  | "Inyectable"
  | "Pomada"
  | "Otro";

const PAGE_SIZE = 10;
type TabKey = "resumen" | "diagnosticos" | "indicaciones" | "medicamentos";

/* ================= Página ================= */
export default function HistorialPacientePage() {
  const { id } = useParams();
  const pacienteId = id as Id<"pacientes">;
  const { user } = useUser();

  const profesionalActual = useQuery(api.profesionales.getByClerkUser, {
    clerkUserId: user?.id || "",
  });

  const paciente = useQuery(api.pacientes.getById, { id: pacienteId }) as PacienteExtendido | null;
  const diagnosticos = useQuery(api.diagnosticos.listarPorPaciente, { pacienteId }) as Diagnostico[] | undefined;
  const indicaciones = useQuery(api.indicaciones.listarPorPaciente, { pacienteId }) as Indicacion[] | undefined;
  const medicamentos = useQuery(api.medicamentos.listarPorPaciente, { pacienteId }) as Medicamento[] | undefined;

  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const profNombrePorId = useMemo(() => {
    const m = new Map<Id<"profesionales">, string>();
    for (const p of profesionales) m.set(p._id, `${p.apellido}, ${p.nombre}`);
    return m;
  }, [profesionales]);

  // ====== mutations ======
  const crearDiagnostico = useMutation(api.diagnosticos.crear);
  const crearIndicacion = useMutation(api.indicaciones.crear);
  const actualizarIndicacion = useMutation(api.indicaciones.actualizar);
  const crearMedicamento = useMutation(api.medicamentos.crear);
  const actualizarMedicamento = useMutation(api.medicamentos.actualizar);
  const cambiarEstadoMedicamento = useMutation(api.medicamentos.cambiarEstado);

  // ====== modales (crear) ======
  const [openDx, setOpenDx] = useState(false);
  const [openIndic, setOpenIndic] = useState(false);
  const [openMed, setOpenMed] = useState(false);

  // ====== modales (ver/editar indicación) ======
  const [openIndicView, setOpenIndicView] = useState(false);
  const [indicVer, setIndicVer] = useState<Indicacion | null>(null);

  const [openIndicEdit, setOpenIndicEdit] = useState(false);
  const [indicSeleccionada, setIndicSeleccionada] = useState<Indicacion | null>(null);

  // ====== modales (editar medicamento) ======
  const [openMedEdit, setOpenMedEdit] = useState(false);
  const [medSeleccionadoEdit, setMedSeleccionadoEdit] = useState<Medicamento | null>(null);

  // ====== Detalle medicamento (estado) ======
  const [openMedDetalle, setOpenMedDetalle] = useState(false);
  const [medSeleccionado, setMedSeleccionado] = useState<Medicamento | null>(null);
  const [savingEstado, setSavingEstado] = useState(false);

  // ====== UI state ======
  const [tab, setTab] = useState<TabKey>("resumen");
  const [pageDx, setPageDx] = useState(1);
  const [pageInd, setPageInd] = useState(1);
  const [pageMed, setPageMed] = useState(1);

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

  const slice = (arr: any[], page: number) => arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const paginatedDx = slice(diagnosticos ?? [], pageDx);
  const paginatedIndic = slice(indicaciones ?? [], pageInd);
  const paginatedMed = slice(medicamentos ?? [], pageMed);

  const ensureProfesional = () => {
    if (!profesionalActual?._id) throw new Error("No se encontró el profesional vinculado.");
    return profesionalActual;
  };

  /* ============ Submits ============ */
  const submitDiagnostico = async (data: { descripcion: string; estado: "Presuntivo" | "Definitivo"; fecha?: number }) => {
    try {
      const yo = ensureProfesional();
      await crearDiagnostico({
        pacienteId,
        profesionalId: yo._id,
        descripcion: data.descripcion,
        estado: data.estado,
        fecha: data.fecha ?? Date.now(),
      });
      setOpenDx(false);
      setToast({ msg: "Diagnóstico cargado correctamente.", type: "success" });
    } catch {
      setToast({ msg: "Error al cargar el diagnóstico.", type: "error" });
    }
  };

  const submitIndicacion = async (data: { fecha: number; tipo: Indicacion["tipo"]; nombre: string; observaciones?: string }) => {
    try {
      const yo = ensureProfesional();
      await crearIndicacion({
        pacienteId,
        profesionalId: yo._id,
        fecha: data.fecha,
        tipo: data.tipo,
        nombre: data.nombre,
        observaciones: data.observaciones,
      });
      setOpenIndic(false);
      setToast({ msg: "Indicación cargada correctamente.", type: "success" });
    } catch {
      setToast({ msg: "Error al cargar la indicación.", type: "error" });
    }
  };

  const submitIndicacionEdit = async (data: { fecha: number; tipo: Indicacion["tipo"]; nombre: string; observaciones?: string }) => {
    if (!indicSeleccionada) return;
    try {
      await actualizarIndicacion({ id: indicSeleccionada._id, ...data });
      setOpenIndicEdit(false);
      setIndicSeleccionada(null);
      setToast({ msg: "Indicación actualizada.", type: "success" });
    } catch {
      setToast({ msg: "No se pudo actualizar la indicación.", type: "error" });
    }
  };

  // CREAR MEDICAMENTO
  const submitMedicamento = async (data: Omit<Medicamento, "_id" | "profesionalId">) => {
    try {
      const yo = ensureProfesional();

      const payload = {
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin ?? null,
        estado: "Activo" as const,
        nombreComercial: data.nombreComercial ?? undefined,
        droga: data.droga,
        forma: (data.forma as unknown) as FormaLiteral,
        dosis: data.dosis,
        frecuencia: data.frecuencia,
        duracion: data.duracion ?? undefined,
        via: data.via ?? undefined,
        indicaciones: data.indicaciones ?? undefined,
        cronico: data.cronico ?? undefined,
        notas: data.notas ?? undefined,
      };

      await crearMedicamento({
        pacienteId,
        profesionalId: yo._id,
        ...payload,
      });

      setOpenMed(false);
      setToast({ msg: "Medicamento cargado correctamente.", type: "success" });
    } catch {
      setToast({ msg: "Error al cargar el medicamento.", type: "error" });
    }
  };

  // EDITAR MEDICAMENTO
  const submitMedicamentoEdit = async (data: Omit<Medicamento, "_id" | "profesionalId">) => {
    if (!medSeleccionadoEdit) return;
    try {
      const payload = {
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin ?? null,
        nombreComercial: data.nombreComercial ?? undefined,
        droga: data.droga,
        forma: (data.forma as unknown) as FormaLiteral,
        dosis: data.dosis,
        frecuencia: data.frecuencia,
        duracion: data.duracion ?? undefined,
        via: data.via ?? undefined,
        indicaciones: data.indicaciones ?? undefined,
        cronico: data.cronico ?? undefined,
        notas: data.notas ?? undefined,
      };

      await actualizarMedicamento({ id: medSeleccionadoEdit._id, ...payload });

      setOpenMedEdit(false);
      setMedSeleccionadoEdit(null);
      setToast({ msg: "Medicamento actualizado.", type: "success" });
    } catch {
      setToast({ msg: "No se pudo actualizar el medicamento.", type: "error" });
    }
  };

  /* ============ Render ============ */
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
      />

      <div className="mx-auto max-w-6xl px-6 pt-4">
        <BigTabs
          value={tab}
          onChange={(t) => {
            setTab(t as TabKey);
            setPageDx(1);
            setPageInd(1);
            setPageMed(1);
          }}
          items={[
            { key: "resumen", label: "Resumen", icon: LayoutGrid },
            { key: "diagnosticos", label: "Diagnósticos", icon: Stethoscope },
            { key: "indicaciones", label: "Indicaciones médicas", icon: ClipboardList },
            { key: "medicamentos", label: "Medicamentos", icon: Pill },
          ]}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <main className="min-w-0 space-y-6">
          {/* ======= RESUMEN ======= */}
          {tab === "resumen" && (
            <section ref={resumenRef} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Diagnósticos - Verde */}
                    <div className="flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-sm hover:border-emerald-300 transition">
                      <div className="text-sm text-emerald-600 font-medium">Diagnósticos</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{diagnosticos?.length ?? 0}</div>
                    </div>

                    {/* Indicaciones - Celeste */}
                    <div className="flex-1 rounded-xl border border-cyan-200 bg-white px-4 py-3 shadow-sm hover:border-cyan-300 transition">
                      <div className="text-sm text-cyan-600 font-medium">Indicaciones</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{indicaciones?.length ?? 0}</div>
                    </div>

                    {/* Medicamentos - Lila */}
                    <div className="flex-1 rounded-xl border border-violet-200 bg-white px-4 py-3 shadow-sm hover:border-violet-300 transition">
                      <div className="text-sm text-violet-600 font-medium">Medicamentos</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{medicamentos?.length ?? 0}</div>
                    </div>
                  </div>

            </section>
          )}

          {/* ======= DIAGNÓSTICOS ======= */}
          {(tab === "diagnosticos" || tab === "resumen") && (
            <Section
              id="diagnosticos"
              title="Diagnósticos"
              right={
                <button
                  onClick={() => setOpenDx(true)}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-100"
                >
                  Nuevo diagnóstico
                </button>
              }
            >
              <Panel>
                <DiagnosticosTable
                  data={(paginatedDx ?? []).map((dx) => ({
                    _id: dx._id as unknown as string,
                    fecha: dx.fecha ?? 0,
                    descripcion: dx.descripcion,
                    profesional: profNombrePorId.get(dx.profesionalId) ?? "—",
                  }))}
                />
              </Panel>
              <Pagination
                page={pageDx}
                pageCount={Math.max(1, Math.ceil((diagnosticos?.length ?? 0) / PAGE_SIZE))}
                onPageChange={(p) => setPageDx(p)}
              />
            </Section>
          )}

          {/* ======= INDICACIONES ======= */}
          {(tab === "indicaciones" || tab === "resumen") && (
            <Section
              id="indicaciones"
              title="Indicaciones médicas"
              right={
                <button
                  onClick={() => setOpenIndic(true)}
                  className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm hover:bg-cyan-100"
                >
                  Nueva indicación
                </button>
              }
            >
              <Panel>
                <IndicacionesTable
                  data={paginatedIndic as any}
                  getProfesionalNombre={(id) => profNombrePorId.get(id as any) ?? "—"}
                  onView={(row) => {
                    setIndicVer(row as any);
                    setOpenIndicView(true);
                  }}
                  onEdit={(row) => {
                    setIndicSeleccionada(row as any);
                    setOpenIndicEdit(true);
                  }}
                />
              </Panel>
              <Pagination
                page={pageInd}
                pageCount={Math.max(1, Math.ceil((indicaciones?.length ?? 0) / PAGE_SIZE))}
                onPageChange={(p) => setPageInd(p)}
              />
            </Section>
          )}

          {/* ======= MEDICAMENTOS ======= */}
          {(tab === "medicamentos" || tab === "resumen") && (
            <Section
              id="medicamentos"
              title="Medicamentos"
              right={
                <button
                  onClick={() => setOpenMed(true)}
                  className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200 transition"
                >
                  Nuevo medicamento
                </button>

              }
            >
              <Panel>
                <MedicamentosTable
                  data={paginatedMed as any}
                  getProfesionalNombre={(id) => profNombrePorId.get(id as any) ?? "—"}
                  onView={(row) => {
                    setMedSeleccionado(row);
                    setOpenMedDetalle(true);
                  }}
                  onEdit={(row) => {
                    setMedSeleccionadoEdit(row);
                    setOpenMedEdit(true);
                  }}
                />
              </Panel>
              <Pagination
                page={pageMed}
                pageCount={Math.max(1, Math.ceil((medicamentos?.length ?? 0) / PAGE_SIZE))}
                onPageChange={(p) => setPageMed(p)}
              />
            </Section>
          )}
        </main>
      </div>

      {/* ======= MODALES (CREAR) ======= */}
      <NuevoDiagnosticoModal
        open={openDx}
        onClose={() => setOpenDx(false)}
        onSubmit={submitDiagnostico}
        profesionales={profesionalActual ? [profesionalActual] : []}
        fixedProfesionalId={profesionalActual?._id}
      />

      <NuevaIndicacionModal
        open={openIndic}
        onClose={() => setOpenIndic(false)}
        onSubmit={submitIndicacion}
        profesionales={profesionalActual ? [profesionalActual] : []}
        fixedProfesionalId={profesionalActual?._id}
        mode="create"
      />

      <NuevoMedicamentoModal
        open={openMed}
        onClose={() => setOpenMed(false)}
        onSubmit={submitMedicamento}
        profesionales={profesionalActual ? [profesionalActual] : []}
        fixedProfesionalId={profesionalActual?._id}
        mode="create"
      />

      {/* ======= MODALES (VER / EDITAR) ======= */}
    <DetalleIndicacionModal
      open={openIndicView}
      onClose={() => {
        setOpenIndicView(false);
        setIndicVer(null);
      }}
      ind={indicVer} // ✅ nombre correcto de la prop
      profesionalNombre={
        indicVer ? (profNombrePorId.get(indicVer.profesionalId as any) ?? "—") : "—"
      }
    />

    <NuevaIndicacionModal
      open={openIndicEdit}
      onClose={() => {
        setOpenIndicEdit(false);
        setIndicSeleccionada(null);
      }}
      onSubmit={submitIndicacionEdit}
      profesionales={profesionalActual ? [profesionalActual] : []}
      fixedProfesionalId={profesionalActual?._id}
      mode="edit"
      initial={indicSeleccionada ?? undefined}
    />

    <NuevoMedicamentoModal
      open={openMedEdit}
      onClose={() => {
        setOpenMedEdit(false);
        setMedSeleccionadoEdit(null);
      }}
      onSubmit={submitMedicamentoEdit}
      profesionales={profesionalActual ? [profesionalActual] : []}
      fixedProfesionalId={profesionalActual?._id}
      mode="edit"
      initial={medSeleccionadoEdit ?? undefined}
    />

    {/* Modal Detalle Medicamento (edición de estado) */}
    <DetalleMedicamentoModal
      open={openMedDetalle}
      onClose={() => setOpenMedDetalle(false)}
      med={medSeleccionado}
      profesionalNombre={
        medSeleccionado
          ? profNombrePorId.get(medSeleccionado.profesionalId as any) ?? "—"
          : "—"
      }
      saving={savingEstado}
      onChangeEstado={async (estado) => {
        if (!medSeleccionado) return;
        try {
          setSavingEstado(true);
          await cambiarEstadoMedicamento({ id: medSeleccionado._id as any, estado });
          setMedSeleccionado({ ...medSeleccionado, estado });
          setToast({ msg: "Estado actualizado.", type: "success" });
        } catch {
          setToast({ msg: "No se pudo actualizar el estado.", type: "error" });
        } finally {
          setSavingEstado(false);
        }
      }}
    />


      {/* ======= TOAST ======= */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white border ${
            toast.type === "success" ? "bg-emerald-600 border-emerald-400" : "bg-red-600 border-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <p className="font-medium">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-2 text-lg font-bold">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

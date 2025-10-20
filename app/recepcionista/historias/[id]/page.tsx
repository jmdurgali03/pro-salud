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

import IndicacionesTable from "@/components/pacientes/IndicacionesTable";
import DiagnosticosTable from "@/components/pacientes/DiagnosticosTable";
import MedicamentosTable, { MedRow } from "@/components/pacientes/MedicamentosTable";
import DetalleMedicamentoModal from "@/components/pacientes/DetalleMedicamentoModal";

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

type Indicacion = {
  _id: Id<"indicaciones">;
  profesionalId: Id<"profesionales">;
  fecha: number;
  tipo: "Estudio" | "Procedimiento" | "Derivación" | "Control";
  nombre: string;
  observaciones?: string;
  estado: "Pendiente" | "Realizada" | "Cancelada";
};

type Medicamento = MedRow;

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

  const cambiarEstadoMedicamento = useMutation(api.medicamentos.cambiarEstado);

  const [openMedDetalle, setOpenMedDetalle] = useState(false);
  const [medSeleccionado, setMedSeleccionado] = useState<Medicamento | null>(null);
  const [savingEstado, setSavingEstado] = useState(false);

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
                <div className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm text-gray-500">Diagnósticos</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{diagnosticos?.length ?? 0}</div>
                </div>
                <div className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm text-gray-500">Indicaciones</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{indicaciones?.length ?? 0}</div>
                </div>
                <div className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-sm text-gray-500">Medicamentos</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">{medicamentos?.length ?? 0}</div>
                </div>
              </div>
            </section>
          )}

          {/* ======= DIAGNÓSTICOS ======= */}
          {(tab === "diagnosticos" || tab === "resumen") && (
            <Section id="diagnosticos" title="Diagnósticos">
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
                onPageChange={setPageDx}
              />
            </Section>
          )}

          {/* ======= INDICACIONES ======= */}
          {(tab === "indicaciones" || tab === "resumen") && (
            <Section id="indicaciones" title="Indicaciones médicas">
              <Panel>
                <IndicacionesTable
                  data={paginatedIndic as any}
                  getProfesionalNombre={(id) => profNombrePorId.get(id as any) ?? "—"}
                />
              </Panel>
              <Pagination
                page={pageInd}
                pageCount={Math.max(1, Math.ceil((indicaciones?.length ?? 0) / PAGE_SIZE))}
                onPageChange={setPageInd}
              />
            </Section>
          )}

          {/* ======= MEDICAMENTOS ======= */}
          {(tab === "medicamentos" || tab === "resumen") && (
            <Section id="medicamentos" title="Medicamentos">
              <Panel>
                <MedicamentosTable
                  data={paginatedMed as any}
                  getProfesionalNombre={(id) => profNombrePorId.get(id as any) ?? "—"}
                  onView={(row) => {
                    setMedSeleccionado(row);
                    setOpenMedDetalle(true);
                  }}
                />
              </Panel>
              <Pagination
                page={pageMed}
                pageCount={Math.max(1, Math.ceil((medicamentos?.length ?? 0) / PAGE_SIZE))}
                onPageChange={setPageMed}
              />
            </Section>
          )}
        </main>
      </div>

      {/* ======= MODAL DETALLE MEDICAMENTO ======= */}
      <DetalleMedicamentoModal
        open={openMedDetalle}
        onClose={() => setOpenMedDetalle(false)}
        med={medSeleccionado}
        profesionalNombre={
          medSeleccionado ? profNombrePorId.get(medSeleccionado.profesionalId as any) ?? "—" : "—"
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
          <button onClick={() => setToast(null)} className="ml-2 text-lg font-bold">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

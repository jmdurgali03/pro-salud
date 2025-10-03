"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft, Calendar, IdCard, Mail, Phone, Stethoscope, User,
} from "lucide-react";

import SidebarPaciente from "../_components/SidebarPaciente";
import Section from "../_components/Section";
import DataItem from "../_components/DataItem";
import ConsultasTable from "../_components/ConsultasTable";
import DiagnosticosTable from "../_components/DiagnosticosTable";
import NuevaConsultaModal from "../_components/NuevaConsultaModal";
import NuevoDiagnosticoModal from "../_components/NuevoDiagnosticoModal";

export type PacienteExtendido = {
  _id: Id<"pacientes">;
  _creationTime: number;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  dni: string;
  fechaNacimiento?: string;
  creadoEn: number;
  actualizadoEn: number;
  obrasSociales: Id<"obrasSociales">[];
  obrasSocialesNombres: string[];
};

export default function HistorialPacientePage() {
  const { id } = useParams();
  const router = useRouter();
  const pacienteId = id as Id<"pacientes">;

  // Datos principales
  const paciente = useQuery(api.pacientes.getById, { id: pacienteId }) as PacienteExtendido | null;
  const observaciones = useQuery(api.observaciones.listarPorPaciente, { pacienteId }); // (si después lo mostrás)
  const consultas = useQuery(api.consultas.listarPorPaciente, { pacienteId });
  const diagnosticos = useQuery(api.diagnosticos.listarPorPaciente, { pacienteId });
  const profesionales = useQuery(api.profesionales.listar) ?? [];

  // Especialidades -> nombre
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const espNombrePorId = useMemo(() => {
    const m = new Map<Id<"especialidades">, string>();
    for (const e of especialidades) m.set(e._id, e.nombre);
    return m;
  }, [especialidades]);

  // Mutations
  const crearConsulta = useMutation(api.consultas.crear);
  const crearDiagnostico = useMutation(api.diagnosticos.crear);

  // Modales
  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);

  // scroll to resumen al entrar
  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!paciente) return <div className="p-8 text-gray-700">Cargando…</div>;

  // Handlers (solo llaman a las mutations)
  const submitConsulta = async (data: { motivo: string; profesional: string; notas?: string }) => {
    await crearConsulta({ pacienteId, ...data });
  };

  const submitDiagnostico = async (data: { descripcion: string; profesional: string }) => {
    await crearDiagnostico({ pacienteId, ...data } as any);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-6xl grid-cols-[220px,1fr] gap-6 p-6 sm:grid-cols-[240px,1fr] md:grid-cols-[260px,1fr]">
        {/* Sidebar */}
        <SidebarPaciente nombre={paciente.nombreCompleto} />

        {/* Main */}
        <main className="min-w-0 space-y-6">
          {/* Resumen */}
          <section
            ref={resumenRef}
            id="resumen"
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Historial Médico de {paciente.nombreCompleto}
                </h1>
                <p className="text-sm text-gray-500">Información básica del paciente</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/recepcionista/pacientes")}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>

                {/* Acciones rápidas */}
                <button
                  onClick={() => setOpenConsulta(true)}
                  className="inline-flex items-center gap-2 self-start rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
                >
                  Nueva consulta
                </button>
                <button
                  onClick={() => setOpenDx(true)}
                  className="inline-flex items-center gap-2 self-start rounded-lg bg-cyan-50 text-cyan-700 px-4 py-2 text-sm font-medium border border-cyan-200 hover:bg-cyan-100"
                >
                  Nuevo diagnóstico
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DataItem icon={<User className="h-4 w-4" />} label="Nombre completo" value={paciente.nombreCompleto} />
              <DataItem icon={<IdCard className="h-4 w-4" />} label="DNI" value={paciente.dni} />
              <DataItem icon={<Phone className="h-4 w-4" />} label="Teléfono" value={paciente.telefono ?? "—"} />
              <DataItem icon={<Mail className="h-4 w-4" />} label="Email" value={paciente.email ?? "—"} />
              <DataItem icon={<Stethoscope className="h-4 w-4" />} label="Obras sociales" value={paciente.obrasSocialesNombres?.join(", ") || "Particular"} />
              <DataItem icon={<Calendar className="h-4 w-4" />} label="Fecha de nacimiento" value={paciente.fechaNacimiento ?? "—"} />
            </div>
          </section>

          {/* Consultas */}
          <Section id="consultas" title="Consultas">
            <ConsultasTable data={consultas} />
          </Section>

          {/* Diagnósticos */}
          <Section id="diagnosticos" title="Diagnósticos">
            <DiagnosticosTable data={diagnosticos} />
          </Section>
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
        espNombrePorId={espNombrePorId}
      />
    </div>
  );
}

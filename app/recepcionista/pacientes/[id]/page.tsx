"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Calendar,
  IdCard,
  Mail,
  Phone,
  Stethoscope,
  User,
  Venus,
} from "lucide-react";

import SidebarPaciente from "@/components/pacientes/SidebarPaciente";;
import Section from "@/components/pacientes/Section";
import DataItem from "@/components/pacientes/DataItem";
import { PageWrapper } from "@/components/page-wrapper";

type PacienteExtendido = {
  _id: Id<"pacientes">;
  _creationTime: number;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  dni: string;
  fechaNacimiento?: string;
  genero?: "Masculino" | "Femenino";
  creadoEn: number;
  actualizadoEn: number;
  obrasSociales: Id<"obrasSociales">[];
  obrasSocialesNombres: string[];
};

export default function PacienteDatosSoloPage() {
  const { id } = useParams();
  const router = useRouter();
  const pacienteId = id as Id<"pacientes">;

  // Solo datos principales del paciente
  const paciente = useQuery(api.pacientes.getById, { id: pacienteId }) as PacienteExtendido | null;

  // (Opcional) si tenés especialidades para mostrar en algún lugar:
  // const especialidades = useQuery(api.especialidades.listar) ?? [];
  // const espNombrePorId = useMemo(() => {
  //   const m = new Map<Id<"especialidades">, string>();
  //   for (const e of especialidades) m.set(e._id, e.nombre);
  //   return m;
  // }, [especialidades]);

  // Scroll a resumen
  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!paciente) return <div className="p-8 text-gray-700">Cargando…</div>;

  return (
    <>
      <PageWrapper
        breadcrumbs={[
          { label: "Inicio", href: "/recepcionista" },
          { label: "Pacientes", href: "/recepcionista/pacientes" },
          { label: "Historial medico", href: `/recepcionista/pacientes/` },
        ]}
      >
        <div className="min-h-screen">
          <div className="mx-auto grid max-w-6xl grid-cols-[220px,1fr] gap-6 p-6 sm:grid-cols-[240px,1fr] md:grid-cols-[260px,1fr]">
            {/* Sidebar */}
            <SidebarPaciente nombre={paciente.nombre} apellido={paciente.apellido} />


            {/* Main */}
            <main className="min-w-0 space-y-6">
              {/* Resumen - SOLO DATOS */}
              <section
                ref={resumenRef}
                id="resumen"
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                      Historial Médico de {paciente.nombre} {paciente.apellido}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Esta vista no incluye la historia clínica.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push("/recepcionista/pacientes")}
                      className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </button>

                    {/* Botón para ir a la historia clínica (edición/altas) */}
                    <button
                      onClick={() => router.push(`/recepcionista/historias/${paciente._id}`)}
                      className="inline-flex items-center gap-2 self-start rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
                    >
                      Ver historia clínica
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DataItem
                    icon={<User className="h-4 w-4" />}
                    label="Nombre completo"
                    value={`${paciente.nombre} ${paciente.apellido}`}
                  />
                  <DataItem icon={<IdCard className="h-4 w-4" />} label="DNI" value={paciente.dni} />
                  <DataItem icon={<Venus className="h-4 w-4" />} label="Género" value={paciente.genero ?? "—"} />
                  <DataItem icon={<Phone className="h-4 w-4" />} label="Teléfono" value={paciente.telefono ?? "—"} />
                  <DataItem icon={<Mail className="h-4 w-4" />} label="Email" value={paciente.email ?? "—"} />
                  <DataItem icon={<Stethoscope className="h-4 w-4" />} label="Obras sociales" value={paciente.obrasSocialesNombres?.join(", ") || "Particular"} />
                  <DataItem icon={<Calendar className="h-4 w-4" />} label="Fecha de nacimiento" value={paciente.fechaNacimiento ?? "—"} />
                </div>
              </section>

              {/* Nada de consultas/diagnósticos aquí */}
            </main>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
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

import SidebarPaciente from "../../pacientes/_components/SidebarPaciente";
import Section from "../../pacientes/_components/Section";
import DataItem from "../../pacientes/_components/DataItem";
import ConsultasTable from "../../pacientes/_components/ConsultasTable";
import DiagnosticosTable from "../../pacientes/_components/DiagnosticosTable";
import NuevaConsultaModal from "../../pacientes/_components/NuevaConsultaModal";
import NuevoDiagnosticoModal from "../../pacientes/_components/NuevoDiagnosticoModal";
import NuevoTratamientoModal from "../../pacientes/_components/NuevoTratamientoModal";

/* -------------------- Tipos locales -------------------- */
type PacienteExtendido = {
  _id: Id<"pacientes">;
  _creationTime: number;
  nombreCompleto: string;
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

type ConsultaLite = {
  _id: Id<"consultas">;
  motivo: string;
  fecha: number;
  profesional: string; // lo usa ConsultasTable
};

type Tratamiento = {
  _id: Id<"tratamientos">;
  pacienteId: Id<"pacientes">;
  profesional: string;
  titulo: string;
  indicaciones?: string;
  fechaInicio: number;
  fechaFin?: number;
  estado: "Activo" | "Suspendido" | "Finalizado";
};
/* ------------------------------------------------------ */

export default function HistorialPacientePage() {
  const { id } = useParams();
  const router = useRouter();
  const pacienteId = id as Id<"pacientes">;

  // Datos principales
  const paciente = useQuery(api.pacientes.getById, { id: pacienteId }) as PacienteExtendido | null;

  const consultas = (useQuery(api.consultas.listarPorPaciente, { pacienteId }) ?? []) as ConsultaLite[];
  const diagnosticos = useQuery(api.diagnosticos.listarPorPaciente, { pacienteId }) ?? [];

  // Tratamientos
  const tratamientos = (useQuery(api.tratamientos.listarPorPaciente, { pacienteId }) ?? []) as Tratamiento[];
  const crearTratamiento = useMutation(api.tratamientos.crear);
  const cambiarEstadoTrat = useMutation(api.tratamientos.cambiarEstado);

  const profesionales = useQuery(api.profesionales.listar) ?? [];

  // Especialidades -> nombre
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const espNombrePorId = useMemo(() => {
    const m = new Map<Id<"especialidades">, string>();
    for (const e of especialidades) m.set(e._id, e.nombre);
    return m;
  }, [especialidades]);

  // Mutations consultas/diagnósticos
  const crearConsulta = useMutation(api.consultas.crear);
  const crearDiagnostico = useMutation(api.diagnosticos.crear);

  // Modales
  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);
  const [openTrat, setOpenTrat] = useState(false);

  // scroll to resumen al entrar
  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!paciente) return <div className="p-8 text-gray-700">Cargando…</div>;

  // Handlers
  const submitConsulta = async (data: { motivo: string; profesional: string; notas?: string }) => {
    await crearConsulta({ pacienteId, ...data });
    setOpenConsulta(false);
  };

  const submitDiagnostico = async (data: {
    consultaId: Id<"consultas">;
    descripcion: string;
    profesional: string;
    estado: "Presuntivo" | "Definitivo";
    fecha?: number;
  }) => {
    await crearDiagnostico({ pacienteId, ...data } as any);
    setOpenDx(false);
  };

  const submitTratamiento = async (data: {
    titulo: string;
    profesional: string;
    indicaciones?: string;
    fechaInicio?: number;
    fechaFin?: number;
  }) => {
    await crearTratamiento({ pacienteId, ...data } as any);
    setOpenTrat(false);
  };

  const hayConsultas = consultas && consultas.length > 0;

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
                  Historia clínica de {paciente.nombreCompleto}
                </h1>
                <p className="text-sm text-gray-500">Administrá consultas, diagnósticos y tratamientos.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/recepcionista/pacientes/${paciente._id}`)}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ver ficha del paciente
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
                  disabled={!hayConsultas}
                  title={hayConsultas ? "Crear diagnóstico" : "Primero registrá una consulta"}
                  className={`inline-flex items-center gap-2 self-start rounded-lg px-4 py-2 text-sm font-medium border ${
                    hayConsultas
                      ? "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  }`}
                >
                  Nuevo diagnóstico
                </button>
                <button
                  onClick={() => setOpenTrat(true)}
                  className="inline-flex items-center gap-2 self-start rounded-lg bg-cyan-50 text-cyan-700 px-4 py-2 text-sm font-medium border border-cyan-200 hover:bg-cyan-100"
                >
                  Asignar tratamiento
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DataItem icon={<User className="h-4 w-4" />} label="Nombre completo" value={paciente.nombreCompleto} />
              <DataItem icon={<IdCard className="h-4 w-4" />} label="DNI" value={paciente.dni} />
              <DataItem icon={<Venus className="h-4 w-4" />} label="Género" value={paciente.genero ?? "—"} />
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

          {/* Tratamientos */}
          <Section id="tratamientos" title="Tratamientos">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Título</th>
                    <th className="px-3 py-2 text-left">Profesional</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Inicio</th>
                    <th className="px-3 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tratamientos.map((t) => (
                    <tr key={t._id} className="border-t">
                      <td className="px-3 py-2">{t.titulo}</td>
                      <td className="px-3 py-2">{t.profesional}</td>
                      <td className="px-3 py-2">{t.estado}</td>
                      <td className="px-3 py-2">{new Date(t.fechaInicio).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        <select
                          className="rounded-md border border-gray-300 p-1 text-sm"
                          value={t.estado}
                          onChange={(e) =>
                            cambiarEstadoTrat({
                              id: t._id,
                              estado: e.target.value as Tratamiento["estado"],
                            })
                          }
                        >
                          <option value="Activo">Activo</option>
                          <option value="Suspendido">Suspendido</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {tratamientos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                        Sin tratamientos asignados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
        consultas={consultas}
      />

      <NuevoTratamientoModal
        open={openTrat}
        onClose={() => setOpenTrat(false)}
        onSubmit={submitTratamiento}
      />
    </div>
  );
}

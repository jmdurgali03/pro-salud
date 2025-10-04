"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  IdCard,
  Mail,
  Phone,
  Stethoscope,
  User,
  FileText,
  FlaskConical,
  Pill,
} from "lucide-react";
import Section from "../_components/Section";
import Table from "../_components/Table";
import DataItem from "../_components/DataItem";
import ConsultaModal from "../_components/ConsultaModal";
import DiagnosticoModal from "../_components/DiagnosticoModal";

export default function HistorialPacientePage() {
  const { id } = useParams();
  const router = useRouter();
  const pacienteId = id as Id<"pacientes">;

  const paciente = useQuery(api.pacientes.getById, { id: pacienteId });
  const consultas = useQuery(api.consultas.listarPorPaciente, { pacienteId });
  const crearConsulta = useMutation(api.consultas.crear);
  const diagnosticos = useQuery(api.diagnosticos.listarPorPaciente, { pacienteId });
  const crearDiagnostico = useMutation(api.diagnosticos.crear);
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];

  const espNombrePorId = useMemo(() => {
    const m = new Map<Id<"especialidades">, string>();
    for (const e of especialidades) m.set(e._id, e.nombre);
    return m;
  }, [especialidades]);

  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);

  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => resumenRef.current?.scrollIntoView({ block: "start" }), []);

  const formatoFecha = (fecha?: number) =>
    fecha
      ? new Date(fecha).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  if (!paciente) return <div className="p-8 text-gray-700">Cargando…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-6xl grid-cols-[220px,1fr] gap-6 p-6">
        {/* Sidebar */}
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-500">Paciente:</div>
            <div className="font-semibold text-gray-900">
              {paciente.nombre} {paciente.apellido}
            </div>
          </div>
          <nav className="space-y-1">
            <a href="#resumen" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FileText className="h-4 w-4" />Resumen
            </a>
            <a href="#consultas" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Stethoscope className="h-4 w-4" />Consultas
            </a>
            <a href="#diagnosticos" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FlaskConical className="h-4 w-4" />Diagnósticos
            </a>
            <a href="#tratamientos" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
              <Pill className="h-4 w-4" />Tratamientos
            </a>
          </nav>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          <Section id="resumen" title={`Historial de ${paciente.nombre} ${paciente.apellido}`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DataItem icon={<User />} label="Nombre" value={paciente.nombre} />
              <DataItem icon={<User />} label="Apellido" value={paciente.apellido} />
              <DataItem icon={<IdCard />} label="DNI" value={paciente.dni} />
              <DataItem icon={<Phone />} label="Teléfono" value={paciente.telefono ?? "—"} />
              <DataItem icon={<Mail />} label="Email" value={paciente.email ?? "—"} />
              <DataItem
                icon={<Stethoscope />}
                label="Obras Sociales"
                value={paciente.obrasSocialesNombres?.join(", ") || "Particular"}
              />
              <DataItem
                icon={<Calendar />}
                label="Nacimiento"
                value={paciente.fechaNacimiento ?? "—"}
              />
            </div>
          </Section>

          <Section
            id="consultas"
            title="Consultas"
            right={
              <button
                onClick={() => setOpenConsulta(true)}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
              >
                Agregar consulta
              </button>
            }
          >
            <Table headers={["Fecha", "Motivo", "Médico", "Notas"]}>
              {(consultas ?? []).map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3">{formatoFecha(c.fecha)}</td>
                  <td className="px-4 py-3 text-cyan-700">{c.motivo}</td>
                  <td className="px-4 py-3">{profesionales.find((p) => p._id === c.profesionalId)?.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{c.notas ?? "-"}</td>
                </tr>
              ))}
            </Table>
          </Section>

          <Section
            id="diagnosticos"
            title="Diagnósticos"
            right={
              <button
                onClick={() => setOpenDx(true)}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
              >
                Agregar diagnóstico
              </button>
            }
          >
            <Table headers={["Fecha", "Diagnóstico", "Médico"]}>
              {(diagnosticos ?? []).map((d) => (
                <tr key={d._id}>
                  <td className="px-4 py-3">{formatoFecha(d.fecha)}</td>
                  <td className="px-4 py-3 text-cyan-700">{d.descripcion}</td>
                  <td className="px-4 py-3">{profesionales.find((p) => p._id === d.profesionalId)?.nombre}</td>
                </tr>
              ))}
            </Table>
          </Section>
        </main>
      </div>

      {/* Modales */}
      <ConsultaModal
        open={openConsulta}
        onClose={() => setOpenConsulta(false)}
        onSubmit={(data) =>
          crearConsulta({
            pacienteId,
            
            ...data,
          })
        }
        profesionales={profesionales}
        espNombrePorId={espNombrePorId}
      />

      <DiagnosticoModal
        open={openDx}
        onClose={() => setOpenDx(false)}
        onSubmit={(data) =>
          crearDiagnostico({
            pacienteId,
            ...data,
            estado: "Presuntivo",
            consultaId: undefined as any,
          })
        }
        profesionales={profesionales}
        espNombrePorId={espNombrePorId}
      />
    </div>
  );
}

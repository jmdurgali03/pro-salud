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
  StickyNote,
} from "lucide-react";

/* --------------------------- UI helpers --------------------------- */
function Section({ id, title, children, right }: any) {
  return (
    <section id={id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

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

function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* Tarjetitas de datos con icono */
function DataItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="mt-0.5 text-gray-500">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-gray-900 break-words">
          {value ?? "—"}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Page ---------------------------- */
export default function HistorialPacientePage() {
  const { id } = useParams();
  const router = useRouter();
  const pacienteId = id as Id<"pacientes">;

  // Datos
  const paciente = useQuery(api.pacientes.getById, { id: pacienteId }) as PacienteExtendido | null;
  const observaciones = useQuery(api.observaciones.listarPorPaciente, { pacienteId });
  const consultas = useQuery(api.consultas.listarPorPaciente, { pacienteId });
  const crearConsulta = useMutation(api.consultas.crear);
  const diagnosticos = useQuery(api.diagnosticos.listarPorPaciente, { pacienteId });
  const crearDiagnostico = useMutation(api.diagnosticos.crear);
  const profesionales = useQuery(api.profesionales.listar) ?? [];

  // 👉 Traigo especialidades y armo diccionario Id<"especialidades"> -> nombre
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const espNombrePorId = useMemo(() => {
    const m = new Map<Id<"especialidades">, string>();
    for (const e of especialidades) m.set(e._id, e.nombre);
    return m;
  }, [especialidades]);

  // Modales
  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);

  // Formularios
  const [motivo, setMotivo] = useState("");
  const [profConsulta, setProfConsulta] = useState("");
  const [notas, setNotas] = useState("");
  const [dxDesc, setDxDesc] = useState("");
  const [dxProf, setDxProf] = useState("");

  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!paciente) return <div className="p-8 text-gray-700">Cargando…</div>;

  // Handlers
  const handleCrearConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim() || !profConsulta) return;
    await crearConsulta({
      pacienteId,
      motivo,
      profesional: profConsulta,
      notas: notas || undefined,
    });
    setMotivo("");
    setNotas("");
    setProfConsulta("");
    setOpenConsulta(false);
  };

  const handleCrearDiagnostico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dxDesc.trim() || !dxProf) return;
    await crearDiagnostico({ pacienteId, descripcion: dxDesc, profesional: dxProf } as any);
    setDxDesc("");
    setDxProf("");
    setOpenDx(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-6xl grid-cols-[220px,1fr] gap-6 p-6 sm:grid-cols-[240px,1fr] md:grid-cols-[260px,1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-500">Paciente:</div>
            <div className="font-semibold text-gray-900">{paciente.nombreCompleto}</div>
          </div>
          <nav className="space-y-1">
            <a href="#resumen" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FileText className="h-4 w-4" />Resumen
            </a>
            <a href="#consultas" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Stethoscope className="h-4 w-4" />Consultas
            </a>
            <a href="#diagnosticos" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FlaskConical className="h-4 w-4" />Diagnósticos
            </a>
            <a href="#tratamientos" className="pointer-events-none flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400">
              <Pill className="h-4 w-4" />Tratamientos
            </a>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 space-y-6">
          {/* Resumen */}
          <section ref={resumenRef} id="resumen" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
                  <ArrowLeft className="h-4 w-4" />Volver
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
            <Table headers={["Fecha", "Motivo", "Médico", "Notas"]}>
              {(consultas ?? []).map((c) => (
                <tr key={c._id} className="text-gray-800">
                  <td className="px-4 py-3">{new Date(c.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-cyan-700">{c.motivo}</td>
                  <td className="px-4 py-3">{c.profesional}</td>
                  <td className="px-4 py-3 text-gray-600">{c.notas ?? "-"}</td>
                </tr>
              ))}
              {(consultas?.length ?? 0) === 0 && (
                <tr><td className="px-4 py-4 text-gray-600" colSpan={4}>No hay consultas registradas.</td></tr>
              )}
            </Table>
          </Section>

          {/* Diagnósticos */}
          <Section id="diagnosticos" title="Diagnósticos">
            <Table headers={["Fecha", "Diagnóstico", "Médico"]}>
              {(diagnosticos ?? []).map((d) => (
                <tr key={d._id} className="text-gray-800">
                  <td className="px-4 py-3">{new Date(d.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-cyan-700">{d.descripcion}</td>
                  <td className="px-4 py-3">{d.profesional}</td>
                </tr>
              ))}
              {(diagnosticos?.length ?? 0) === 0 && (
                <tr><td className="px-4 py-4 text-gray-600" colSpan={3}>No hay diagnósticos registrados.</td></tr>
              )}
            </Table>
          </Section>
        </main>
      </div>

      {/* Modal: Nueva consulta */}
      <Modal open={openConsulta} onClose={() => setOpenConsulta(false)} title="Registrar consulta">
        <form onSubmit={handleCrearConsulta} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Motivo</label>
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-gray-900" placeholder="Motivo de la consulta" required />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-700">Profesional</label>
              <select value={profConsulta} onChange={(e) => setProfConsulta(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-gray-900">
                <option value="">Seleccione un profesional</option>
                {profesionales.map((p) => {
                  const espNombre = p.especialidadId ? espNombrePorId.get(p.especialidadId) : undefined;
                  return (
                    <option key={p._id} value={p.nombre}>
                      {p.nombre}{espNombre ? ` — ${espNombre}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">Notas (opcional)</label>
              <input value={notas} onChange={(e) => setNotas(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-gray-900" placeholder="Observaciones" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpenConsulta(false)} className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Nuevo diagnóstico */}
      <Modal open={openDx} onClose={() => setOpenDx(false)} title="Registrar diagnóstico">
        <form onSubmit={handleCrearDiagnostico} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Diagnóstico</label>
            <input value={dxDesc} onChange={(e) => setDxDesc(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-gray-900" placeholder="Descripción del diagnóstico" required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Profesional</label>
            <select value={dxProf} onChange={(e) => setDxProf(e.target.value)} className="w-full rounded-lg border border-gray-300 p-2 text-gray-900">
              <option value="">Seleccione un profesional</option>
              {profesionales.map((p) => {
                const espNombre = p.especialidadId ? espNombrePorId.get(p.especialidadId) : undefined;
                return (
                  <option key={p._id} value={p.nombre}>
                    {p.nombre}{espNombre ? ` — ${espNombre}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpenDx(false)} className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// app/recepcionista/historias/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft, Calendar, IdCard, Mail, Phone, Stethoscope, User, Venus,
} from "lucide-react";

// ⚠️ rutas relativas correctas (dos niveles hacia arriba)
import Section from "../../pacientes/_components/Section";
import DataItem from "../../pacientes/_components/DataItem";
import NuevaConsultaModal from "../../pacientes/_components/NuevaConsultaModal";
import NuevoDiagnosticoModal from "../../pacientes/_components/NuevoDiagnosticoModal";

type PacienteExtendido = {
  _id: Id<"pacientes">;
  nombreCompleto: string;
  dni: string;
  fechaNacimiento?: string;
  genero?: "Masculino" | "Femenino";
  telefono?: string;
  email?: string;
  obrasSocialesNombres?: string[];
};

export default function HistoriaClinicaPage() {
  const { id } = useParams();
  const router = useRouter();
  const pacienteId = id as Id<"pacientes">;

  const historia = useQuery(api.historiasClinicas.obtenerHistoriaCompleta, { pacienteId });
  const paciente = useQuery(api.pacientes.getById, { id: pacienteId }) as PacienteExtendido | null;

  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const espNombrePorId = useMemo(() => {
    const m = new Map<Id<"especialidades">, string>();
    for (const e of especialidades) m.set(e._id, e.nombre);
    return m;
  }, [especialidades]);

  const crearConsulta = useMutation(api.consultas.crear);
  const crearDiagnostico = useMutation(api.diagnosticos.crear);
  const crearNota = useMutation(api.observaciones.crear);

  const [openConsulta, setOpenConsulta] = useState(false);
  const [openDx, setOpenDx] = useState(false);
  const [nota, setNota] = useState("");

  const resumenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resumenRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!historia || !paciente) return <div className="p-8 text-gray-700">Cargando…</div>;

  const submitConsulta = async (data: { motivo: string; profesional: string; notas?: string }) => {
    await crearConsulta({ pacienteId, ...data });
    setOpenConsulta(false);
  };
  const submitDiagnostico = async (data: { descripcion: string; profesional: string }) => {
    await crearDiagnostico({ pacienteId, ...data } as any);
    setOpenDx(false);
  };
  const submitNota = async () => {
    if (!nota.trim()) return;
    await crearNota({ pacienteId, autor: "Sistema", texto: nota.trim() });
    setNota("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-6xl grid-cols-[220px,1fr] gap-6 p-6 sm:grid-cols-[240px,1fr] md:grid-cols-[260px,1fr]">

        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <button
            onClick={() => router.push("/recepcionista/historias")}
            className="w-full inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </button>
          <div className="mt-4 text-xs text-gray-500">Historia Clínica</div>
          <div className="mt-1 text-sm font-medium">{paciente.nombreCompleto}</div>
        </aside>

        <main className="min-w-0 space-y-6">
          <section ref={resumenRef} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Historia Clínica</h1>
                <p className="text-sm text-gray-500">Resumen del paciente</p>
              </div>
              <div className="flex gap-2">
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
              <DataItem icon={<Venus className="h-4 w-4" />} label="Género" value={paciente.genero ?? "—"} />
              <DataItem icon={<Phone className="h-4 w-4" />} label="Teléfono" value={paciente.telefono ?? "—"} />
              <DataItem icon={<Mail className="h-4 w-4" />} label="Email" value={paciente.email ?? "—"} />
              <DataItem icon={<Stethoscope className="h-4 w-4" />} label="Obras sociales" value={paciente.obrasSocialesNombres?.join(", ") || "Particular"} />
              <DataItem icon={<Calendar className="h-4 w-4" />} label="Fecha de nacimiento" value={paciente.fechaNacimiento ?? "—"} />
            </div>
          </section>

          {/* Consultas */}
          <Section id="consultas" title="Consultas">
            <div className="space-y-3">
              {historia.consultas.map((c: any) => (
                <div key={c._id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {new Date(c.fecha ?? c._creationTime).toLocaleString()} — {c.motivo}
                    </div>
                    <div className="text-sm text-gray-500">{c.profesional}</div>
                  </div>
                  {c.notas && <div className="mt-1 text-sm text-gray-700">{c.notas}</div>}
                </div>
              ))}
              {!historia.consultas.length && <div className="text-sm text-gray-500">Sin consultas.</div>}
            </div>
          </Section>

          {/* Diagnósticos */}
          <Section id="diagnosticos" title="Diagnósticos">
            <div className="space-y-3">
              {historia.diagnosticos.map((d: any) => (
                <div key={d._id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{d.descripcion}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(d.fecha ?? d._creationTime).toLocaleDateString()}
                    </div>
                  </div>
                  {d.profesional && <div className="text-xs text-gray-500 mt-1">{d.profesional}</div>}
                </div>
              ))}
              {!historia.diagnosticos.length && <div className="text-sm text-gray-500">Sin diagnósticos.</div>}
            </div>
          </Section>

          {/* Notas / Observaciones */}
          <Section id="notas" title="Notas médicas">
            <div className="mb-3 flex gap-2">
              <input
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Escribe una nota/observación…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={submitNota}
                className="rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-700"
              >
                Guardar
              </button>
            </div>
            <div className="space-y-3">
              {historia.observaciones.map((o: any) => (
                <div key={o._id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{o.texto}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(o.creadoEn ?? o._creationTime).toLocaleString()}
                    </div>
                  </div>
                  {o.autor && <div className="text-xs text-gray-500 mt-1">Autor: {o.autor}</div>}
                </div>
              ))}
              {!historia.observaciones.length && <div className="text-sm text-gray-500">Sin notas.</div>}
            </div>
          </Section>

          {/* Turnos */}
          <Section id="turnos" title="Turnos vinculados">
            <div className="space-y-3">
              {historia.turnos.map((t: any) => (
                <div key={t._id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.tipo ?? "Turno"}</div>
                    <div className="text-sm text-gray-500">
                      {t.start ? new Date(t.start).toLocaleString() : ""} · {t.estado}
                    </div>
                  </div>
                  {t.notas && <div className="text-sm text-gray-700 mt-1">{t.notas}</div>}
                </div>
              ))}
              {!historia.turnos.length && <div className="text-sm text-gray-500">Sin turnos.</div>}
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
      />
    </div>
  );
}

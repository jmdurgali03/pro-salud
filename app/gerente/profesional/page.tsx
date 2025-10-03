"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import ProfesionalModal from "./ProfesionalModal";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus } from "lucide-react";

export type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  apellido: string;
  dni: string;
  matricula: string;
  especialidadId: Id<"especialidades">;
  contacto: string;
  telefono: string;
  obrasSociales: Id<"obrasSociales">[];
  estado: "Activo" | "Inactivo";
};

export type ProfesionalInput = {
  nombre: string;
  apellido: string;
  especialidadId: Id<"especialidades">;
  contacto: string;
  telefono: string;
  obrasSociales: Id<"obrasSociales">[];
  estado: "Activo" | "Inactivo";
};

const mapReason = (r: string, fallback?: string) => {
  switch (r) {
    case "DNI_DUP": return "Ya existe un profesional con ese DNI.";
    case "MATRICULA_DUP": return "Ya existe un profesional con esa matrícula.";
    case "TELEFONO_DUP": return "Ya existe un profesional con ese teléfono.";
    case "BAD_INPUT": return fallback ?? "Datos inválidos.";
    case "NOT_FOUND": return "Registro no encontrado.";
    default: return "No se pudo completar la operación.";
  }
};

export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const crear = useMutation(api.profesionales.crear);
  const editar = useMutation(api.profesionales.editar);
  const eliminar = useMutation(api.profesionales.eliminar);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCrear = async (data: ProfesionalInput & { dni: string; matricula: string }) => {
    setSaving(true); setModalError(null);
    const res: any = await crear(data);
    if (!res?.ok) {
      setModalError(mapReason(res?.reason, res?.message));
    } else {
      setModalOpen(false);
      setToast(`Profesional creado. Usuario: ${res.usuario} | Contraseña: ${res.password}`);
    }
    setSaving(false);
  };

  const handleEditar = async (data: ProfesionalInput) => {
    if (!editando?._id) return;
    setSaving(true); setModalError(null);
    const res: any = await editar({ id: editando._id, ...data });
    if (!res?.ok) {
      setModalError(mapReason(res?.reason, res?.message));
    } else {
      setEditando(null);
      setToast("Profesional actualizado correctamente.");
    }
    setSaving(false);
  };

  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    const res: any = await eliminar({ id });
    if (res?.ok) setToast("Profesional eliminado.");
  };

  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "")
      .filter(Boolean);

  return (
    <PageWrapper breadcrumbs={[
      { label: "Inicio", href: "/gerente" },
      { label: "Profesionales", href: "/gerente/profesional" }
    ]}>
      <div className="w-full px-16 py-10 space-y-10">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Profesionales</h1>
          </div>
          <p className="text-gray-600 text-lg ml-5">
            Administra la información de todos los profesionales registrados
          </p>
        </div>

        {/* Buscador + botón */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, matrícula, especialidad u obra social..."
            className="flex-1 mr-4 px-5 py-3 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-base"
          />
          <button
            onClick={() => { setModalError(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 shadow text-base"
          >
            <Plus size={20} /> Nuevo Profesional
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow bg-white">
          <table className="w-full text-base text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-5 text-left min-w-[180px]">Nombre</th>
                <th className="p-5 text-left min-w-[180px]">Especialidad</th>
                <th className="p-5 text-left min-w-[220px]">Contacto</th>
                <th className="p-5 text-left min-w-[150px]">Teléfono</th>
                <th className="p-5 text-left min-w-[220px]">Obras Sociales</th>
                <th className="p-5 text-center min-w-[120px]">Estado</th>
                <th className="p-5 text-center min-w-[150px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.map((prof) => (
                <tr key={prof._id.toString()} className="border-t hover:bg-gray-50">
                  <td className="p-5 font-semibold">{prof.nombre}</td>
                  <td className="p-5">{getEspecialidadNombre(prof.especialidadId)}</td>
                  <td className="p-5">{prof.contacto}</td>
                  <td className="p-5">{prof.telefono}</td>
                  <td className="p-5 flex flex-wrap gap-2">
                    {getObrasSocialesNombres(prof.obrasSociales).map((os) => (
                      <span
                        key={os}
                        className="px-3 py-1 text-sm rounded-full bg-gray-100 border text-gray-700"
                      >
                        {os}
                      </span>
                    ))}
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        prof.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {prof.estado}
                    </span>
                  </td>
                  <td className="p-5 text-center space-x-4">
                    <button onClick={() => setViendo(prof)} className="text-green-600 hover:underline">Ver</button>
                    <button onClick={() => setEditando(prof)} className="text-blue-600 hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
              {profesionales.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400 italic">
                    No hay profesionales registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal crear */}
        {modalOpen && (
          <ProfesionalModal
            title="Nuevo Profesional"
            onSubmit={handleCrear as any}
            onCancel={() => setModalOpen(false)}
            errorText={modalError ?? undefined}
            loading={saving}
            onClientError={(m) => setModalError(m)}
          />
        )}

        {/* Modal editar */}
        {editando && (
          <ProfesionalModal
            title="Editar Profesional"
            initialData={editando}
            onSubmit={handleEditar}
            onCancel={() => setEditando(null)}
            errorText={modalError ?? undefined}
            loading={saving}
            onClientError={(m) => setModalError(m)}
          />
        )}

        {/* Modal ver */}
        {viendo && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white text-black rounded-lg shadow-xl p-6 w-[30rem] space-y-4">
              <h2 className="text-xl font-bold">Datos del Profesional</h2>
              <p><strong>Nombre:</strong> {viendo.nombre}</p>
              <p><strong>Apellido:</strong> {viendo.apellido}</p>
              <p><strong>DNI:</strong> {viendo.dni}</p>
              <p><strong>Matrícula:</strong> {viendo.matricula}</p>
              <p><strong>Especialidad:</strong> {especialidades.find(e => e._id === viendo.especialidadId)?.nombre || "—"}</p>
              <p><strong>Contacto:</strong> {viendo.contacto}</p>
              <p><strong>Teléfono:</strong> {viendo.telefono}</p>
              <p><strong>Obras Sociales:</strong> {getObrasSocialesNombres(viendo.obrasSociales).join(", ")}</p>
              <p><strong>Estado:</strong> {viendo.estado}</p>
              <div className="flex justify-end">
                <button onClick={() => setViendo(null)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[60] rounded-lg border px-4 py-3 shadow-lg max-w-sm bg-green-50 border-green-200 text-green-700">
            {toast}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

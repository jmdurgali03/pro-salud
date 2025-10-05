"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import ProfesionalModal from "./ProfesionalModal";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, CheckCircle2, ChevronLeft, ChevronRight, BriefcaseMedical, Search } from "lucide-react";

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

  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Ocultar el toast automáticamente
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Crear profesional
  const handleCrear = async (data: ProfesionalInput & { dni: string; matricula: string }) => {
    try {
      setSaving(true);
      setModalError(null);
      const res: any = await crear(data);
      if (!res?.ok) {
        setModalError(mapReason(res?.reason, res?.message));
        return;
      }
      setModalOpen(false);
      setToast("Profesional creado correctamente.");
    } catch {
      setModalError("Error al crear el profesional.");
    } finally {
      setSaving(false);
    }
  };

  // Editar profesional
  const handleEditar = async (data: ProfesionalInput) => {
    if (!editando?._id) return;
    try {
      setSaving(true);
      setModalError(null);
      const res: any = await editar({ id: editando._id, ...data });
      if (!res?.ok) {
        setModalError(mapReason(res?.reason, res?.message));
        return;
      }
      setEditando(null);
      setToast("Profesional actualizado correctamente.");
    } catch {
      setModalError("Error al actualizar el profesional.");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar profesional
  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    const res: any = await eliminar({ id });
    if (res?.ok) setToast("Profesional eliminado.");
  };

  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

  // Filtro del buscador
  const profesionalesFiltrados = useMemo(() => {
    const term = q.toLowerCase();
    return profesionales.filter((p) => {
      const especialidad = getEspecialidadNombre(p.especialidadId).toLowerCase();
      const obras = getObrasSocialesNombres(p.obrasSociales).join(" ").toLowerCase();
      return (
        p.nombre.toLowerCase().includes(term) ||
        p.apellido.toLowerCase().includes(term) ||
        p.dni.toLowerCase().includes(term) ||
        especialidad.includes(term) ||
        obras.includes(term)
      );
    });
  }, [q, profesionales, especialidades, obrasSociales]);

  // Paginación (8 por página para consistencia)
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(profesionalesFiltrados.length / itemsPerPage);

  const profesionalesPaginados = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return profesionalesFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [page, profesionalesFiltrados]);

  // Si borra el último y queda vacía, vuelve atrás
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Profesionales", href: "/gerente/profesional" },
      ]}
    >
      <div className="w-full px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BriefcaseMedical className="w-6 h-6 text-purple-500" />
            Gestión de Profesionales
          </h1>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, matrícula, especialidad u obra social..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-full outline-none text-sm"
          />
          <button
            onClick={() => {
              setModalError(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all whitespace-nowrap flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow bg-white">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Apellido</th>
                <th className="p-4 text-left">Especialidad</th>
                <th className="p-4 text-left">Contacto</th>
                <th className="p-4 text-left">Teléfono</th>
                <th className="p-4 text-left">Obras Sociales</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionalesPaginados.map((prof) => (
                <tr key={prof._id.toString()} className="border-t hover:bg-gray-50 transition-all">
                  <td className="p-4 font-medium">{prof.nombre}</td>
                  <td className="p-4 font-medium">{prof.apellido}</td>
                  <td className="p-4">{getEspecialidadNombre(prof.especialidadId)}</td>
                  <td className="p-4">{prof.contacto}</td>
                  <td className="p-4">{prof.telefono}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {getObrasSocialesNombres(prof.obrasSociales).map((os) => (
                        <span key={os} className="px-2 py-1 text-xs rounded-full bg-purple-50 border border-purple-200 text-purple-700">
                          {os}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${prof.estado === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {prof.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setViendo(prof)} className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline mr-3">Ver</button>
                    <button onClick={() => setEditando(prof)} className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
              {profesionalesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-400 italic text-sm">
                    No hay profesionales registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-4 text-sm">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={`px-3 py-1 rounded-md flex items-center gap-1 ${page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-3 py-1 rounded-md flex items-center gap-1 ${page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modales */}
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

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white bg-purple-600 border border-purple-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <p className="font-medium">{toast}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-white hover:text-purple-100 text-lg font-bold">×</button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
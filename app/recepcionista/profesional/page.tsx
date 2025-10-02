"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import ProfesionalModal from "./ProfesionalModal";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { MoreVertical, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";

export type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  dni: string;
  matricula: string;
  especialidadId: Id<"especialidades">;
  contacto: string;
  telefono: string;
  obrasSociales: Id<"obrasSociales">[];
  estado: "Activo" | "Inactivo";
  especialidadNombre?: string;
  obrasSocialesNombres?: string[];
};

export type ProfesionalInput = {
  nombre: string;
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

// Componente de menú de acciones
function ActionsMenu({ profesional, onVer, onEditar, isLast }: {
  profesional: Profesional;
  onVer: () => void;
  onEditar: () => void;
  isLast: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className={`absolute ${isLast ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10`}>
          <button
            onClick={() => {
              onVer();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver detalles
          </button>
          <button
            onClick={() => {
              onEditar();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const editar = useMutation(api.profesionales.editar);
  const eliminar = useMutation(api.profesionales.eliminar);

  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(profesionales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = profesionales.slice(startIndex, endIndex);

  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEditar = async (data: ProfesionalInput) => {
    if (!editando?._id) return;
    setSaving(true); setModalError(null);
    const res: any = await editar({ id: editando._id, ...data });
    if (!res?.ok) {
      setModalError(mapReason(res?.reason, res?.message));
    } else {
      setEditando(null);
    }
    setSaving(false);
  };

  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    await eliminar({ id });
  };

  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "")
      .filter(Boolean).join(", ");

  return (
    <PageWrapper breadcrumbs={[
      { label: "Inicio", href: "/recepcionista" },
      { label: "Profesionales", href: "/recepcionista/profesional" }
    ]}>
      <div className="w-full px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h1>
            <p className="text-gray-600 mt-1">Administra los profesionales de tu institución</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Obras Sociales
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((prof: Profesional, index: number) => {
                  const isLast = index === currentItems.length - 1 || index >= currentItems.length - 3;
                  return (
                    <tr key={prof._id.toString()} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{prof.nombre}</div>
                        <div className="text-xs text-gray-500">DNI: {prof.dni}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {getEspecialidadNombre(prof.especialidadId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{prof.contacto}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{prof.telefono}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate">
                          {getObrasSocialesNombres(prof.obrasSociales) || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${prof.estado === "Activo"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                          }`}>
                          {prof.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionsMenu
                          profesional={prof}
                          onVer={() => setViendo(prof)}
                          onEditar={() => setEditando(prof)}
                          isLast={isLast}
                        />
                      </td>
                    </tr>
                  );
                })}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <p className="text-lg font-medium">No hay profesionales registrados</p>
                        <p className="text-sm mt-1">Comienza agregando un nuevo profesional</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, profesionales.length)} de {profesionales.length} profesionales
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-10 px-3 rounded-lg font-medium text-sm transition-colors ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

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
          <ProfesionalModal
            title="Datos del Profesional"
            initialData={viendo}
            onSubmit={() => { }}
            onCancel={() => setViendo(null)}
            loading={false}
            viewMode={true}
            especialidades={especialidades}
            obrasSociales={obrasSociales}
          />
        )}
      </div>
    </PageWrapper>
  );
}
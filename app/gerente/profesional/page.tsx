"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import ProfesionalModal from "./ProfesionalModal";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, CheckCircle2, ChevronLeft, ChevronRight, BriefcaseMedical, Search, MoreHorizontal, ChevronDown, Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type SortOption = "reciente" | "antiguo" | "a-z" | "z-a";
type EstadoFilter = "todos" | "activo" | "inactivo";

export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const crear = useMutation(api.profesionales.crear);
  const editar = useMutation(api.profesionales.editar);
  const eliminar = useMutation(api.profesionales.eliminar);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("reciente");
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);
  const [eliminando, setEliminando] = useState<Profesional | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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

  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    const res: any = await eliminar({ id });
    if (res?.ok) {
      setToast("Profesional eliminado.");
      setEliminando(null);
    }
  };

  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

  // Filtrado y ordenamiento
  const profesionalesFiltrados = useMemo(() => {
    const term = q.toLowerCase();
    let filtered = profesionales.filter((p) => {
      const especialidad = getEspecialidadNombre(p.especialidadId).toLowerCase();
      const obras = getObrasSocialesNombres(p.obrasSociales).join(" ").toLowerCase();
      const matchesSearch =
        p.nombre.toLowerCase().includes(term) ||
        p.apellido.toLowerCase().includes(term) ||
        p.dni.toLowerCase().includes(term) ||
        especialidad.includes(term) ||
        obras.includes(term);

      const matchesEstado =
        estadoFilter === "todos" ||
        (estadoFilter === "activo" && p.estado === "Activo") ||
        (estadoFilter === "inactivo" && p.estado === "Inactivo");

      return matchesSearch && matchesEstado;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "reciente":
          return b._id.toString().localeCompare(a._id.toString());
        case "antiguo":
          return a._id.toString().localeCompare(b._id.toString());
        case "a-z":
          return `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`);
        case "z-a":
          return `${b.apellido} ${b.nombre}`.localeCompare(`${a.apellido} ${a.nombre}`);
        default:
          return 0;
      }
    });

    return filtered;
  }, [q, profesionales, especialidades, obrasSociales, sortBy, estadoFilter]);

  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(profesionalesFiltrados.length / itemsPerPage);

  const profesionalesPaginados = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return profesionalesFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [page, profesionalesFiltrados]);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BriefcaseMedical className="w-6 h-6 text-purple-500" />
              Gestión de Profesionales
            </h1>
          </div>
          <button
            onClick={() => {
              setModalError(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all whitespace-nowrap flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" /> Nuevo Profesional
          </button>
        </div>

        {/* Buscador y Filtros */}
        <div className="space-y-3">
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
          </div>

          <div className="flex items-center gap-3">
            {/* Ordenar por */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
              >
                <option value="reciente">Más reciente</option>
                <option value="antiguo">Más antiguo</option>
                <option value="a-z">A - Z</option>
                <option value="z-a">Z - A</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Estado */}
            <div className="relative">
              <select
                value={estadoFilter}
                onChange={(e) => {
                  setEstadoFilter(e.target.value as EstadoFilter);
                  setPage(1);
                }}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <span className="text-sm text-gray-500 ml-auto">
              {profesionalesFiltrados.length} resultado{profesionalesFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>
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
                <th className="p-4 text-center w-20">Acciones</th>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-gray-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setViendo(prof)} className="cursor-pointer">
                          <Eye className="w-4 h-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditando(prof)} className="cursor-pointer">
                          <Edit className="w-4 h-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEliminando(prof)}
                          className="cursor-pointer focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

        {/* Modal Crear */}
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

        {/* Modal Editar */}
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

        {/* Dialog Ver Detalles */}
        <Dialog open={!!viendo} onOpenChange={(open) => !open && setViendo(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="bg-blue-600 -mx-6 -mt-6 px-6 py-6 rounded-t-lg">
              <DialogTitle className="text-2xl font-bold text-white">
                Ver Profesional
              </DialogTitle>
            </DialogHeader>
            {viendo && (
              <div className="space-y-6 mt-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Nombre completo
                  </label>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                    {viendo.nombre} {viendo.apellido}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      DNI
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                      {viendo.dni}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Matrícula
                    </label>
                    <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                      {viendo.matricula}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Especialidad
                  </label>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                    {getEspecialidadNombre(viendo.especialidadId)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <span>🕐</span> Franjas horarias
                  </label>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 flex items-center gap-2">
                    <span>🕐</span> Lun—Vie 08:00 a 12:00, 16:00 a 20:00
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Correo electrónico
                  </label>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 break-all">
                    {viendo.contacto}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Teléfono
                  </label>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                    {viendo.telefono}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Obras Sociales
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getObrasSocialesNombres(viendo.obrasSociales).map((os) => (
                      <span
                        key={os}
                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 font-medium"
                      >
                        {os}
                      </span>
                    ))}
                    {viendo.obrasSociales.length === 0 && (
                      <span className="text-gray-400 italic text-sm">
                        Sin obras sociales asignadas
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setViendo(null)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Confirmar Eliminación */}
        <AlertDialog open={!!eliminando} onOpenChange={(open) => !open && setEliminando(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <AlertDialogTitle className="text-center">¿Eliminar profesional?</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {eliminando && (
                  <>
                    Esta acción eliminará permanentemente al profesional &quot;<strong>{eliminando.nombre} {eliminando.apellido}</strong>&quot;.
                    Los pacientes asociados no perderán su información, pero no tendrán cobertura asignada.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (eliminando) {
                    handleEliminar(eliminando._id);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white bg-purple-600 border border-purple-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <p className="font-medium">{toast}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-white hover:text-purple-100 text-lg font-bold">
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import ProfesionalModal from "./ProfesionalModal";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, CheckCircle2, ChevronLeft, ChevronRight, BriefcaseMedical, Search, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle, Filter as FilterIcon } from "lucide-react";
import { getObraSocialBadgeClass } from "@/components/pacientes/obra-social-badge";
import {
  Dialog,
  DialogContent,
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

// IMPORTACIÓN DEL NUEVO COMPONENTE DE FILTROS Y SUS TIPOS
import { FiltersPopover, EstadoFiltro, OrdenClave } from "@/components/FiltersPopover";

// Tipo auxiliar para ObraSocial que usa el componente FiltersPopover
export type ObraSocialOption = {
    _id: Id<"obrasSociales">;
    nombre: string;
};

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
  franjasHorarias?: { dia: number; inicio: string; fin: string }[];
};

export type ProfesionalInput = {
  nombre: string;
  apellido: string;
  especialidadId: Id<"especialidades">;
  contacto: string;
  telefono: string;
  obrasSociales: Id<"obrasSociales">[];
  estado: "Activo" | "Inactivo";
  franjasHorarias?: { dia: number; inicio: string; fin: string }[];
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
  const obrasSocialesQuery = useQuery(api.obrasSociales.listar);
  const obrasSociales = useMemo(
      () => (obrasSocialesQuery ?? []) as ObraSocialOption[],
      [obrasSocialesQuery]
  );

  const crear = useMutation(api.profesionales.crear);
  const editar = useMutation(api.profesionales.editar);

  const [q, setQ] = useState("");
  // NUEVOS ESTADOS PARA EL FILTRO POPUP
  const [filtroObras, setFiltroObras] = useState<Id<"obrasSociales">[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("Todos");
  const [orden, setOrden] = useState<OrdenClave>("reciente");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);
  const [desactivando, setDesactivando] = useState<Profesional | null>(null);
  const [activando, setActivando] = useState<Profesional | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Handlers para el Popover
  const toggleObraSocial = useCallback((id: Id<"obrasSociales">) => {
      setFiltroObras((current) =>
          current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
      );
  }, []);
  const clearObrasSociales = useCallback(() => setFiltroObras([]), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  
  // Paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  
  // Resetea la página al cambiar cualquier criterio de filtrado/ordenamiento
  useEffect(() => {
      setPage(1);
  }, [q, filtroObras, filtroEstado, orden]);


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

  const handleDesactivar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    const res: any = await editar({ id, estado: "Inactivo" } as any);
    if (res?.ok) {
      setToast("Profesional desactivado.");
      setDesactivando(null);
    }
  };

  const handleActivar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    const res: any = await editar({ id, estado: "Activo" } as any);
    if (res?.ok) {
      setToast("Profesional activado.");
      setActivando(null);
    }
  };

  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

  // Filtrado y ordenamiento (ACTUALIZADO para usar los nuevos estados)
  const profesionalesFiltrados = useMemo(() => {
    const term = q.toLowerCase();
    
    // Función de ayuda para obtener el nombre completo
    const getFullName = (p: Profesional) => `${p.apellido} ${p.nombre}`;
    // Función de ayuda para obtener el tiempo de creación (usado para ordenamiento)
    const getCreationTime = (p: Profesional) => (p as any)?._creationTime ?? 0;

    let filtered = profesionales.filter((p) => {
      const especialidad = getEspecialidadNombre(p.especialidadId).toLowerCase();
      const obras = getObrasSocialesNombres(p.obrasSociales).join(" ").toLowerCase();
      
      // 1. Filtro de Búsqueda de Texto
      const matchesSearch =
        p.nombre.toLowerCase().includes(term) ||
        p.apellido.toLowerCase().includes(term) ||
        p.dni.toLowerCase().includes(term) ||
        especialidad.includes(term) ||
        obras.includes(term);

      // 2. Filtro de Estado (usa filtroEstado)
      const matchesEstado =
        filtroEstado === "Todos" ||
        (filtroEstado === "Activo" && p.estado === "Activo") ||
        (filtroEstado === "Inactivo" && p.estado === "Inactivo");

      // 3. Filtro de Obras Sociales (usa filtroObras)
      const matchesObra =
        filtroObras.length === 0 || p.obrasSociales.some((id) => filtroObras.includes(id));

      return matchesSearch && matchesEstado && matchesObra;
    });

    // Ordenamiento (usa orden)
    filtered.sort((a, b) => {
      switch (orden) {
        case "alf-asc": // Alfabético A-Z
          return getFullName(a).toLocaleLowerCase().localeCompare(getFullName(b).toLocaleLowerCase(), "es");
        case "alf-desc": // Alfabético Z-A
          return getFullName(b).toLocaleLowerCase().localeCompare(getFullName(a).toLocaleLowerCase(), "es");
        case "reciente": // Más reciente (desc)
          return getCreationTime(b) - getCreationTime(a) || b._id.toString().localeCompare(a._id.toString());
        case "antiguo": // Más antiguo (asc)
          return getCreationTime(a) - getCreationTime(b) || a._id.toString().localeCompare(b._id.toString());
        default:
          return 0;
      }
    });

    return filtered;
  }, [q, profesionales, especialidades, obrasSociales, filtroObras, filtroEstado, orden]); // Dependencias Actualizadas

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
  
  // Contador de filtros activos para el badge del botón
  const filtrosActivosCount = useMemo(() =>
      (filtroObras.length > 0 ? 1 : 0) +
      (filtroEstado !== "Todos" ? 1 : 0) +
      (orden !== "reciente" ? 1 : 0),
      [filtroObras, filtroEstado, orden]
  );

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

        {/* Buscador, Filtros y Conteo (ACTUALIZADO: Filtro al lado del buscador) */}
        <div className="flex items-center gap-3">
            {/* Buscador de texto */}
            <div className="relative flex-1 min-w-[300px]">
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
            </div>

            {/* COMPONENTE FILTERSPOPOVER IMPLEMENTADO al lado del buscador */}
            <FiltersPopover
                obrasSociales={obrasSociales}
                selectedObras={filtroObras}
                onToggleObra={toggleObraSocial}
                onClearObras={clearObrasSociales}
                estado={filtroEstado}
                setEstado={setFiltroEstado}
                orden={orden}
                setOrden={setOrden}
                // No se necesita lógica adicional en el apply ya que los estados están vinculados
                onApply={() => { /* estados ya vinculados */ }}
                summaryCount={filtrosActivosCount}
                buttonLabel="Filtros"
            />
            {/* FIN COMPONENTE FILTERSPOPOVER */}

            {/* Se ELIMINA el contador de resultados aquí */}
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
                        <span key={os} className={getObraSocialBadgeClass(os)}>
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
                        {prof.estado === "Activo" ? (
                          <DropdownMenuItem
                            onClick={() => setDesactivando(prof)}
                            className="cursor-pointer focus:text-amber-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Desactivar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => setActivando(prof)}
                            className="cursor-pointer focus:text-emerald-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Activar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {profesionalesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-400 italic text-sm">
                    No hay profesionales registrados que coincidan con los criterios de búsqueda.
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

                {/* Nota: Asumo que franjasHorarias puede no estar en el tipo Profesional actual, 
                     pero si lo estuviera, este div debería usar el dato real */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Franjas horarias
                  </label>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 flex items-center gap-2">
                    {/* Placeholder si no hay dato real de franjas horarias */}
                    {viendo.franjasHorarias?.length ? "Horarios asignados" : "Sin horarios detallados en la tabla"}
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

        {/* Dialog Confirmar Desactivación */}
        <AlertDialog open={!!desactivando} onOpenChange={(open) => !open && setDesactivando(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <AlertDialogTitle className="text-center">¿Desactivar profesional?</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {desactivando && (
                  <>
                    Esto marcará como <strong>Inactivo</strong> a "{desactivando.nombre} {desactivando.apellido}".
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => desactivando && handleDesactivar(desactivando._id)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Desactivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog Confirmar Activación */}
        <AlertDialog open={!!activando} onOpenChange={(open) => !open && setActivando(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <AlertDialogTitle className="text-center">¿Activar profesional?</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {activando && (
                  <>
                    Esto marcará como <strong>Activo</strong> a "{activando.nombre} {activando.apellido}".
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => activando && handleActivar(activando._id)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Activar
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

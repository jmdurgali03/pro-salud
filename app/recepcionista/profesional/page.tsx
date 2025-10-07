"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Edit, CheckCircle2, AlertCircle, Search as SearchIcon } from "lucide-react";
// import ProfesionalModal y tipos
import ProfesionalModal from "./ProfesionalModal";
import { ObraSocialOption } from "./_components/profesional-search"; // Solo uso el tipo
import { getObraSocialBadgeClass } from "@/components/pacientes/obra-social-badge";

// Importación del nuevo componente y sus tipos
import { FiltersPopover, EstadoFiltro, OrdenClave } from "@/components/FiltersPopover";


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

// Se eliminan las definiciones de EstadoFiltro y OrdenClave ya que se importan
// desde el nuevo componente FiltersPopover.

/* =========================
   Utilidades comunes
========================= */
// useOnClickOutside fue movido a FiltersPopover.tsx

/* =========================
   Popover de Filtros Unificados
========================= */
// FiltersPopover fue movido a FiltersPopover.tsx

/* =========================
   Página
========================= */
export default function ProfesionalesPage() {
    const profesionales = useQuery(api.profesionales.listar) ?? [];
    const especialidades = useQuery(api.especialidades.listar) ?? [];
    const obrasSocialesQuery = useQuery(api.obrasSociales.listar);
    const obrasSociales = useMemo(
        () => (obrasSocialesQuery ?? []) as ObraSocialOption[],
        [obrasSocialesQuery]
    );
    const editar = useMutation(api.profesionales.editar);

    const [editando, setEditando] = useState<Profesional | null>(null);
    const [loadingModal, setLoadingModal] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    // Búsqueda
    const [busqueda, setBusqueda] = useState("");

    // Filtros (estado fuente de verdad)
    const [filtroObras, setFiltroObras] = useState<Id<"obrasSociales">[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("Todos");
    const [orden, setOrden] = useState<OrdenClave>("reciente");

    // Handlers obras sociales
    const toggleObraSocial = useCallback((id: Id<"obrasSociales">) => {
        setFiltroObras((current) =>
            current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
        );
    }, []);
    const clearObrasSociales = useCallback(() => setFiltroObras([]), []);

    // Reset de paginación al cambiar criterios
    const [page, setPage] = useState(1);
    useEffect(() => {
        setPage(1);
    }, [busqueda, filtroObras, filtroEstado, orden]);

    const getEspecialidadNombre = (id: Id<"especialidades">) =>
        especialidades.find((e) => e._id === id)?.nombre || "—";

    const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
        ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

    const getNombreCompleto = (p: Profesional) => `${p.apellido ?? ""} ${p.nombre ?? ""}`.trim();
    const getCreationTime = (p: Profesional) => (p as any)?._creationTime ?? 0;

    // Filtro combinado
    const filtrar = (prof: Profesional) => {
        const q = busqueda.toLowerCase();
        const especialidad =
            especialidades.find((e) => e._id === prof.especialidadId)?.nombre.toLowerCase() || "";
        const obras = prof.obrasSociales
            .map((id) => obrasSociales.find((o) => o._id === id)?.nombre.toLowerCase())
            .join(" ");

        const coincideTexto =
            prof.nombre.toLowerCase().includes(q) ||
            prof.apellido.toLowerCase().includes(q) ||
            prof.dni.toLowerCase().includes(q) ||
            especialidad.includes(q) ||
            obras.includes(q);

        const coincideObra =
            filtroObras.length === 0 || prof.obrasSociales.some((id) => filtroObras.includes(id));

        const coincideEstado = filtroEstado === "Todos" ? true : prof.estado === filtroEstado;

        return coincideTexto && coincideObra && coincideEstado;
    };

    // Orden
    const ordenar = (a: Profesional, b: Profesional) => {
        switch (orden) {
            case "alf-asc": {
                const na = getNombreCompleto(a).toLocaleLowerCase();
                const nb = getNombreCompleto(b).toLocaleLowerCase();
                return na.localeCompare(nb, "es");
            }
            case "alf-desc": {
                const na = getNombreCompleto(a).toLocaleLowerCase();
                const nb = getNombreCompleto(b).toLocaleLowerCase();
                return nb.localeCompare(na, "es");
            }
            case "reciente":
                return getCreationTime(b) - getCreationTime(a);
            case "antiguo":
                return getCreationTime(a) - getCreationTime(b);
            default:
                return 0;
        }
    };

    const filtrados = useMemo(
        () => profesionales.filter(filtrar).sort(ordenar),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [busqueda, filtroObras, filtroEstado, orden, profesionales, especialidades, obrasSociales]
    );

    const porPagina = 10;
    const totalPaginas = Math.ceil(filtrados.length / porPagina);
    const visibles = filtrados.slice((page - 1) * porPagina, page * porPagina);

    // Contador de filtros activos para el badge del botón
    const filtrosActivosCount =
        (filtroObras.length > 0 ? 1 : 0) +
        (filtroEstado !== "Todos" ? 1 : 0) +
        (orden !== "reciente" ? 1 : 0);

    return (
        <PageWrapper
            breadcrumbs={[
                { label: "Inicio", href: "/recepcionista" },
                { label: "Profesionales", href: "/recepcionista/profesional" },
            ]}
        >
            <div className="px-10 py-8 space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h1>
                        </div>
                        <p className="text-gray-600 text-sm ml-5">Administra los profesionales y sus horarios</p>
                    </div>
                </div>

                {/* Barra de búsqueda + ÚNICO botón de Filtros (reemplaza al antiguo) */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[280px]">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, DNI, especialidad u obra social…"
                            className="
                                w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200
                                text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300
                            "
                        />
                    </div>

                    <FiltersPopover
                        obrasSociales={obrasSociales}
                        selectedObras={filtroObras}
                        onToggleObra={toggleObraSocial}
                        onClearObras={clearObrasSociales}
                        estado={filtroEstado}
                        setEstado={setFiltroEstado}
                        orden={orden}
                        setOrden={setOrden}
                        onApply={() => {
                            /* estados ya vinculados */
                        }}
                        summaryCount={filtrosActivosCount}
                        buttonLabel="Filtros"
                    />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-gray-700">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-left">Nombre y Apellido</th>
                                <th className="p-4 text-left">Especialidad</th>
                                <th className="p-4 text-left">Contacto</th>
                                <th className="p-4 text-left">Obras Sociales</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.map((p) => (
                                <tr key={p._id.toString()} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4 font-semibold text-gray-900">{p.nombre} {p.apellido}</td>
                                    <td className="p-4">{getEspecialidadNombre(p.especialidadId)}</td>
                                    <td className="p-4">
                                        {p.contacto}
                                        <br />
                                        <span className="text-xs text-gray-500">{p.telefono}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {getObrasSocialesNombres(p.obrasSociales).map((os, i) => (
                                                <span key={i} className={getObraSocialBadgeClass(os)}>
                                                    {os}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                p.estado === "Activo"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => setEditando(p)}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {visibles.length === 0 && (
                                <tr>
                                    <td className="p-8 text-center text-gray-500" colSpan={6}>
                                        No se encontraron profesionales con los criterios seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {page} de {totalPaginas}
                        </span>
                        <button
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50"
                            onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                            disabled={page === totalPaginas}
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {editando && (
                    <ProfesionalModal
                        title="Editar Profesional"
                        initialData={editando}
                        onSubmit={async (data) => {
                            setLoadingModal(true);
                            try {
                                await editar({ id: editando._id, ...data });
                                setToast({ msg: "Profesional actualizado correctamente.", type: "success" });
                            } catch {
                                setToast({ msg: "Error al actualizar el profesional.", type: "error" });
                            }
                            setEditando(null);
                            setLoadingModal(false);
                        }}
                        onCancel={() => setEditando(null)}
                        loading={loadingModal}
                    />
                )}

                {toast && (
                    <div
                        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white border animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                            toast.type === "success"
                                ? "bg-emerald-600 border-emerald-400"
                                : "bg-red-600 border-red-400"
                        }`}
                    >
                        {toast.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
                        <p className="font-medium">{toast.msg}</p>
                        <button onClick={() => setToast(null)} className="ml-2 text-lg font-bold">×</button>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
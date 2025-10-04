"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Eye, Edit, ChevronLeft, ChevronRight, MoreHorizontal, Filter } from "lucide-react";
import ProfesionalModal from "./ProfesionalModal";
import { getObraSocialBadgeClass } from "../_components/obra-social-badge";

/* ---------------- Tipos ---------------- */
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

/* ---------------- Menu acciones ---------------- */
function ActionsMenu({ onVer, onEditar }: { onVer: () => void; onEditar: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow border border-gray-200 z-50">
          <button
            onClick={() => {
              onVer();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" /> Ver
          </button>
          <button
            onClick={() => {
              onEditar();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" /> Editar
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Página principal ---------------- */
export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const editar = useMutation(api.profesionales.editar);

  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);

  /* ---------------- Buscador y filtros ---------------- */
  const [busqueda, setBusqueda] = useState("");
  const [filtroObras, setFiltroObras] = useState<Id<"obrasSociales">[]>([]);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const filtroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target as Node)) setFiltrosOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
      filtroObras.length === 0 ||
      prof.obrasSociales.some((id) => filtroObras.includes(id));

    return coincideTexto && coincideObra;
  };

  const filtrados = useMemo(() => profesionales.filter(filtrar), [busqueda, filtroObras, profesionales]);

  /* ---------------- Paginación ---------------- */
  const [page, setPage] = useState(1);
  const porPagina = 10;
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const visibles = filtrados.slice((page - 1) * porPagina, page * porPagina);

  /* ---------------- Aux ---------------- */
  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";
  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

  /* ---------------- Render ---------------- */
  return (
    <PageWrapper breadcrumbs={[
      { label: "Inicio", href: "/recepcionista" },
      { label: "Profesionales", href: "/recepcionista/profesional" },
    ]}>
      <div className="px-10 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h1>
            </div>
            <p className="text-gray-600 text-sm ml-5">
              Administra los profesionales de tu institución
            </p>
          </div>

          {/* Buscador y filtro */}
          <div className="flex items-center gap-3 relative" ref={filtroRef}>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, DNI, especialidad u obra social..."
              className="w-80 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300 outline-none text-sm"
            />
            <button
              onClick={() => setFiltrosOpen(!filtrosOpen)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>

            {filtrosOpen && (
              <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50">
                <p className="text-sm font-semibold text-gray-700 mb-2">Filtrar por obras sociales</p>
                <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                  {obrasSociales.map((os) => (
                    <label
                      key={os._id}
                      className="flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={filtroObras.includes(os._id)}
                        onChange={() =>
                          setFiltroObras((prev) =>
                            prev.includes(os._id)
                              ? prev.filter((id) => id !== os._id)
                              : [...prev, os._id]
                          )
                        }
                        className="accent-purple-500"
                      />
                      <span>{os.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Nombre y Apellido</th>
                <th className="p-4 text-left">Especialidad</th>
                <th className="p-4 text-left">Contacto</th>
                <th className="p-4 text-left">Teléfono</th>
                <th className="p-4 text-left">Obras Sociales</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p._id.toString()} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{p.nombre} {p.apellido}</td>
                  <td className="p-4">{getEspecialidadNombre(p.especialidadId)}</td>
                  <td className="p-4">{p.contacto}</td>
                  <td className="p-4">{p.telefono}</td>
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
                    <ActionsMenu
                      onVer={() => setViendo(p)}
                      onEditar={() => setEditando(p)}
                    />
                  </td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 italic">
                    No se encontraron profesionales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPaginas}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page === totalPaginas}
              className="p-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modales */}
        {editando && (
          <ProfesionalModal
            title="Editar Profesional"
            initialData={editando}
            onSubmit={() => setEditando(null)}
            onCancel={() => setEditando(null)}
            loading={false}
          />
        )}

        {viendo && (
          <ProfesionalModal
            title="Ver Profesional"
            initialData={viendo}
            viewMode
            onSubmit={() => {}}
            onCancel={() => setViendo(null)}
            loading={false}
          />
        )}
      </div>
    </PageWrapper>
  );
}

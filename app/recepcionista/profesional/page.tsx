"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import {
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import ProfesionalModal from "./ProfesionalModal";
import { ProfesionalSearchBar, ObraSocialOption } from "./_components/profesional-search";
import { getObraSocialBadgeClass } from "@/components/pacientes/obra-social-badge";

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

  // ✅ Nuevo campo opcional para las franjas horarias
  franjasHorarias?: {
    dia: number;      // 0–6 (domingo a sábado)
    inicio: string;   // "08:00"
    fin: string;      // "12:00"
  }[];
};


/* ---------------- Página principal ---------------- */
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
  const [viendo, setViendo] = useState<Profesional | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  /* ---------------- Buscador y filtros ---------------- */
  const [busqueda, setBusqueda] = useState("");
  const [filtroObras, setFiltroObras] = useState<Id<"obrasSociales">[]>([]);

  const toggleObraSocial = useCallback((id: Id<"obrasSociales">) => {
    setFiltroObras((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }, []);

  const clearObrasSociales = useCallback(() => setFiltroObras([]), []);

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

  const filtrados = useMemo(
    () => profesionales.filter(filtrar),
    [busqueda, filtroObras, profesionales, especialidades, obrasSociales]
  );

  /* ---------------- Paginación ---------------- */
  const [page, setPage] = useState(1);
  const porPagina = 10;
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const visibles = filtrados.slice((page - 1) * porPagina, page * porPagina);

  /* ---------------- Auxiliares ---------------- */
  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

  const getResumenHorarios = (franjas?: Profesional["franjasHorarias"]) => {
    if (!franjas || franjas.length === 0) return "—";
    const porRango: Record<string, number[]> = {};
    franjas.forEach((f) => {
      const key = `${f.inicio}-${f.fin}`;
      if (!porRango[key]) porRango[key] = [];
      porRango[key].push(f.dia);
    });
    return Object.entries(porRango)
      .map(([rango, dias]) => `${resumenDias(dias)} ${rango.replace("-", " a ")}`)
      .join(", ");
  };

  const resumenDias = (dias: number[]) => {
    const map = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    if (dias.length === 7) return "Todos los días";
    if (JSON.stringify(dias) === JSON.stringify([1, 2, 3, 4, 5])) return "Lun–Vie";
    return dias.map((d) => map[d]).join(", ");
  };

  /* ---------------- Render ---------------- */
  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/recepcionista" },
        { label: "Profesionales", href: "/recepcionista/profesional" },
      ]}
    >
      <div className="px-10 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Profesionales
              </h1>
            </div>
            <p className="text-gray-600 text-sm ml-5">
              Administra los profesionales de tu institución y sus horarios
            </p>
          </div>
        </div>

        {/* Buscador y filtro */}
        <ProfesionalSearchBar
          value={busqueda}
          onChange={setBusqueda}
          isLoading={profesionales === undefined}
          obrasSociales={obrasSociales}
          selectedObrasSociales={filtroObras}
          onToggleObraSocial={toggleObraSocial}
          onClearObrasSociales={clearObrasSociales}
          isLoadingObrasSociales={obrasSocialesQuery === undefined}
        />

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left">Nombre y Apellido</th>
                <th className="p-4 text-left">Especialidad</th>
                <th className="p-4 text-left">Contacto</th>
                <th className="p-4 text-left">Obras Sociales</th>
                <th className="p-4 text-left">Horarios</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p._id.toString()} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold text-gray-900">
                    {p.nombre} {p.apellido}
                  </td>
                  <td className="p-4">{getEspecialidadNombre(p.especialidadId)}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{p.contacto}</span>
                      <span className="text-xs text-gray-500">{p.telefono}</span>
                    </div>
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
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{getResumenHorarios(p.franjasHorarias)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${p.estado === "Activo"
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
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-400 italic"
                  >
                    No se encontraron profesionales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPaginas}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page === totalPaginas}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
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
            onSubmit={async (datosActualizados) => {
              setLoadingModal(true);

              // 🔹 Desestructuramos las franjas que vienen del formulario
              const { franjasHorarias, ...resto } = datosActualizados;



              // 🔹 Mandamos TODO al backend, incluyendo las franjas
              const resp = await editar({
                id: editando._id,
                ...resto,
                franjasHorarias, // ✅ AHORA SÍ se envían al backend
              });



              setLoadingModal(false);
              setEditando(null);
            }}
            onCancel={() => setEditando(null)}
            loading={loadingModal}
          />
        )}



        {viendo && (
          <ProfesionalModal
            title="Ver Profesional"
            initialData={viendo}
            viewMode
            onSubmit={() => { }}
            onCancel={() => setViendo(null)}
            loading={false}
          />
        )}
      </div>
    </PageWrapper>
  );
}

/* ---------------- Menu acciones ---------------- */
function ActionsMenu({ onVer, onEditar }: { onVer: () => void; onEditar: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerAction = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Acciones"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>

      {open && buttonRef.current && (
        <div
          ref={menuRef}
          className="fixed w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
          style={{
            top:
              buttonRef.current.getBoundingClientRect().bottom + 4,
            right:
              window.innerWidth -
              buttonRef.current.getBoundingClientRect().right,
          }}
        >
          <button
            onClick={() => triggerAction(onVer)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver profesional
          </button>
          <button
            onClick={() => triggerAction(onEditar)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar datos
          </button>
        </div>
      )}
    </div>
  );
}

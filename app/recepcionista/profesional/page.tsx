"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Eye, Edit, ChevronLeft, ChevronRight, MoreHorizontal, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import ProfesionalModal from "./ProfesionalModal";
import { ProfesionalSearchBar, ObraSocialOption } from "./_components/profesional-search";
import { getObraSocialBadgeClass } from "@/components/pacientes/obra-social-badge";

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

export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSocialesQuery = useQuery(api.obrasSociales.listar);
  const obrasSociales = useMemo(() => (obrasSocialesQuery ?? []) as ObraSocialOption[], [obrasSocialesQuery]);
  const editar = useMutation(api.profesionales.editar);

  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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
    const coincideObra = filtroObras.length === 0 || prof.obrasSociales.some((id) => filtroObras.includes(id));
    return coincideTexto && coincideObra;
  };

  const filtrados = useMemo(() => profesionales.filter(filtrar), [busqueda, filtroObras, profesionales, especialidades, obrasSociales]);
  const [page, setPage] = useState(1);
  const porPagina = 10;
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const visibles = filtrados.slice((page - 1) * porPagina, page * porPagina);

  const getEspecialidadNombre = (id: Id<"especialidades">) => especialidades.find((e) => e._id === id)?.nombre || "—";
  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

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
                  <td className="p-4">{p.contacto}<br /><span className="text-xs text-gray-500">{p.telefono}</span></td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {getObrasSocialesNombres(p.obrasSociales).map((os, i) => (
                        <span key={i} className={getObraSocialBadgeClass(os)}>{os}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.estado}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => setEditando(p)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

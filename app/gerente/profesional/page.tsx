"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import ProfesionalModal from "./ProfesionalModal";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

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

  // ✅ Ocultar el toast después de unos segundos
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ✅ Crear profesional
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
    } catch (e) {
      setModalError("Error al crear el profesional.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Editar profesional
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

  // ✅ Eliminar profesional
  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    const res: any = await eliminar({ id });
    if (res?.ok) setToast("Profesional eliminado.");
  };

  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean);

  // 🔍 Filtro del buscador
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

  // 📄 Paginación (7 por página)
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(profesionalesFiltrados.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const profesionalesPaginados = profesionalesFiltrados.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [totalPages]);

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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 mr-4 px-5 py-3 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-green-500 outline-none text-base"
          />
          <button
            onClick={() => {
              setModalError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 shadow text-base transition-all duration-300"
          >
            <Plus size={20} /> Nuevo Profesional
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow bg-white transition-all duration-300">
          <table className="w-full text-base text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-5 text-left">Nombre</th>
                <th className="p-5 text-left">Apellido</th>
                <th className="p-5 text-left">Especialidad</th>
                <th className="p-5 text-left">Contacto</th>
                <th className="p-5 text-left">Teléfono</th>
                <th className="p-5 text-left">Obras Sociales</th>
                <th className="p-5 text-center">Estado</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionalesPaginados.map((prof) => (
                <tr key={prof._id.toString()} className="border-t hover:bg-gray-50 transition-all">
                  <td className="p-5 font-semibold">{prof.nombre}</td>
                  <td className="p-5 font-semibold">{prof.apellido}</td>
                  <td className="p-5">{getEspecialidadNombre(prof.especialidadId)}</td>
                  <td className="p-5">{prof.contacto}</td>
                  <td className="p-5">{prof.telefono}</td>
                  <td className="p-5 flex flex-wrap gap-2">
                    {getObrasSocialesNombres(prof.obrasSociales).map((os) => (
                      <span key={os} className="px-3 py-1 text-sm rounded-full bg-gray-100 border text-gray-700">
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
              {profesionalesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-400 italic">
                    No hay profesionales registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 📑 Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              Página <span className="font-semibold text-gray-900">{page}</span> de {totalPages}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                page === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* 🧩 Modal crear */}
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

        {/* 🧩 Modal editar */}
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

        {/* ✅ Toast visible */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3
                          rounded-xl border border-green-300 bg-gradient-to-r from-green-50 to-green-100
                          px-6 py-4 shadow-2xl shadow-green-200/50 text-green-800
                          animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-[350px] max-w-md">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
            <div className="flex-1">
              <p className="text-base font-semibold">¡Operación exitosa!</p>
              <p className="text-sm">{toast}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-green-600 hover:text-green-800 text-lg font-bold">×</button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

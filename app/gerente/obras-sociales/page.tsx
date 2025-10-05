"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, Edit, Trash, Search, CheckCircle2, XCircle, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

type ObraSocial = {
  _id: Id<"obrasSociales">;
  nombre: string;
};

export default function ObrasSocialesPage() {
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];
  const crear = useMutation(api.obrasSociales.crear);
  const editar = useMutation(api.obrasSociales.editar);
  const eliminar = useMutation(api.obrasSociales.eliminar);

  const [busqueda, setBusqueda] = useState("");
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState<ObraSocial | null>(null);
  const [toast, setToast] = useState<{ tipo: "success" | "error"; mensaje: string } | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<Id<"obrasSociales"> | null>(null);

  // 🔍 Filtro
  const obrasFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return obrasSociales.filter((os) => os.nombre.toLowerCase().includes(term));
  }, [busqueda, obrasSociales]);

  // 🔢 PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 6;
  const totalPaginas = Math.ceil(obrasFiltradas.length / porPagina);

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const obrasPagina = useMemo(() => {
    const start = (paginaActual - 1) * porPagina;
    return obrasFiltradas.slice(start, start + porPagina);
  }, [paginaActual, obrasFiltradas]);

  const siguientePagina = () => paginaActual < totalPaginas && setPaginaActual(paginaActual + 1);
  const anteriorPagina = () => paginaActual > 1 && setPaginaActual(paginaActual - 1);

  // ➕ Crear
  const handleCrear = async () => {
    if (!nueva.trim()) return;
    try {
      const existe = obrasSociales.some(
        (os) => os.nombre.toLowerCase() === nueva.trim().toLowerCase()
      );
      if (existe) {
        setToast({ tipo: "error", mensaje: "Ya existe una obra social con ese nombre." });
        return;
      }
      await crear({ nombre: nueva.trim() });
      setNueva("");
      setToast({ tipo: "success", mensaje: "Obra social creada correctamente." });
    } catch (err: any) {
      setToast({ tipo: "error", mensaje: "Error al crear la obra social." });
    }
  };

  // ✏️ Editar
  const handleEditar = async () => {
    if (!editando) return;
    try {
      await editar({ id: editando._id, nombre: editando.nombre.trim() });
      setEditando(null);
      setToast({ tipo: "success", mensaje: "Obra social actualizada correctamente." });
    } catch (err: any) {
      setToast({ tipo: "error", mensaje: "Error al editar la obra social." });
    }
  };

  // 🗑️ Confirmar eliminación
  const handleEliminarConfirmado = async () => {
    if (!confirmarEliminar) return;
    try {
      await eliminar({ id: confirmarEliminar });
      setToast({ tipo: "success", mensaje: "Obra social eliminada correctamente." });
    } catch (err: any) {
      setToast({ tipo: "error", mensaje: "Error al eliminar la obra social." });
    } finally {
      setConfirmarEliminar(null);
    }
  };

  // 🧹 Auto ocultar toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Obras Sociales", href: "/gerente/obras-sociales" },
      ]}
    >
      <div className="w-full px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-sky-500 to-blue-500 rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Obras Sociales</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Nueva obra social..."
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCrear}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} /> Agregar
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Buscar obra social..."
            className="w-full outline-none text-sm"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow bg-white">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-center w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {obrasPagina.map((os) => (
                <tr key={os._id.toString()} className="border-t hover:bg-gray-50 transition-all">
                  <td className="p-4">
                    {editando?._id === os._id ? (
                      <input
                        value={editando.nombre}
                        onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                        className="border rounded-lg px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      os.nombre
                    )}
                  </td>
                  <td className="p-4 text-center flex items-center justify-center gap-3">
                    {editando?._id === os._id ? (
                      <button
                        onClick={handleEditar}
                        className="text-green-600 font-medium hover:underline"
                      >
                        Guardar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditando(os)}
                          className="text-blue-600 font-medium hover:underline"
                        >
                          <Edit size={16} className="inline mr-1" /> Editar
                        </button>
                        <button
                          onClick={() => setConfirmarEliminar(os._id)}
                          className="text-red-600 font-medium hover:underline"
                        >
                          <Trash size={16} className="inline mr-1" /> Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {obrasPagina.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-gray-400 italic">
                    No hay obras sociales registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔸 Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={anteriorPagina}
              disabled={paginaActual === 1}
              className={`px-4 py-2 border rounded-lg transition ${
                paginaActual === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="text-gray-600">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={siguientePagina}
              disabled={paginaActual === totalPaginas}
              className={`px-4 py-2 border rounded-lg transition ${
                paginaActual === totalPaginas
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* 🔔 Confirmación de eliminación */}
        {confirmarEliminar && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm">
              <AlertTriangle className="mx-auto text-red-500 mb-4 w-10 h-10" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                ¿Eliminar obra social?
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmarEliminar(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarConfirmado}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🧾 Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg text-white animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              toast.tipo === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.tipo === "success" ? <CheckCircle2 /> : <XCircle />}
            <p className="font-medium">{toast.mensaje}</p>
            <button onClick={() => setToast(null)} className="ml-2 text-white text-lg">
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

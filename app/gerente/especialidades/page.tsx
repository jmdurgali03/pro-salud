"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, Edit, Trash, Search, CheckCircle2 } from "lucide-react";

type Especialidad = {
  _id: Id<"especialidades">;
  nombre: string;
};

export default function EspecialidadesPage() {
  const especialidades = useQuery(api.especialidades.listar, {}) ?? [];
  const crear = useMutation(api.especialidades.crear);
  const editar = useMutation(api.especialidades.editar);
  const eliminar = useMutation(api.especialidades.eliminar);

  const [busqueda, setBusqueda] = useState("");
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState<Especialidad | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 🔍 Filtrar especialidades por búsqueda
  const especialidadesFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return especialidades.filter((e) => e.nombre.toLowerCase().includes(term));
  }, [busqueda, especialidades]);

  // 🔢 PAGINACIÓN: mostrar solo 6 especialidades por página
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 6;
  const totalPaginas = Math.ceil(especialidadesFiltradas.length / porPagina);

  const especialidadesPagina = useMemo(() => {
    const start = (paginaActual - 1) * porPagina;
    return especialidadesFiltradas.slice(start, start + porPagina);
  }, [paginaActual, especialidadesFiltradas]);

  const siguientePagina = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const anteriorPagina = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  // ✅ Evita quedar atrapado en una página vacía después de eliminar
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  // ➕ Crear nueva especialidad
  const handleCrear = async () => {
    if (!nueva.trim()) return;
    await crear({ nombre: nueva.trim() });
    setNueva("");
    setToast("Especialidad creada correctamente.");
  };

  // ✏️ Guardar edición
  const handleEditar = async () => {
    if (!editando) return;
    await editar({ id: editando._id, nombre: editando.nombre.trim() });
    setEditando(null);
    setToast("Especialidad actualizada correctamente.");
  };

  // 🗑️ Eliminar especialidad
  const handleEliminar = async (id: Id<"especialidades">) => {
    await eliminar({ id });
    setToast("Especialidad eliminada correctamente.");
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Especialidades", href: "/gerente/especialidades" },
      ]}
    >
      <div className="w-full px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Especialidades Médicas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Nueva especialidad..."
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleCrear}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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
              setPaginaActual(1); // resetear a la página 1 al buscar
            }}
            placeholder="Buscar especialidad..."
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
              {especialidadesPagina.map((esp) => (
                <tr
                  key={esp._id.toString()}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-4">
                    {editando?._id === esp._id ? (
                      <input
                        value={editando.nombre}
                        onChange={(e) =>
                          setEditando({ ...editando, nombre: e.target.value })
                        }
                        className="border rounded-lg px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      esp.nombre
                    )}
                  </td>
                  <td className="p-4 text-center flex items-center justify-center gap-3">
                    {editando?._id === esp._id ? (
                      <button
                        onClick={handleEditar}
                        className="text-green-600 font-medium hover:underline"
                      >
                        Guardar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditando(esp)}
                          className="text-blue-600 font-medium hover:underline"
                        >
                          <Edit size={16} className="inline mr-1" /> Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(esp._id)}
                          className="text-red-600 font-medium hover:underline"
                        >
                          <Trash size={16} className="inline mr-1" /> Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {especialidadesPagina.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center text-gray-400 italic"
                  >
                    No hay especialidades registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔸 Controles de paginación */}
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
              ← Anterior
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
              Siguiente →
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 shadow-lg text-indigo-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-3 text-indigo-500 hover:text-indigo-700 text-lg"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

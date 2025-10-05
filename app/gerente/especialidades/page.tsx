"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, Edit, Trash, Search, CheckCircle2, Stethoscope } from "lucide-react";

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

  // Filtrar especialidades por búsqueda
  const especialidadesFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return especialidades.filter((e) => e.nombre.toLowerCase().includes(term));
  }, [busqueda, especialidades]);

  // Paginación: mostrar 8 especialidades por página (consistente con otras páginas)
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 8;
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

  // Evita quedar atrapado en una página vacía después de eliminar
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  // Ocultar toast automáticamente
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Crear nueva especialidad
  const handleCrear = async () => {
    if (!nueva.trim()) return;
    await crear({ nombre: nueva.trim() });
    setNueva("");
    setToast("Especialidad creada correctamente.");
  };

  // Guardar edición
  const handleEditar = async () => {
    if (!editando) return;
    await editar({ id: editando._id, nombre: editando.nombre.trim() });
    setEditando(null);
    setToast("Especialidad actualizada correctamente.");
  };

  // Eliminar especialidad
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
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-500" />
            Gestión de Especialidades Médicas
          </h1>
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
            placeholder="Buscar especialidad..."
            className="w-full outline-none text-sm"
          />
          <div className="flex items-center gap-2 border-l pl-3">
            <input
              type="text"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Nueva especialidad..."
              className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button
              onClick={handleCrear}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
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
                        className="border border-teal-300 rounded-lg px-3 py-1 w-full text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    ) : (
                      <span className="font-medium">{esp.nombre}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {editando?._id === esp._id ? (
                        <>
                          <button
                            onClick={handleEditar}
                            className="text-green-600 text-sm font-medium hover:underline"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditando(null)}
                            className="text-gray-600 text-sm font-medium hover:underline"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditando(esp)}
                            className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" /> Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(esp._id)}
                            className="text-red-600 text-sm font-medium hover:underline flex items-center gap-1"
                          >
                            <Trash className="w-4 h-4" /> Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {especialidadesPagina.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center text-gray-400 italic text-sm"
                  >
                    No hay especialidades registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-3 py-4 text-sm">
              <button
                onClick={anteriorPagina}
                disabled={paginaActual === 1}
                className={`px-3 py-1 rounded-md ${paginaActual === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                Anterior
              </button>
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={siguientePagina}
                disabled={paginaActual === totalPaginas}
                className={`px-3 py-1 rounded-md ${paginaActual === totalPaginas
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white bg-green-600 border border-green-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <p className="font-medium">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-green-100 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
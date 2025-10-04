"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, Edit, Trash, Search, CheckCircle2 } from "lucide-react";

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
  const [toast, setToast] = useState<string | null>(null);

  const obrasFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return obrasSociales.filter((os) => os.nombre.toLowerCase().includes(term));
  }, [busqueda, obrasSociales]);

  const handleCrear = async () => {
    if (!nueva.trim()) return;
    try {
      await crear({ nombre: nueva.trim() });
      setNueva("");
      setToast("Obra social creada correctamente.");
    } catch (err: any) {
      setToast("⚠️ Error al crear: " + err.message);
    }
  };

  const handleEditar = async () => {
  if (!editando) return;
  try {
    await editar({ id: editando._id, nombre: editando.nombre.trim() });
    setEditando(null);
    setToast("Obra social actualizada correctamente.");
  } catch (err: any) {
    console.error("Error al editar:", err);
    setToast("⚠️ Error al editar: " + err.message);
  }
};


  const handleEliminar = async (id: Id<"obrasSociales">) => {
    if (!confirm("¿Seguro que deseas eliminar esta obra social?")) return;
    try {
      await eliminar({ id });
      setToast("Obra social eliminada correctamente.");
    } catch (err: any) {
      setToast("⚠️ Error al eliminar: " + err.message);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Obras Sociales
            </h1>
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
            onChange={(e) => setBusqueda(e.target.value)}
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
              {obrasFiltradas.map((os) => (
                <tr
                  key={os._id.toString()}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-4">
                    {editando?._id === os._id ? (
                      <input
                        value={editando.nombre}
                        onChange={(e) =>
                          setEditando({ ...editando, nombre: e.target.value })
                        }
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
                          onClick={() => handleEliminar(os._id)}
                          className="text-red-600 font-medium hover:underline"
                        >
                          <Trash size={16} className="inline mr-1" /> Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {obrasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="p-6 text-center text-gray-400 italic"
                  >
                    No hay obras sociales registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 shadow-lg text-blue-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-3 text-blue-500 hover:text-blue-700 text-lg"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

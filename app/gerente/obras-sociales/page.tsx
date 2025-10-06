"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, Search, CheckCircle2, XCircle, Heart } from "lucide-react";
import { ObrasSocialesGrid } from "./obra-social-card";

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
  const [editando, setEditando] = useState<Id<"obrasSociales"> | null>(null);
  const [toast, setToast] = useState<{ tipo: "success" | "error"; mensaje: string } | null>(null);

  // Filtrar obras sociales por búsqueda
  const obrasFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return obrasSociales.filter((os) => os.nombre.toLowerCase().includes(term));
  }, [busqueda, obrasSociales]);

  // Paginación: mostrar 8 obras sociales por página
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 8;
  const totalPaginas = Math.ceil(obrasFiltradas.length / porPagina);

  const obrasPagina = useMemo(() => {
    const start = (paginaActual - 1) * porPagina;
    return obrasFiltradas.slice(start, start + porPagina);
  }, [paginaActual, obrasFiltradas]);

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

  // Crear nueva obra social
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

  // Iniciar edición
  const handleIniciarEdicion = (obraSocial: ObraSocial) => {
    setEditando(obraSocial._id);
  };

  // Guardar edición
  const handleGuardarEdicion = async (id: Id<"obrasSociales">, nombre: string) => {
    if (!nombre.trim()) return;

    try {
      await editar({ id, nombre: nombre.trim() });
      setEditando(null);
      setToast({ tipo: "success", mensaje: "Obra social actualizada correctamente." });
    } catch (err: any) {
      setToast({ tipo: "error", mensaje: "Error al editar la obra social." });
    }
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setEditando(null);
  };

  // Eliminar obra social
  const handleEliminar = async (id: Id<"obrasSociales">) => {
    try {
      await eliminar({ id });
      setToast({ tipo: "success", mensaje: "Obra social eliminada correctamente." });
    } catch (err: any) {
      setToast({ tipo: "error", mensaje: "Error al eliminar la obra social." });
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
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-rose-400 to-rose-600 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Gestión de Obras Sociales
          </h1>
        </div>

        {/* Buscador y formulario de creación */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-lg p-3">
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

            {/* Formulario de nueva obra social */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCrear()}
                placeholder="Nueva obra social..."
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none w-64"
              />
              <button
                onClick={handleCrear}
                disabled={!nueva.trim()}
                className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2 rounded-lg hover:bg-rose-700 transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
          </div>

          {/* Contador */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {obrasFiltradas.length} obra{obrasFiltradas.length !== 1 ? 's' : ''} social{obrasFiltradas.length !== 1 ? 'es' : ''}
              {busqueda && ' encontrada(s)'}
            </span>
          </div>
        </div>

        {/* Grid de obras sociales */}
        <ObrasSocialesGrid
          obrasSociales={obrasPagina}
          editando={editando}
          onEditar={handleIniciarEdicion}
          onEliminar={handleEliminar}
          onGuardar={handleGuardarEdicion}
          onCancelar={handleCancelarEdicion}
        />

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-3 py-4">
            <button
              onClick={anteriorPagina}
              disabled={paginaActual === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${paginaActual === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={siguientePagina}
              disabled={paginaActual === totalPaginas}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${paginaActual === totalPaginas
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white border animate-in fade-in slide-in-from-bottom-4 duration-500 ${toast.tipo === "success"
              ? "bg-green-600 border-green-400"
              : "bg-red-600 border-red-400"
              }`}
          >
            {toast.tipo === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <XCircle className="w-5 h-5 text-white" />
            )}
            <p className="font-medium">{toast.mensaje}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-100 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
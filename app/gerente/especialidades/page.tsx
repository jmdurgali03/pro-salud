"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { Plus, Search, CheckCircle2, Stethoscope } from "lucide-react";
import { EspecialidadesGrid } from "./especialidad-card";

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
  const [editando, setEditando] = useState<Id<"especialidades"> | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTipo, setToastTipo] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);

  // Filtrar especialidades por búsqueda
  const especialidadesFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase();
    return especialidades.filter((e) => e.nombre.toLowerCase().includes(term));
  }, [busqueda, especialidades]);

  // Paginación: mostrar 8 especialidades por página
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

  // Crear nueva especialidad (con validación y error visual)
  const handleCrear = async () => {
    const nombreLimpio = nueva.trim().toLowerCase();
    if (!nombreLimpio) return;

    // Validar duplicado
    const existe = especialidades.some(
      (e) => e.nombre.toLowerCase() === nombreLimpio
    );

    if (existe) {
      setError("Ya existe una especialidad con ese nombre.");
      setToast("Ya existe una especialidad con ese nombre.");
      setToastTipo("error");
      return;
    }

    try {
      await crear({ nombre: nueva.trim() });
      setNueva("");
      setError(null);
      setToast("Especialidad creada correctamente.");
      setToastTipo("success");
    } catch (err) {
      console.error(err);
      setError("Error al crear la especialidad.");
      setToast("Error al crear la especialidad.");
      setToastTipo("error");
    }
  };

  // Iniciar edición
  const handleIniciarEdicion = (especialidad: Especialidad) => {
    setEditando(especialidad._id);
  };

  // Guardar edición
  const handleGuardarEdicion = async (id: Id<"especialidades">, nombre: string) => {
    if (!nombre.trim()) return;
    await editar({ id, nombre: nombre.trim() });
    setEditando(null);
    setToast("Especialidad actualizada correctamente.");
    setToastTipo("success");
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setEditando(null);
  };

  // Eliminar especialidad
  const handleEliminar = async (id: Id<"especialidades">) => {
    await eliminar({ id });
    setToast("Especialidad eliminada correctamente.");
    setToastTipo("success");
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
                placeholder="Buscar especialidad..."
                className="w-full outline-none text-sm"
              />
            </div>

            {/* Formulario de nueva especialidad */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nueva}
                  onChange={(e) => {
                    setNueva(e.target.value);
                    setError(null); // limpia el error al escribir
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCrear()}
                  placeholder="Nueva especialidad..."
                  className={`px-4 py-2 border rounded-lg text-sm focus:ring-2 outline-none w-64 transition-all ${
                    error
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-teal-500"
                  }`}
                />
                <button
                  onClick={handleCrear}
                  disabled={!nueva.trim()}
                  className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
              )}
            </div>
          </div>

          {/* Contador */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {especialidadesFiltradas.length} especialidad
              {especialidadesFiltradas.length !== 1 ? "es" : ""}
              {busqueda && " encontrada(s)"}
            </span>
          </div>
        </div>

        {/* Grid de especialidades */}
        <EspecialidadesGrid
          especialidades={especialidadesPagina}
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                paginaActual === 1
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                paginaActual === totalPaginas
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
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-4 duration-500
              ${
                toastTipo === "success"
                  ? "bg-green-600 border-green-400 text-white"
                  : "bg-red-600 border-red-400 text-white"
              }`}
          >
            {toastTipo === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <span className="text-lg font-bold">✕</span>
            )}
            <p className="font-medium">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-opacity-80 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

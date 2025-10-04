"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { PageWrapper } from "@/components/page-wrapper";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export type Paciente = {
  _id: Id<"pacientes">;
  nombre: string;
  apellido: string;
  dni: string;
  email?: string;
  telefono?: string;
  obrasSociales?: Id<"obrasSociales">[];
  obrasSocialesNombres?: string[];
  fechaNacimiento?: string;
  genero?: string;
};

export default function GerentePacientesPage() {
  const pacientes = useQuery(api.pacientes.listar, {}) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // Ocultar toast automáticamente
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Buscar coincidencias
  const pacientesFiltrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return pacientes;
    return pacientes.filter((p) => {
      const obras =
        (p.obrasSocialesNombres ??
          p.obrasSociales?.map(
            (id) => obrasSociales.find((os) => os._id === id)?.nombre || ""
          )) || [];
      return (
        p.nombre.toLowerCase().includes(term) ||
        p.apellido.toLowerCase().includes(term) ||
        p.dni?.toLowerCase().includes(term) ||
        (p.email ?? "").toLowerCase().includes(term) ||
        obras.join(" ").toLowerCase().includes(term)
      );
    });
  }, [q, pacientes, obrasSociales]);

  // Paginación
  const itemsPerPage = 8;
  const totalPages = Math.ceil(pacientesFiltrados.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const pacientesPaginados = pacientesFiltrados.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [totalPages]);

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Pacientes", href: "/gerente/pacientes" },
      ]}
    >
      <div className="w-full px-16 py-10 space-y-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-sky-500 to-cyan-500 rounded-full"></div>
            <h1 className="text-4xl font-bold text-gray-900">
              Registro de Pacientes
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-5">
            Consulta la información de todos los pacientes registrados en el
            centro médico
          </p>
        </div>

        {/* Buscador */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, email u obra social..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 mr-4 px-5 py-3 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-sky-500 outline-none text-base"
          />
          <button
            onClick={() => setToast("Funcionalidad de exportar próximamente")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 shadow text-base transition-all duration-300"
          >
            Exportar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow bg-white transition-all duration-300">
          <table className="w-full text-base text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-5 text-left">Nombre</th>
                <th className="p-5 text-left">Apellido</th>
                <th className="p-5 text-left">DNI</th>
                <th className="p-5 text-left">Email</th>
                <th className="p-5 text-left">Teléfono</th>
                <th className="p-5 text-left">Obras Sociales</th>
                <th className="p-5 text-center">Género</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesPaginados.map((pac) => (
                <tr
                  key={pac._id.toString()}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-5 font-semibold">{pac.nombre}</td>
                  <td className="p-5 font-semibold">{pac.apellido}</td>
                  <td className="p-5">{pac.dni}</td>
                  <td className="p-5">{pac.email || "—"}</td>
                  <td className="p-5">{pac.telefono || "—"}</td>
                  <td className="p-5 flex flex-wrap gap-2">
                    {(pac.obrasSocialesNombres ??
                      pac.obrasSociales?.map(
                        (id) =>
                          obrasSociales.find((os) => os._id === id)?.nombre ||
                          ""
                      ) ??
                      []
                    ).map((os) => (
                      <span
                        key={os}
                        className="px-3 py-1 text-sm rounded-full bg-gray-100 border text-gray-700"
                      >
                        {os}
                      </span>
                    ))}
                  </td>
                  <td className="p-5 text-center">{pac.genero || "—"}</td>
                  <td className="p-5 text-center space-x-4">
                    <button
                      onClick={() => setToast(`Viendo historial de ${pac.nombre}`)}
                      className="text-sky-600 hover:underline"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              {pacientesFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-gray-400 italic"
                  >
                    No hay pacientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                page === 1
                  ? "text-gray-400 border-gray-200"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              Página{" "}
              <span className="font-semibold text-gray-900">{page}</span> de{" "}
              {totalPages}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                page === totalPages
                  ? "text-gray-400 border-gray-200"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3
                          rounded-xl border border-sky-300 bg-gradient-to-r from-sky-50 to-sky-100
                          px-6 py-4 shadow-2xl shadow-sky-200/50 text-sky-800
                          animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-[350px] max-w-md"
          >
            <CheckCircle2 className="h-7 w-7 text-sky-600" />
            <div className="flex-1">
              <p className="text-base font-semibold">Acción ejecutada</p>
              <p className="text-sm">{toast}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-sky-600 hover:text-sky-800 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

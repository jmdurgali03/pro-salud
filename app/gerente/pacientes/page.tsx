"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { PageWrapper } from "@/components/page-wrapper";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, CheckCircle2, Users, Search } from "lucide-react";

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
      <div className="w-full px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Registro de Pacientes
          </h1>
        </div>

        {/* Buscador */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, email u obra social..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full outline-none text-sm"
          />
          <button
            onClick={() => setToast("Funcionalidad de exportar próximamente")}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all whitespace-nowrap"
          >
            Exportar
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden border border-gray-200 rounded-xl shadow bg-white">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Apellido</th>
                <th className="p-4 text-left">DNI</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Teléfono</th>
                <th className="p-4 text-left">Obras Sociales</th>
                <th className="p-4 text-center">Género</th>
                <th className="p-4 text-center w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesPaginados.map((pac) => (
                <tr
                  key={pac._id.toString()}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-4 font-medium">{pac.nombre}</td>
                  <td className="p-4 font-medium">{pac.apellido}</td>
                  <td className="p-4">{pac.dni}</td>
                  <td className="p-4">{pac.email || "—"}</td>
                  <td className="p-4">{pac.telefono || "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
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
                          className="px-2 py-1 text-xs rounded-full bg-blue-50 border border-blue-200 text-blue-700"
                        >
                          {os}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center text-gray-500">{pac.genero || "—"}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setToast(`Viendo historial de ${pac.nombre}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
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
                    className="p-6 text-center text-gray-400 italic text-sm"
                  >
                    No hay pacientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 py-4 text-sm">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={`px-3 py-1 rounded-md flex items-center gap-1 ${page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-3 py-1 rounded-md flex items-center gap-1 ${page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white bg-green-600 border border-green-400 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
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
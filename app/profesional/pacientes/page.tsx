"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Search,
  ChevronDown,
} from "lucide-react";

/* --------------------- Tipos --------------------- */
type PacienteAtendido = {
  _id: Id<"pacientes">;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email?: string;
  ultimaConsulta?: number;
};

/* --------------------- Página --------------------- */
export default function PacientesDelDoctorPage() {
  const { user } = useUser();

  // Traer el profesional logueado
  const profesional = useQuery(
    api.profesionales.getByClerkUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // Traer los pacientes del profesional
  const pacientes = useQuery(
    api.pacientes.listarPorDoctor,
    profesional?._id ? { doctorId: profesional._id } : "skip"
  ) as PacienteAtendido[] | undefined;

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<"reciente" | "antiguo" | "az" | "za">("reciente");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  /* --------------------- Cerrar al hacer click fuera --------------------- */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setMostrarFiltros(false);
      }
    }
    if (mostrarFiltros) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mostrarFiltros]);

  /* --------------------- Filtrado + Orden --------------------- */
  const pacientesFiltrados = useMemo(() => {
    if (!pacientes) return [];

    const termino = busqueda.trim().toLowerCase();

    const coincide = (valor?: string | number | null) => {
      if (valor === undefined || valor === null) return false;
      const texto = typeof valor === "string" ? valor : String(valor);
      return texto.toLowerCase().includes(termino);
    };

    let filtrados = pacientes.filter((p) =>
      [p.nombre, p.apellido, p.dni, p.email, p.telefono]
        .filter(Boolean)
        .some((v) => coincide(v))
    );

    filtrados.sort((a, b) => {
      switch (orden) {
        case "reciente":
          return (b.ultimaConsulta ?? 0) - (a.ultimaConsulta ?? 0);
        case "antiguo":
          return (a.ultimaConsulta ?? 0) - (b.ultimaConsulta ?? 0);
        case "az":
          return a.apellido.localeCompare(b.apellido, "es");
        case "za":
          return b.apellido.localeCompare(a.apellido, "es");
        default:
          return 0;
      }
    });

    return filtrados;
  }, [pacientes, busqueda, orden]);

  if (!pacientes)
    return <div className="p-8 text-gray-600">Cargando pacientes…</div>;

  /* --------------------- Render --------------------- */
  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/profesional" },
        { label: "Pacientes", href: "/profesional/pacientes" },
      ]}
    >
      <div className="w-full px-6 py-8 space-y-6 relative">
        {/* Encabezado */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-8 bg-gradient-to-b from-blue-300 to-blue-700 rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pacientes atendidos
              </h1>
            </div>
            <p className="text-gray-600 text-base md:ml-5">
              Listado de pacientes atendidos por el profesional.
            </p>
          </div>
        </div>

        {/* Barra de búsqueda y botón de filtro */}
        <div className="flex items-center space-x-3 relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, DNI, teléfono o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-14 pl-12 pr-4 text-base rounded-2xl border border-gray-200 shadow-md focus:border-blue-500 focus:ring-blue-500 transition duration-150"
            />
          </div>

          {/* Botón Filtros */}
          <div className="relative">
            <button
              onClick={() => setMostrarFiltros((v) => !v)}
              className={`h-14 px-5 rounded-2xl border border-gray-200 shadow-md bg-white hover:bg-gray-50 flex items-center gap-2 transition duration-150 ${
                mostrarFiltros ? "ring-2 ring-blue-400" : ""
              }`}
            >
              Filtros
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  mostrarFiltros ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 🔹 Popover flotante */}
            {mostrarFiltros && (
              <div
                ref={popoverRef}
                className="absolute right-0 mt-2 w-56 border border-gray-200 rounded-xl shadow-xl bg-white p-4 space-y-3 z-50"
              >
                <p className="text-sm font-medium text-gray-800">Ordenar por:</p>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "reciente", label: "Más reciente" },
                    { key: "antiguo", label: "Más antiguo" },
                    { key: "az", label: "Alfabético A–Z" },
                    { key: "za", label: "Alfabético Z–A" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setOrden(opt.key as any);
                        setMostrarFiltros(false);
                      }}
                      className={`text-left px-3 py-1.5 rounded-lg text-sm border transition ${
                        orden === opt.key
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-100 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Última Consulta</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No hay pacientes encontrados.
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((p) => (
                  <tr
                    key={p._id}
                    className="text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div>{p.nombre} {p.apellido}</div>
                      <div className="text-xs text-gray-500">DNI: {p.dni}</div>
                    </td>
                    <td className="px-4 py-3">{p.email ?? "—"}</td>
                    <td className="px-4 py-3">{p.telefono ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        {p.ultimaConsulta
                          ? new Date(p.ultimaConsulta).toLocaleDateString("es-AR")
                          : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/profesional/pacientes/${p._id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      >
                        Ver historial
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}

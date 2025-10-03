// app/recepcionista/historias/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Filter } from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";

export default function HistoriasClinicasListaPage() {
  const [q, setQ] = useState("");
  const pacientes = useQuery(api.pacientes.listar, q ? { search: q } : {});

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/recepcionista" },
        { label: "Historias Clínicas", href: "/recepcionista/historias" },
      ]}
    >
      <div className="w-full bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <div>
                <h1 className="text-3xl font-bold">Historias Clínicas</h1>
                <p className="text-gray-600 text-base">
                  Administra la información de todos los pacientes registrados
                </p>
              </div>
            </div>
            
          </div>

          {/* Buscador como en Pacientes */}
          <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Buscar por nombre, DNI, email, teléfono u obra social..."
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100">
              <Filter className="h-4 w-4" /> Obras sociales
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-4 text-left">Paciente</th>
                  <th className="p-4 text-left">DNI</th>
                  <th className="p-4 text-left">Contacto</th>
                  <th className="p-4 text-left">Teléfono</th>
                  <th className="p-4 text-left">Obras Sociales</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(pacientes ?? []).map((p: any) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{p.nombreCompleto}</td>
                    <td className="p-4">{p.dni}</td>
                    <td className="p-4">{p.email}</td>
                    <td className="p-4">{p.telefono || "—"}</td>
                    <td className="p-4">
                      {p.obrasSocialesNombres?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {p.obrasSocialesNombres.map((os: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
                            >
                              {os}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Particular</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/recepcionista/historias/${p._id}`}
                        className="text-green-600 hover:underline font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}

                {!pacientes?.length && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400 italic">
                      No hay pacientes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

// app/recepcionista/historias/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, User, IdCard, Phone, Mail, Stethoscope, ArrowRight } from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";

export default function HistoriasClinicasListaPage() {
  const [q, setQ] = useState("");
  const pacientes = useQuery(api.pacientes.listar, q ? { search: q } : {});

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/recepcionista" },
        { label: "Historias Clinicas", href: "/recepcionista/Historias Clinicas" },
      ]}
    >
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Historias Clínicas</h1>
            <p className="text-sm text-gray-500">Lista de pacientes</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 py-2 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Buscar por nombre, DNI o email…"
            />
          </div>
        </header>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500">
            <div className="col-span-4">Paciente</div>
            <div className="col-span-2">DNI</div>
            <div className="col-span-3">Contacto</div>
            <div className="col-span-2">Obra social</div>
            <div className="col-span-1 text-right">Acción</div>
          </div>

          <div className="divide-y">
            {(pacientes ?? []).map((p: any) => (
              <div key={p._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{p.nombreCompleto}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-gray-400" />
                  <span>{p.dni}</span>
                </div>
                <div className="col-span-3 space-y-0.5">
                  {p.telefono && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{p.telefono}</span>
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-gray-400" />
                  <span className="truncate">
                    {p.obrasSocialesNombres?.length ? p.obrasSocialesNombres.join(", ") : "Particular"}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <Link
                    className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-700"
                    href={`/recepcionista/historias/${p._id}`}
                  >
                    Ver <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
            {!pacientes?.length && (
              <div className="px-6 py-10 text-center text-sm text-gray-500">Sin resultados.</div>
            )}
          </div>
        </section>
      </div>
    </div>
    </PageWrapper>
  );
  
}

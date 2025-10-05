"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PageWrapper } from "@/components/page-wrapper";
import { Calendar as CalendarIcon, Stethoscope } from "lucide-react";

/* Tipo simplificado */
type PacienteAtendido = {
  _id: Id<"pacientes">;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email?: string;
  ultimaConsulta?: number;
};

export default function PacientesDelDoctorPage() {
  const { user } = useUser();

  // 🔹 1. Traer el profesional logueado
  const profesional = useQuery(
    api.profesionales.getByClerkUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  // 🔹 2. Listar pacientes SOLO cuando tengo el _id del profesional
  const pacientes = useQuery(
    api.pacientes.listarPorDoctor,
    profesional?._id ? { doctorId: profesional._id } : "skip"
  ) as PacienteAtendido[] | undefined;

  if (!pacientes) {
    return <div className="p-8 text-gray-600">Cargando pacientes…</div>;
  }

  return (
    <>
      <PageWrapper
        breadcrumbs={[
          { label: "Inicio", href: "/profesional" },
          { label: "Pacientes", href: "/profesional/pacientes" },
        ]}
      >
        <div className="w-full px-6 py-8 space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-300 to-blue-700 rounded-full"></div>
                <h1 className="text-3xl font-bold text-gray-900">Pacientes atendidos</h1>
              </div>
              <p className="text-gray-600 text-base md:ml-5">
                Listado de pacientes atendidos.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombres</th>
                  <th className="px-4 py-3 font-medium">Apellidos</th>
                  <th className="px-4 py-3 font-medium">DNI</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Última consulta</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pacientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      No hay pacientes registrados aún.
                    </td>
                  </tr>
                ) : (
                  pacientes.map((p) => (
                    <tr key={p._id} className="text-gray-800 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.nombre}</td>
                      <td className="px-4 py-3 font-medium">{p.apellido}</td>
                      <td className="px-4 py-3">{p.dni}</td>
                      <td className="px-4 py-3">{p.telefono ?? "—"}</td>
                      <td className="px-4 py-3">{p.email ?? "—"}</td>
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
    </>
  );
}
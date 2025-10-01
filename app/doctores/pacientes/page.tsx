"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Stethoscope, Calendar } from "lucide-react";

/* Tipo simplificado */
type PacienteAtendido = {
  _id: Id<"pacientes">;
  nombreCompleto: string;
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-cyan-600" />
          Pacientes atendidos
        </h1>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Última consulta</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No hay pacientes registrados aún.
                  </td>
                </tr>
              ) : (
                pacientes.map((p) => (
                  <tr key={p._id} className="text-gray-800 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.nombreCompleto}</td>
                    <td className="px-4 py-3">{p.dni}</td>
                    <td className="px-4 py-3">{p.telefono ?? "—"}</td>
                    <td className="px-4 py-3">{p.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {p.ultimaConsulta
                        ? new Date(p.ultimaConsulta).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/doctores/pacientes/${p._id}`}
                        className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-700"
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
    </div>
  );
}

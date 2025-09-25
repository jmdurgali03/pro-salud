"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel"; 
import { useState } from "react";

export default function PacienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const paciente = useQuery(api.pacientes.getByIdConObras, {
    id: id as any, // Convex Id
  });

  if (paciente === undefined) {
    return <p className="p-6">Cargando...</p>;
  }
  if (!paciente) {
    return <p className="p-6 text-red-500">Paciente no encontrado</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">
          Detalle de Paciente
        </h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          ← Volver
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <p className="text-gray-500 text-sm">Nombre completo</p>
          <p className="text-lg font-semibold text-black">
            {paciente.nombreCompleto}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">DNI</p>
            <p className="text-black">{paciente.dni}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Fecha de nacimiento</p>
            <p className="text-black">
              {paciente.fechaNacimiento || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Teléfono</p>
            <p className="text-black">{paciente.telefono || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="text-black">{paciente.email || "—"}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Obras sociales</p>
          {paciente.obrasSociales.length > 0 ? (
            <ul className="list-disc list-inside text-black">
              {paciente.obrasSociales.map((os, i) => (
                <li key={i}>{os}</li>
              ))}
            </ul>
          ) : (
            <p className="text-black">Particular (sin obra social)</p>
          )}
        </div>
      </div>
    </div>
  );
}

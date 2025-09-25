"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel"; // 👈 importar Id
import { useState } from "react";

export default function HistorialPacientePage() {
  const { id } = useParams();
  const router = useRouter();
  const paciente = useQuery(api.pacientes.getById, { id: id as Id<"pacientes"> }); // 👈 casteo correcto
  const observaciones = useQuery(api.observaciones.listarPorPaciente, {
    pacienteId: id as Id<"pacientes">, // 👈 casteo correcto
  });

  const agregarObservacion = useMutation(api.observaciones.crear);
  const [texto, setTexto] = useState("");

  if (!paciente) return <p className="p-6 text-black">Cargando...</p>;

  const handleAgregar = async () => {
    if (!texto.trim()) return;
    await agregarObservacion({
      pacienteId: id as Id<"pacientes">, // 👈 casteo correcto
      autor: "Dr. Ejemplo",
      texto,
    });
    setTexto("");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black">
            Historial de {paciente.nombreCompleto}
          </h1>
          <button
            onClick={() => router.push("/pacientes")}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100 text-black"
          >
            ← Volver
          </button>
        </div>

        {/* Datos básicos */}
        <div className="bg-white p-6 rounded-lg shadow space-y-2">
          <h2 className="text-lg font-semibold text-black mb-2">Datos del paciente</h2>
            <p>
            <b className="text-black">DNI:</b>{" "}
            <span className="text-black">{paciente.dni}</span>
            </p>
            <p>
            <b className="text-black">Teléfono:</b>{" "}
            <span className="text-black">{paciente.telefono ?? "-"}</span>
            </p>
            <p>
            <b className="text-black">Email:</b>{" "}
            <span className="text-black">{paciente.email ?? "-"}</span>
            </p>
            <p>
            <b className="text-black">Obra Social:</b>{" "}
            <span className="text-black">{paciente.obraSocial}</span>
            </p>
            <p>
            <b className="text-black">Fecha de Nacimiento:</b>{" "}
            <span className="text-black">{paciente.fechaNacimiento ?? "-"}</span>
            </p>

        </div>

        {/* Observaciones */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold text-black">Observaciones médicas</h2>
          <div className="space-y-3">
            {(observaciones ?? []).map((obs) => (
              <div
                key={obs._id}
                className="border rounded-lg p-3 bg-gray-50 shadow-sm"
              >
                <p className="text-sm text-black mb-1">
                  <b>{obs.autor}</b> –{" "}
                  {new Date(obs.creadoEn).toLocaleDateString()}
                </p>
                <p className="text-black">{obs.texto}</p>
              </div>
            ))}
            {(observaciones?.length ?? 0) === 0 && (
              <p className="text-sm text-black">No hay observaciones registradas</p>
            )}
          </div>

          {/* Formulario agregar nota */}
          <div className="mt-4 flex gap-2">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Nueva observación..."
              className="flex-1 border rounded-lg p-2 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAgregar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Otras secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-black">Turnos</h2>
            <p className="text-sm text-black">Listado de turnos del paciente...</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-black">Diagnósticos</h2>
            <p className="text-sm text-black">Historial de diagnósticos...</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-black">Recetas</h2>
            <p className="text-sm text-black">Tratamientos recetados...</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-black">Adjuntos</h2>
            <p className="text-sm text-black">Archivos e imágenes médicas...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

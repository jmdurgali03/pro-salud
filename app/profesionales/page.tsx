"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ProfesionalModal from "./ProfesionalModal";

// Tipo con _id (lo que viene de la BD)
export type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  especialidadId: Id<"especialidades">;   // ✅
  contacto: string;
  obrasSociales: Id<"obrasSociales">[];   // ✅ array
  estado: "Activo" | "Inactivo";

  especialidadNombre?: string;
  obrasSocialesNombres?: string[];        // ✅ array de nombres
};


export default function ProfesionalesPage() {
  // Queries
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  // Mutations
  const crear = useMutation(api.profesionales.crear);
  const editar = useMutation(api.profesionales.editar);
  const eliminar = useMutation(api.profesionales.eliminar);

  // Estado modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);

  // Crear
const handleCrear = async (data: Profesional) => {
  await crear({
    nombre: data.nombre,
    especialidadId: data.especialidadId,   // ✅
    contacto: data.contacto,
    obrasSociales: data.obrasSociales,     // ✅ array
    estado: data.estado,
  });
  setModalOpen(false);
};

  // Editar
const handleEditar = async (data: Profesional) => {
  if (!editando?._id) return;
  await editar({
    id: editando._id,
    nombre: data.nombre,
    especialidadId: data.especialidadId,   // ✅
    contacto: data.contacto,
    obrasSociales: data.obrasSociales,     // ✅ array
    estado: data.estado,
  });
  setEditando(null);
};
  // Eliminar
  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    await eliminar({ id });
  };

  // Helpers para mostrar nombres
  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids
      .map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "")
      .filter((n) => n !== "")
      .join(", ");

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Profesionales</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Añadir Profesional
        </button>
      </div>
      <p className="text-gray-500">
        Administra los profesionales de tu institución: especialidad, obra social y estado.
      </p>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-center">Nombre</th>
              <th className="p-3 text-center">Especialidad</th>
              <th className="p-3 text-center">Contacto</th>
              <th className="p-3 text-center">Obras Sociales</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profesionales.map((prof) => (
              <tr
                key={prof._id.toString()}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3 text-center">{prof.nombre}</td>
                <td className="p-3 text-center">
                  {getEspecialidadNombre(prof.especialidad)}
                </td>
                <td className="p-3 text-center">{prof.contacto}</td>
                <td className="p-3 text-center">
  {prof.obrasSocialesNombres?.join(", ") || "—"}
</td>

                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      prof.estado === "Activo"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {prof.estado}
                  </span>
                </td>
                <td className="p-3 space-x-3 text-center">
                  <button
                    onClick={() => setEditando(prof)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    //onClick={() => handleEliminar(prof._id)}
                    //className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {profesionales.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-gray-400 italic"
                >
                <td
                  colSpan={6}
                  className="p-4 text-center text-gray-400 italic"
                >
                  No hay profesionales registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {modalOpen && (
        <ProfesionalModal
          title="Nuevo Profesional"
          onSubmit={handleCrear}
          onCancel={() => setModalOpen(false)}
        />
      )}

      {/* Modal Editar */}
      {editando && (
        <ProfesionalModal
          title="Editar Profesional"
          initialData={editando}
          onSubmit={handleEditar}
          onCancel={() => setEditando(null)}
        />
      )}
    </div>
  );
}

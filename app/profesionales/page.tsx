"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ProfesionalModal from "./ProfesionalModal";

export type Profesional = {
  _id?: Id<"profesionales">;
  nombre: string;
  especialidad: Id<"especialidades">;
  contacto: string;
  obraSocial: Id<"obrasSociales">;
  estado: "Activo" | "Inactivo";

  especialidadNombre?: string;
  obraSocialNombre?: string;

};

export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const crear = useMutation(api.profesionales.crear);
  const editar = useMutation(api.profesionales.editar);
  const eliminar = useMutation(api.profesionales.eliminar);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);

  // Crear
  const handleCrear = async (data: Profesional) => {
    await crear({
      nombre: data.nombre,
      especialidad: data.especialidad,
      contacto: data.contacto,
      obraSocial: data.obraSocial,
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
      especialidad: data.especialidad,
      contacto: data.contacto,
      obraSocial: data.obraSocial,
      estado: data.estado,
    });
    setEditando(null);
  };

  // Eliminar
  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    await eliminar({ id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Gestión de Profesionales</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded bg-zinc-300 text-black hover:bg-zinc-400"
        >
          Añadir Profesional
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-center">Nombre</th>
              <th className="p-3 text-center">Especialidad</th>
              <th className="p-3 text-center">Contacto</th>
              <th className="p-3 text-center">Obra Social</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {profesionales.map((prof: Profesional) => (
              <tr key={prof._id?.toString()} className="border-t hover:bg-gray-50">
                <td className="p-3 text-center">{prof.nombre}</td>
                <td className="p-3 text-center">{prof.especialidadNombre}</td>
                <td className="p-3 text-center">{prof.contacto}</td>
                <td className="p-3 text-center">{prof.obraSocialNombre}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs font-medium  ${
                      prof.estado === "Activo" ? "bg-green-500" : "bg-red-500"
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
                    onClick={() => handleEliminar(prof._id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {profesionales.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400 italic">
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

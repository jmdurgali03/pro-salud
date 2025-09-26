"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ProfesionalModal from "./ProfesionalModal";

export type Profesional = {
  _id: Id<"profesionales">;
  nombre: string;
  dni: string;
  matricula: string;
  especialidadId: Id<"especialidades">;
  contacto: string;
  obrasSociales: Id<"obrasSociales">[];
  estado: "Activo" | "Inactivo";

  especialidadNombre?: string;
  obrasSocialesNombres?: string[];
};

export type ProfesionalInput = {
  nombre: string;
  especialidadId: Id<"especialidades">;
  contacto: string;
  obrasSociales: Id<"obrasSociales">[];
  estado: "Activo" | "Inactivo";
};

export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const crear = useMutation(api.profesionales.crear);
  const editar = useMutation(api.profesionales.editar);
  const eliminar = useMutation(api.profesionales.eliminar);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);
  const [viendo, setViendo] = useState<Profesional | null>(null);

  const handleCrear = async (data: ProfesionalInput & { dni: string; matricula: string }) => {
    await crear(data);
    setModalOpen(false);
  };

  const handleEditar = async (data: ProfesionalInput) => {
    if (!editando?._id) return;
    await editar({ id: editando._id, ...data });
    setEditando(null);
  };

  const handleEliminar = async (id?: Id<"profesionales">) => {
    if (!id) return;
    await eliminar({ id });
  };

  const getEspecialidadNombre = (id: Id<"especialidades">) =>
    especialidades.find((e) => e._id === id)?.nombre || "—";

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids.map((id) => obrasSociales.find((os) => os._id === id)?.nombre || "").filter(Boolean).join(", ");

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de Profesionales</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded bg-zinc-300 text-black font-bold hover:bg-zinc-400"
        >
          + Añadir Profesional
        </button>
      </div>
      <p className="text-gray-500">
        Administra los profesionales de tu institución.
      </p>

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
            {profesionales.map((prof: Profesional) => (
              <tr key={prof._id.toString()} className="border-t hover:bg-gray-50">
                <td className="p-3 text-center">{prof.nombre}</td>
                <td className="p-3 text-center">{getEspecialidadNombre(prof.especialidadId)}</td>
                <td className="p-3 text-center">{prof.contacto}</td>
                <td className="p-3 text-center">{getObrasSocialesNombres(prof.obrasSociales) || "—"}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      prof.estado === "Activo" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {prof.estado}
                  </span>
                </td>
                <td className="p-3 space-x-3 text-center">
                  <button onClick={() => setViendo(prof)} className="text-green-600 hover:underline">
                    Ver
                  </button>
                  <button onClick={() => setEditando(prof)} className="text-blue-600 hover:underline">
                    Editar
                  </button>

                  <button onClick={() => handleEliminar(prof._id)} className="text-red-600 hover:underline hidden"> 
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
          onSubmit={handleCrear as any}
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

      {/* Modal Ver */}
      {viendo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg shadow-xl p-6 w-96 space-y-4">
            <h2 className="text-lg font-bold">Datos del Profesional</h2>
            <p><strong>Nombre:</strong> {viendo.nombre}</p>
            <p><strong>DNI:</strong> {viendo.dni}</p>
            <p><strong>Matrícula:</strong> {viendo.matricula}</p>
            <p><strong>Especialidad:</strong> {getEspecialidadNombre(viendo.especialidadId)}</p>
            <p><strong>Contacto:</strong> {viendo.contacto}</p>
            <p><strong>Obras Sociales:</strong> {getObrasSocialesNombres(viendo.obrasSociales)}</p>
            <p><strong>Estado:</strong> {viendo.estado}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setViendo(null)}
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

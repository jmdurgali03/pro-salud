"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function ProfesionalesPage() {
  const profesionales = useQuery(api.profesionales.listar) ?? [];
  const eliminar = useMutation(api.profesionales.eliminar);

  const [busqueda, setBusqueda] = useState("");

  const filtrados = profesionales.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Profesionales</h1>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar profesionales..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full max-w-lg rounded border px-3 py-2"
      />

      {/* Tabla */}
      <table className="w-full border-collapse rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Nombre</th>
            <th className="p-3">Especialidad</th>
            <th className="p-3">Contacto</th>
            <th className="p-3">Obras Sociales</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((prof) => (
            <tr key={prof._id} className="border-t">
              <td className="p-3">{prof.nombre}</td>
              <td className="p-3">{prof.especialidad}</td>
              <td className="p-3">{prof.contacto}</td>
              <td className="p-3">{prof.obrasSociales.join(", ")}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-white ${
                    prof.estado === "Activo" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {prof.estado}
                </span>
              </td>
              <td className="p-3 space-x-3">
                <button className="text-blue-600 hover:underline">
                  Editar
                </button>
                <button
                  onClick={() => eliminar({ id: prof._id })}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

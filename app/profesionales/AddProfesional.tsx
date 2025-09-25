"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AddProfesional() {
  const crear = useMutation(api.profesionales.crear);
  const [open, setOpen] = useState(false);

  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [contacto, setContacto] = useState("");
  const [obrasSociales, setObrasSociales] = useState("");
  const [estado, setEstado] = useState<"Activo" | "Inactivo">("Activo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await crear({
      nombre,
      especialidad,
      contacto,
      obrasSociales: obrasSociales.split(",").map((s) => s.trim()),
      estado,
    });
    setOpen(false);
    setNombre("");
    setEspecialidad("");
    setContacto("");
    setObrasSociales("");
    setEstado("Activo");
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded bg-slate-300 text-black hover:bg-slate-500 font-semibold"
      >
        Añadir Profesional
      </button>

      {open && (
        <div className="fixed inset-0 bg-gray-500/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              Nuevo Profesional
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
                required
              />
              <input
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Especialidad"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
                required
              />
              <input
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Contacto (email o tel)"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
                required
              />
              <input
                value={obrasSociales}
                onChange={(e) => setObrasSociales(e.target.value)}
                placeholder="Obras sociales (coma)"
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
              />
              <select
                value={estado}
                onChange={(e) =>
                  setEstado(e.target.value as "Activo" | "Inactivo")
                }
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-sky-600 text-white hover:bg-sky-500"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

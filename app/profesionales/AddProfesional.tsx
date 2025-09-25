"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function AddProfesional() {
  const crear = useMutation(api.profesionales.crear);
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const [open, setOpen] = useState(false);

  const [nombre, setNombre] = useState("");
  const [especialidad, setEspecialidad] = useState<Id<"especialidades"> | "">("");
  const [contacto, setContacto] = useState("");
  const [obrasSeleccionadas, setObrasSeleccionadas] = useState<Id<"obrasSociales">[]>([]);
  const [estado, setEstado] = useState<"Activo" | "Inactivo">("Activo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!especialidad || obrasSeleccionadas.length === 0) {
      alert("Debe seleccionar especialidad y al menos una obra social");
      return;
    }

    await crear({
      nombre,
      especialidad: especialidad as Id<"especialidades">,
      contacto,
      obrasSociales: obrasSeleccionadas,
      estado,
    });

    setOpen(false);
    setNombre("");
    setEspecialidad("");
    setContacto("");
    setObrasSeleccionadas([]);
    setEstado("Activo");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Nombre */}
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full border rounded px-3 py-2"
      />

      {/* Especialidad */}
      <select
        value={especialidad}
        onChange={(e) => setEspecialidad(e.target.value as Id<"especialidades">)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Seleccionar especialidad</option>
        {especialidades.map((esp) => (
          <option key={esp._id} value={esp._id}>
            {esp.nombre}
          </option>
        ))}
      </select>

      {/* Obras Sociales (múltiple) */}
      <select
        multiple
        value={obrasSeleccionadas as string[]}
        onChange={(e) =>
          setObrasSeleccionadas(
            Array.from(e.target.selectedOptions, (opt) => opt.value as Id<"obrasSociales">)
          )
        }
        className="w-full border rounded px-3 py-2"
      >
        {obrasSociales.map((os) => (
          <option key={os._id} value={os._id}>
            {os.nombre}
          </option>
        ))}
      </select>

      {/* Estado */}
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
        className="w-full border rounded px-3 py-2"
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>

      <button
        type="submit"
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
      >
        Guardar
      </button>
    </form>
  );
}

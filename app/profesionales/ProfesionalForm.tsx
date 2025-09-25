"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Profesional, ProfesionalInput } from "./page";
import type { Id } from "../../convex/_generated/dataModel";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput) => void;
  onCancel: () => void;
};

export default function ProfesionalForm({ initialData, onSubmit, onCancel }: Props) {
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [especialidad, setEspecialidad] = useState<Id<"especialidades"> | "">(
    initialData?.especialidad ?? ""
  );
  const [contacto, setContacto] = useState(initialData?.contacto ?? "");
  const [obrasSeleccionadas, setObrasSeleccionadas] = useState<Id<"obrasSociales">[]>(
    initialData?.obrasSociales ?? []
  );
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(
    initialData?.estado ?? "Activo"
  );

  // 👉 Manejar checkboxes de obras sociales
  const handleObraSocialChange = (id: Id<"obrasSociales">) => {
    setObrasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((os) => os !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nombre,
      especialidad: especialidad as Id<"especialidades">,
      contacto,
      obrasSociales: obrasSeleccionadas,
      estado,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full border rounded px-3 py-2"
        required
      />

      <select
        value={especialidad}
        onChange={(e) => setEspecialidad(e.target.value as Id<"especialidades">)}
        className="w-full border rounded px-3 py-2"
        required
      >
        <option value="">Seleccionar especialidad</option>
        {especialidades.map((esp) => (
          <option key={esp._id} value={esp._id}>
            {esp.nombre}
          </option>
        ))}
      </select>

      <input
        type="email"
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        placeholder="Contacto (ej: usuario@gmail.com)"
        className="w-full border rounded px-3 py-2"
        required
      />

      {/* 👇 Checkboxes para obras sociales */}
      <div className="space-y-2">
        <label className="font-medium text-gray-700">Obras Sociales</label>
        {obrasSociales.map((os) => (
          <div key={os._id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={obrasSeleccionadas.includes(os._id)}
              onChange={() => handleObraSocialChange(os._id)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span>{os.nombre}</span>
          </div>
        ))}
      </div>

      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
        className="w-full border rounded px-3 py-2"
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

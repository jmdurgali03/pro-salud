"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { ProfesionalInput, Profesional } from "./page";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput) => void;
  onCancel: () => void;
};

export default function ProfesionalForm({ initialData, onSubmit, onCancel }: Props) {
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSocialesData = useQuery(api.obrasSociales.listar) ?? [];

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [especialidad, setEspecialidad] = useState<Id<"especialidades"> | "">(
    initialData?.especialidad ?? ""
  );
  const [contacto, setContacto] = useState(initialData?.contacto ?? "");
  const [obrasSociales, setObrasSociales] = useState<Id<"obrasSociales">[]>(
    initialData?.obrasSociales ?? []
  );
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(
    initialData?.estado ?? "Activo"
  );

  // 📌 Handler para selección múltiple de obras sociales
  const handleObrasSocialesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value as Id<"obrasSociales">);
    setObrasSociales(selected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica de Gmail
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(contacto)) {
      alert("El contacto debe ser un correo válido de Gmail (@gmail.com)");
      return;
    }

    onSubmit({
      nombre,
      especialidad: especialidad as Id<"especialidades">,
      contacto,
      obrasSociales,
      estado,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Nombre */}
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-800 placeholder-gray-500"
        required
      />

      {/* Especialidad */}
      <select
        value={especialidad}
        onChange={(e) => setEspecialidad(e.target.value as Id<"especialidades">)}
        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-800"
        required
      >
        <option value="">Seleccionar especialidad</option>
        {especialidades.map((esp) => (
          <option key={esp._id} value={esp._id}>
            {esp.nombre}
          </option>
        ))}
      </select>

      {/* Contacto */}
      <input
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        placeholder="Contacto (ej: usuario@gmail.com)"
        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-800 placeholder-gray-500"
        required
      />

      {/* Obras Sociales (Múltiple) */}
      <select
        multiple
        value={obrasSociales}
        onChange={handleObrasSocialesChange}
        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-800 h-28"
        required
      >
        {obrasSocialesData.map((os) => (
          <option key={os._id} value={os._id}>
            {os.nombre}
          </option>
        ))}
      </select>

      {/* Estado */}
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-800"
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

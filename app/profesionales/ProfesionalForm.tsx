"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Profesional } from "./page";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: Profesional) => void;
  onCancel: () => void;
};

export default function ProfesionalForm({ initialData, onSubmit, onCancel }: Props) {
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];
  const especialidades = useQuery(api.especialidades.listar) ?? [];

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [especialidad, setEspecialidad] = useState(initialData?.especialidad ?? "");
  const [contacto, setContacto] = useState(initialData?.contacto ?? "");
  const [obraSocial, setObraSocial] = useState(initialData?.obraSocial ?? "");
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(
    initialData?.estado ?? "Activo"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(contacto)) {
      alert("El contacto debe ser un correo válido de Gmail (@gmail.com)");
      return;
    }

    onSubmit({
      nombre,
      especialidad,
      contacto,
      obraSocial,
      estado,
    } as Profesional);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full border rounded px-3 py-2 bg-gray-800 text-white"
        required
      />

      <select
        value={especialidad}
        onChange={(e) => setEspecialidad(e.target.value)}
        className="w-full border rounded px-3 py-2 bg-gray-800 text-white"
        required
      >
        <option value="">Seleccionar especialidad</option>
        {especialidades.map((esp: any) => (
          <option key={esp._id} value={esp._id}>
            {esp.nombre}
          </option>
        ))}
      </select>

      <input
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        placeholder="Contacto (ej: usuario@gmail.com)"
        className="w-full border rounded px-3 py-2 bg-gray-800 text-white"
        required
      />

      <select
        value={obraSocial}
        onChange={(e) => setObraSocial(e.target.value)}
        className="w-full border rounded px-3 py-2 bg-gray-800 text-white"
        required
      >
        <option value="">Seleccionar obra social</option>
        {obrasSociales.map((os: any) => (
          <option key={os._id} value={os._id}>
            {os.nombre}
          </option>
        ))}
      </select>

      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
        className="w-full border rounded px-3 py-2 bg-gray-800 text-white"
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black"
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

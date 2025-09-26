"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Profesional, ProfesionalInput } from "./page";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput & { dni?: string; matricula?: string }) => void;
  onCancel: () => void;
};

export default function ProfesionalForm({ initialData, onSubmit, onCancel }: Props) {
  const especialidades = useQuery(api.especialidades.listar);
  const obrasSociales = useQuery(api.obrasSociales.listar);

  if (!especialidades || !obrasSociales) {
    return <p className="text-gray-500">Cargando datos...</p>;
  }

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [dni, setDni] = useState(initialData?.dni ?? "");
  const [matricula, setMatricula] = useState(initialData?.matricula ?? "");
  const [especialidadId, setEspecialidadId] = useState<Id<"especialidades"> | "">(
    initialData?.especialidadId ?? ""
  );
  const [contacto, setContacto] = useState(initialData?.contacto ?? "");
  const [obrasSeleccionadas, setObrasSeleccionadas] = useState<Id<"obrasSociales">[]>(
    initialData?.obrasSociales ?? []
  );
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(initialData?.estado ?? "Activo");

  const handleObraSocialChange = (id: Id<"obrasSociales">) => {
    setObrasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((os) => os !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Solo validar cuando es crear (no editar)
    if (!initialData) {
      if (dni.length !== 8) {
        alert("El DNI debe tener exactamente 8 dígitos");
        return;
      }
      if (matricula.length !== 4) {
        alert("La matrícula debe tener exactamente 4 dígitos");
        return;
      }
    }

    const data: any = {
      nombre,
      especialidadId: especialidadId as Id<"especialidades">,
      contacto,
      obrasSociales: obrasSeleccionadas,
      estado,
    };

    if (!initialData) {
      data.dni = dni;
      data.matricula = matricula;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Nombre */}
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full border rounded px-3 py-2"
        required
      />

      {/* DNI y Matrícula solo en crear */}
      {!initialData && (
        <>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            placeholder="DNI (8 dígitos)"
            className="w-full border rounded px-3 py-2"
            required
            maxLength={8}
          />
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ""))}
            placeholder="Matrícula (4 dígitos)"
            className="w-full border rounded px-3 py-2"
            required
            maxLength={4}
          />
        </>
      )}

      {/* Especialidad */}
      <select
        value={especialidadId}
        onChange={(e) => setEspecialidadId(e.target.value as Id<"especialidades">)}
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

      {/* Contacto */}
      <input
        type="email"
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        placeholder="Contacto (ej: usuario@gmail.com)"
        className="w-full border rounded px-3 py-2"
        required
      />

      {/* Obras Sociales */}
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

      {/* Estado */}
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
        className="w-full border rounded px-3 py-2"
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
      </select>

      {/* Botones */}
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

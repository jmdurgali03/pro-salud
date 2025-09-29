"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import type { Profesional, ProfesionalInput } from "./page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput & { dni?: string; matricula?: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
  onClientError?: (msg: string | null) => void;
};

const sanitizeNombre = (v: string) =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]/g, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");
const isNombreValido = (v: string) =>
  /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+(?:\s[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/.test(v);

export default function ProfesionalForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
  onClientError,
}: Props) {
  const especialidades = useQuery(api.especialidades.listar);
  const obrasSociales = useQuery(api.obrasSociales.listar);

  if (!especialidades || !obrasSociales) return <p className="text-gray-500">Cargando datos...</p>;

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [dni, setDni] = useState(initialData?.dni ?? "");
  const [matricula, setMatricula] = useState(initialData?.matricula ?? "");
  const [especialidadId, setEspecialidadId] = useState<Id<"especialidades"> | "">(
    initialData?.especialidadId ?? ""
  );
  const [contacto, setContacto] = useState(initialData?.contacto ?? "");
  const [telefono, setTelefono] = useState(
    (initialData?.telefono ?? "").replace(/\D/g, "").slice(0, 10)
  );
  const [obrasSeleccionadas, setObrasSeleccionadas] = useState<Id<"obrasSociales">[]>(
    initialData?.obrasSociales ?? []
  );
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(initialData?.estado ?? "Activo");

  const handleObraSocialChange = (id: Id<"obrasSociales">) => {
    setObrasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(os => os !== id) : [...prev, id]
    );
  };

  const fail = (msg: string) => onClientError?.(msg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNombreValido(nombre.trim()))
      return fail("El nombre solo puede contener letras y espacios (sin números ni símbolos).");
    if (telefono.length !== 10) return fail("El teléfono debe tener exactamente 10 dígitos.");
    if (!initialData) {
      if (dni.length !== 8) return fail("El DNI debe tener exactamente 8 dígitos.");
      if (matricula.length !== 4) return fail("La matrícula debe tener exactamente 4 dígitos.");
    }
    onClientError?.(null);

    const data: any = {
      nombre: nombre.trim(),
      especialidadId: especialidadId as Id<"especialidades">,
      contacto,
      telefono,
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
        onChange={(e) => setNombre(sanitizeNombre(e.target.value))}
        placeholder="Nombre"
        className="w-full border rounded px-3 py-2"
        required
        maxLength={60}
        pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+(?:\s[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*"
        title="Solo letras y espacios. Ej: Juan Pérez"
      />

      {/* DNI y Matrícula solo en creación */}
      {!initialData && (
        <>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="DNI (8 dígitos)"
            className="w-full border rounded px-3 py-2"
            required
            maxLength={8}
            pattern="\d{8}"
            title="Debe contener 8 dígitos"
          />
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Matrícula (4 dígitos)"
            className="w-full border rounded px-3 py-2"
            required
            maxLength={4}
            pattern="\d{4}"
            title="Debe contener 4 dígitos"
          />
        </>
      )}

      {/* Especialidad solo en creación */}
      {!initialData && (
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
      )}

      {/* Contacto */}
      <input
        type="email"
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
        placeholder="Contacto (ej: usuario@gmail.com)"
        className="w-full border rounded px-3 py-2"
        required
      />

      {/* Teléfono */}
      <input
        type="tel"
        inputMode="numeric"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder="Teléfono (10 dígitos)"
        className="w-full border rounded px-3 py-2"
        required
        maxLength={10}
        pattern="\d{10}"
        title="Debe contener exactamente 10 dígitos"
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
          className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

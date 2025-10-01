"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import type { Profesional, ProfesionalInput } from "./page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/* --------------------------- Props --------------------------- */
type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput & { dni?: string; matricula?: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
  onClientError?: (msg: string | null) => void;
};

/* --------------------------- Validador --------------------------- */
const sanitizeNombre = (v: string) =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]/g, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");
const isNombreValido = (v: string) =>
  /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+(?:\s[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/.test(v);

/* --------------------------- Dropdown Obras Sociales --------------------------- */
function ObrasSocialesDropdown({
  obrasSociales,
  selectedIds,
  onToggle,
  error,
}: {
  obrasSociales: any[];
  selectedIds: Id<"obrasSociales">[];
  onToggle: (id: Id<"obrasSociales">) => void;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedNames = (obrasSociales || [])
    .filter((os) => selectedIds.includes(os._id))
    .map((os) => os.nombre);

  return (
    <div className="relative">
      <label className="text-sm text-gray-800 block mb-1">Obras Sociales</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-lg p-2 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <span className="text-gray-900">
          {selectedNames.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {selectedNames.map((name, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700"
                >
                  {name}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-gray-500">Seleccionar obras sociales...</span>
          )}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {(obrasSociales || []).length > 0 ? (
            obrasSociales.map((os) => (
              <label
                key={os._id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(os._id)}
                  onChange={() => onToggle(os._id)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-gray-300"
                />
                <span className="text-gray-900 flex-1">{os.nombre}</span>
              </label>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 italic">
              No hay obras sociales disponibles
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/* --------------------------- Formulario --------------------------- */
export default function ProfesionalForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
  onClientError,
}: Props) {
  const especialidades = useQuery(api.especialidades.listar);
  const obrasSociales = useQuery(api.obrasSociales.listar);

  if (!especialidades || !obrasSociales)
    return <p className="text-gray-500">Cargando datos...</p>;

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
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(
    initialData?.estado ?? "Activo"
  );

  const fail = (msg: string) => onClientError?.(msg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNombreValido(nombre.trim()))
      return fail("El nombre solo puede contener letras y espacios.");
    if (telefono.length !== 10) return fail("El teléfono debe tener 10 dígitos.");
    if (!initialData) {
      if (dni.length !== 8) return fail("El DNI debe tener 8 dígitos.");
      if (matricula.length !== 4) return fail("La matrícula debe tener 4 dígitos.");
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

  const toggleObraSocial = (id: Id<"obrasSociales">) => {
    setObrasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
      />

      {/* DNI + Matrícula + Especialidad solo al crear */}
      {!initialData && (
        <>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="DNI (8 dígitos)"
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Matrícula (4 dígitos)"
            className="w-full border rounded px-3 py-2"
            required
          />
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
        </>
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
      />

      {/* Obras Sociales Dropdown */}
      <ObrasSocialesDropdown
        obrasSociales={obrasSociales || []}
        selectedIds={obrasSeleccionadas}
        onToggle={toggleObraSocial}
      />

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

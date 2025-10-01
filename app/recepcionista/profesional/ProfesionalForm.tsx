"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import type { Profesional, ProfesionalInput } from "./page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown, Check } from "lucide-react";

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

const sanitizeApellido = (v: string) =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]/g, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");
const isApellidoValido = (v: string) =>
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedNames = (obrasSociales || [])
    .filter((os) => selectedIds.includes(os._id))
    .map((os) => os.nombre);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="text-sm font-medium text-gray-700 block mb-2">
        Obras Sociales
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-xl px-4 py-3 text-left flex items-center justify-between bg-white hover:border-blue-400 transition-all ${error ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          } focus:outline-none focus:ring-2`}
      >
        <span className="flex-1">
          {selectedNames.length > 0 ? (
            <span className="flex flex-wrap gap-2">
              {selectedNames.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200"
                >
                  {name}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-gray-400">Seleccionar obras sociales...</span>
          )}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ml-2 flex-shrink-0 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {(obrasSociales || []).length > 0 ? (
            obrasSociales.map((os) => {
              const isSelected = selectedIds.includes(os._id);
              return (
                <label
                  key={os._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                    }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-gray-900 flex-1 text-sm font-medium">{os.nombre}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(os._id)}
                    className="sr-only"
                  />
                </label>
              );
            })
          ) : (
            <div className="px-4 py-6 text-sm text-gray-500 text-center italic">
              No hay obras sociales disponibles
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
        {error}
      </p>}
    </div>
  );
}

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [apellido, setApellido] = useState(initialData?.apellido ?? "");
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
    if (!isApellidoValido(apellido.trim()))
      return fail("El apellido solo puede contener letras y espacios.");
    if (telefono.length !== 10) return fail("El teléfono debe tener 10 dígitos.");
    if (!initialData) {
      if (dni.length !== 8) return fail("El DNI debe tener 8 dígitos.");
      if (matricula.length !== 4) return fail("La matrícula debe tener 4 dígitos.");
    }
    onClientError?.(null);

    const data: any = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <input
        value={nombre}
        onChange={(e) => setNombre(sanitizeNombre(e.target.value))}
        placeholder="Nombre"
        className="w-full border rounded px-3 py-2"
        required
        maxLength={60}
      />

      {/* Apellido */}
      <input
        value={apellido}
        onChange={(e) => setApellido(sanitizeApellido(e.target.value))}
        placeholder="Apellido"
        className="w-full border rounded px-3 py-2"
        required
        maxLength={60}
      />

      {/* DNI + Matrícula + Especialidad solo al crear */}
      {!initialData && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                DNI
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="12345678"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Matrícula
              </label>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Especialidad
            </label>
            <div className="relative">
              <select
                value={especialidadId}
                onChange={(e) => setEspecialidadId(e.target.value as Id<"especialidades">)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none bg-white"
                required
              >
                <option value="">Seleccionar especialidad</option>
                {especialidades.map((esp) => (
                  <option key={esp._id} value={esp._id}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </>
      )}

      {/* Contacto */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Correo electrónico
        </label>
        <input
          type="email"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          placeholder="usuario@ejemplo.com"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          required
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Teléfono
        </label>
        <input
          type="tel"
          inputMode="numeric"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="1234567890"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          required
        />
        <p className="text-xs text-gray-500 mt-1.5">10 dígitos sin espacios ni guiones</p>
      </div>

      {/* Obras Sociales Dropdown */}
      <ObrasSocialesDropdown
        obrasSociales={obrasSociales || []}
        selectedIds={obrasSeleccionadas}
        onToggle={toggleObraSocial}
      />

      {/* Estado */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Estado
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEstado("Activo")}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${estado === "Activo"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
          >
            Activo
          </button>
          <button
            type="button"
            onClick={() => setEstado("Inactivo")}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${estado === "Inactivo"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
          >
            Inactivo
          </button>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </span>
          ) : (
            "Guardar"
          )}
        </button>
      </div>
    </form>
  );
}
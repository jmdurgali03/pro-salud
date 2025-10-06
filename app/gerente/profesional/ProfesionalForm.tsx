"use client";

import { useQuery } from "convex/react";
import type { Profesional, ProfesionalInput } from "./page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput & { dni?: string; matricula?: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
  onClientError?: (msg: string | null) => void;
};

const sanitizeNombre = (v: string) =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");

const isNombreValido = (v: string) =>
  /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+(?:\s[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/.test(v);

const sanitizeApellido = (v: string) =>
  v.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");

const isApellidoValido = (v: string) =>
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
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(initialData?.estado ?? "Activo");

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

  const handleObraSocialChange = (id: Id<"obrasSociales">) => {
    setObrasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((os) => os !== id) : [...prev, id]
    );
  };

  const fail = (msg: string) => onClientError?.(msg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNombreValido(nombre.trim()))
      return fail("El nombre solo puede contener letras y espacios (sin números ni símbolos).");
    if (!isApellidoValido(apellido.trim()))
      return fail("El apellido solo puede contener letras y espacios (sin números ni símbolos).");
    if (telefono.length !== 10) return fail("El teléfono debe tener exactamente 10 dígitos.");
    if (!initialData) {
      if (dni.length !== 8) return fail("El DNI debe tener exactamente 8 dígitos.");
      if (matricula.length !== 4) return fail("La matrícula debe tener exactamente 4 dígitos.");
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

  if (!especialidades || !obrasSociales) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const selectedNames = (obrasSociales ?? [])
    .filter((os) => obrasSeleccionadas.includes(os._id))
    .map((os) => os.nombre);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            value={nombre}
            onChange={(e) => setNombre(sanitizeNombre(e.target.value))}
            placeholder="Ej: Juan Carlos"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            required
            maxLength={60}
            pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+(?:\s[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*"
            title="Solo letras y espacios"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            value={apellido}
            onChange={(e) => setApellido(sanitizeApellido(e.target.value))}
            placeholder="Ej: Pérez González"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            required
            maxLength={60}
            pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+(?:\s[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*"
            title="Solo letras y espacios"
          />
        </div>
      </div>

      {/* DNI y Matrícula (solo crear) */}
      {!initialData && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              DNI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="12345678"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              maxLength={8}
              pattern="\d{8}"
              title="8 dígitos numéricos"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Matrícula <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              maxLength={4}
              pattern="\d{4}"
              title="4 dígitos numéricos"
            />
          </div>
        </div>
      )}

      {/* Especialidad */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Especialidad <span className="text-red-500">*</span>
        </label>
        <select
          value={especialidadId}
          onChange={(e) => setEspecialidadId(e.target.value as Id<"especialidades">)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
          required
        >
          <option value="">Seleccionar especialidad...</option>
          {(especialidades ?? []).map((esp) => (
            <option key={esp._id} value={esp._id}>
              {esp.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Contacto y Teléfono */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contacto (Email) <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            placeholder="usuario@ejemplo.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="3871234567"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            required
            maxLength={10}
            pattern="\d{10}"
            title="10 dígitos numéricos"
          />
        </div>
      </div>

      {/* Obras Sociales */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Obras Sociales
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full border border-gray-300 rounded-lg p-3 text-left flex items-center justify-between bg-white hover:border-gray-400 transition-all focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <span className="text-sm">
            {selectedNames.length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {selectedNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
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
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {(obrasSociales ?? []).length > 0 ? (
              obrasSociales.map((os) => (
                <label
                  key={os._id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors border-b last:border-b-0"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={obrasSeleccionadas.includes(os._id)}
                      onChange={() => handleObraSocialChange(os._id)}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    {obrasSeleccionadas.includes(os._id) && (
                      <Check className="w-3 h-3 text-white absolute left-1 pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm text-gray-900 flex-1">{os.nombre}</span>
                </label>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 italic text-center">
                No hay obras sociales disponibles
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="Activo"
              checked={estado === "Activo"}
              onChange={(e) => setEstado(e.target.value as "Activo")}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Activo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="Inactivo"
              checked={estado === "Inactivo"}
              onChange={(e) => setEstado(e.target.value as "Inactivo")}
              className="w-4 h-4 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Inactivo</span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-60 transition-all"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 transition-all shadow-md"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
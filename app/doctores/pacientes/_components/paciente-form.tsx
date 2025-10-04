"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ObrasSocialesDropdown } from "./obras-sociales-dropdown";

export type PacienteFormValues = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  fechaNacimiento: string;
  genero: "Masculino" | "Femenino";
  obrasSociales: Id<"obrasSociales">[];
};

type PacienteFormState = Omit<PacienteFormValues, "genero"> & {
  genero: "" | "Masculino" | "Femenino";
};

type PacienteFormProps = {
  title: string;
  initialValues?: Partial<PacienteFormValues>;
  obrasSociales: Array<{ _id: Id<"obrasSociales">; nombre: string }>;
  onSubmit: (values: PacienteFormValues) => void;
  onCancel: () => void;
};

export function PacienteForm({
  title,
  initialValues = {},
  obrasSociales,
  onSubmit,
  onCancel,
}: PacienteFormProps) {
  const [form, setForm] = useState<PacienteFormState>({
    nombre: initialValues.nombre ?? "",
    apellido: initialValues.apellido ?? "",
    email: initialValues.email ?? "",
    telefono: initialValues.telefono ?? "",
    dni: initialValues.dni ?? "",
    fechaNacimiento: initialValues.fechaNacimiento ?? "",
    genero: initialValues.genero ?? "",
    obrasSociales: initialValues.obrasSociales ?? [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof PacienteFormState, value: string | Id<"obrasSociales">[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleObraSocial = (id: Id<"obrasSociales">) => {
    setForm((prev) => ({
      ...prev,
      obrasSociales: prev.obrasSociales.includes(id)
        ? prev.obrasSociales.filter((current) => current !== id)
        : [...prev.obrasSociales, id],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    }
     if (!form.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio.";
    }

    if (!form.dni.trim()) {
      newErrors.dni = "El DNI es obligatorio.";
    } else if (form.dni.length > 8) {
      newErrors.dni = "El DNI no puede tener más de 8 caracteres.";
    } else if (!/^\d+$/.test(form.dni)) {
      newErrors.dni = "El DNI solo puede contener números.";
    }

    if (!form.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\+?\d*$/.test(form.telefono)) {
      newErrors.telefono = "El formato del teléfono no es válido. Solo puede contener números y un '+' opcional al inicio.";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "El formato del email no es válido.";
    }

    if (!form.fechaNacimiento?.trim()) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    }

    if (!form.genero) {
      newErrors.genero = "Selecciona el género.";
    }

    if (form.obrasSociales.length === 0) {
      newErrors.obrasSociales = "Debe seleccionar al menos una obra social. Si no tiene cobertura, seleccione 'Particular'.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const generoNormalizado: "Masculino" | "Femenino" = form.genero === "Femenino" ? "Femenino" : "Masculino";
    const { nombre, apellido, email, telefono, dni, fechaNacimiento, obrasSociales } = form;
    const payload: PacienteFormValues = {
      nombre,
      apellido,
      email,
      telefono,
      dni,
      fechaNacimiento,
      genero: generoNormalizado,
      obrasSociales,
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">Complete la información del paciente</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
       <div className="sm:col-span-2">
  <label className="text-sm font-semibold text-gray-700 block mb-2">Nombres</label>
  <input
    value={form.nombre}
    onChange={(e) => handleChange("nombre", e.target.value)}
    className={`w-full border rounded-xl p-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
      errors.nombre ? "border-red-300 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400"
    }`}
    placeholder="Ej: Juan Jose"
    required
  />
  {errors.nombre && (
    <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.nombre}</p>
  )}
</div>

<div className="sm:col-span-2">
  <label className="text-sm font-semibold text-gray-700 block mb-2">Apellidos</label>
  <input
    value={form.apellido}
    onChange={(e) => handleChange("apellido", e.target.value)}
    className={`w-full border rounded-xl p-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
      errors.apellido ? "border-red-300 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400"
    }`}
    placeholder="Ej: Gonzalez Pérez"
    required
  />
  {errors.apellido && (
    <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.apellido}</p>
  )}
</div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">DNI</label>
          <input
            value={form.dni}
            onChange={(e) => handleChange("dni", e.target.value)}
            className={`w-full border rounded-xl p-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
              errors.dni ? "border-red-300 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400"
            }`}
            placeholder="12345678"
            maxLength={8}
            required
          />
          {errors.dni && <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.dni}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Fecha de Nacimiento</label>
          <input
            type="date"
            value={form.fechaNacimiento || ""}
            onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
            className={`w-full border rounded-xl p-3 text-gray-900 transition-all duration-200 ${
              errors.fechaNacimiento ? "border-red-300 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400"
            }`}
            required
          />
          {errors.fechaNacimiento && (
            <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.fechaNacimiento}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Género</label>
          <div className="flex items-center gap-3">
            <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${form.genero === "Masculino" ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input
                type="radio"
                name="genero"
                value="Masculino"
                checked={form.genero === "Masculino"}
                onChange={() => handleChange("genero", "Masculino")}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Masculino</span>
            </label>
            <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${form.genero === "Femenino" ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input
                type="radio"
                name="genero"
                value="Femenino"
                checked={form.genero === "Femenino"}
                onChange={() => handleChange("genero", "Femenino")}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Femenino</span>
            </label>
          </div>
          {errors.genero && <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.genero}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Teléfono</label>
          <input
            value={form.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            className={`w-full border rounded-xl p-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
              errors.telefono ? "border-red-300 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400"
            }`}
            placeholder="+54 9 387 1234567"
            required
          />
          {errors.telefono && (
            <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.telefono}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full border rounded-xl p-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
              errors.email ? "border-red-300 ring-2 ring-red-200" : "border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400"
            }`}
            placeholder="ejemplo@email.com"
            required
          />
          {errors.email && <p className="text-xs text-red-600 mt-1.5 ml-1">{errors.email}</p>}
        </div>

        <div className="sm:col-span-2">
          <ObrasSocialesDropdown
            obrasSociales={obrasSociales || []}
            selectedIds={form.obrasSociales}
            onToggle={toggleObraSocial}
            error={errors.obrasSociales}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

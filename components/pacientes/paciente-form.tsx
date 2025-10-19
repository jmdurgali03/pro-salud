"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export type PacienteFormValues = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  fechaNacimiento: string;
  genero: "Masculino" | "Femenino" | "Otro";
  obrasSociales: Id<"obrasSociales">[];
};

type PacienteFormState = Omit<PacienteFormValues, "genero"> & {
  genero: "" | "Masculino" | "Femenino" | "Otro";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (
    field: keyof PacienteFormState,
    value: string | Id<"obrasSociales">[]
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleObraSocial = (id: Id<"obrasSociales">) => {
    setForm((prev) => ({
      ...prev,
      obrasSociales: prev.obrasSociales.includes(id)
        ? prev.obrasSociales.filter((i) => i !== id)
        : [...prev.obrasSociales, id],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!form.apellido.trim()) newErrors.apellido = "El apellido es obligatorio.";
    if (!form.dni.trim()) newErrors.dni = "El DNI es obligatorio.";
    else if (form.dni.length > 8)
      newErrors.dni = "El DNI no puede tener más de 8 caracteres.";
    else if (!/^\d+$/.test(form.dni))
      newErrors.dni = "El DNI solo puede contener números.";

    if (!form.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio.";
    else if (!/^\+?\d*$/.test(form.telefono))
      newErrors.telefono =
        "El formato del teléfono no es válido. Solo puede contener números y un '+' opcional al inicio.";
    else if (form.telefono.replace(/\D/g, "").length > 10)
      newErrors.telefono = "El teléfono no puede tener más de 10 dígitos.";

    if (!form.email.trim()) newErrors.email = "El email es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "El formato del email no es válido.";

    if (!form.fechaNacimiento?.trim())
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    if (!form.genero) newErrors.genero = "Selecciona el género.";
    if (form.obrasSociales.length === 0)
      newErrors.obrasSociales =
        "Debe seleccionar al menos una obra social. Si no tiene cobertura, seleccione 'Particular'.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: PacienteFormValues = {
      ...form,
      genero: form.genero === "Femenino"
        ? "Femenino"
        : form.genero === "Otro"
        ? "Otro"
        : "Masculino",
    };
    onSubmit(payload);
  };

  return (
    <div className="max-w-2xl w-full mx-auto flex flex-col max-h-[85vh]">
      <div className="overflow-y-auto px-2 sm:px-4 space-y-6 pb-6">
        <div className="mt-2 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Complete la información del paciente
          </p>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre y Apellido */}
          {[
            { label: "Nombres", key: "nombre", placeholder: "Ej: Juan José" },
            { label: "Apellidos", key: "apellido", placeholder: "Ej: Gonzalez Pérez" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="sm:col-span-2">
              <label className="text-sm font-semibold text-gray-700 block mb-2">{label}</label>
              <input
                value={form[key as keyof PacienteFormState] as string}
                onChange={(e) => handleChange(key as keyof PacienteFormState, e.target.value)}
                placeholder={placeholder}
                className={`w-full border rounded-xl p-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ${
                  errors[key]
                    ? "border-red-300 ring-2 ring-red-200"
                    : "border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400"
                }`}
              />
              {errors[key] && (
                <p className="text-xs text-red-600 mt-1 ml-1">{errors[key]}</p>
              )}
            </div>
          ))}

          {/* DNI */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">DNI</label>
            <input
              value={form.dni}
              onChange={(e) => handleChange("dni", e.target.value)}
              maxLength={8}
              placeholder="12345678"
              className={`w-full border rounded-xl p-3 text-gray-900 ${
                errors.dni
                  ? "border-red-300 ring-2 ring-red-200"
                  : "border-gray-200 focus:ring-2 focus:ring-green-200"
              }`}
            />
            {errors.dni && <p className="text-xs text-red-600 mt-1 ml-1">{errors.dni}</p>}
          </div>

          {/* Fecha nacimiento */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              className={`w-full border rounded-xl p-3 text-gray-900 ${
                errors.fechaNacimiento
                  ? "border-red-300 ring-2 ring-red-200"
                  : "border-gray-200 focus:ring-2 focus:ring-green-200"
              }`}
            />
            {errors.fechaNacimiento && (
              <p className="text-xs text-red-600 mt-1 ml-1">{errors.fechaNacimiento}</p>
            )}
          </div>

          {/* Género */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Género</label>
            <div className="flex items-center gap-1">
              {["Masculino", "Femenino", "Otro"].map((g) => (
                <label
                  key={g}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                    form.genero === g
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="genero"
                    checked={form.genero === g}
                    onChange={() => handleChange("genero", g)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{g}</span>
                </label>
              ))}
            </div>
            {errors.genero && (
              <p className="text-xs text-red-600 mt-1 ml-1">{errors.genero}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2 ml-3">Teléfono</label>
            <input
              value={form.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              maxLength={10}
              placeholder="Ej: 3871234567"
              className={`w-67 border rounded-xl p-3 text-gray-900 ml-3 ${
                errors.telefono
                  ? "border-red-300 ring-2 ring-red-200"
                  : "border-gray-200 focus:ring-2 focus:ring-green-200"
              }`}
            />
            {errors.telefono && (
              <p className="text-xs text-red-600 mt-1 ml-1">{errors.telefono}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="ejemplo@email.com"
              className={`w-full border rounded-xl p-3 text-gray-900 ${
                errors.email
                  ? "border-red-300 ring-2 ring-red-200"
                  : "border-gray-200 focus:ring-2 focus:ring-green-200"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 ml-1">{errors.email}</p>
            )}
          </div>

          {/* Obras sociales */}
          <div className="relative sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Obras Sociales <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full border rounded-xl p-3 text-left text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all duration-200"
            >
              {form.obrasSociales.length > 0
                ? `${form.obrasSociales.length} seleccionada(s)`
                : "Seleccionar obras sociales (o 'Particular')..."}
            </button>
            {dropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {obrasSociales.map((obra) => (
                  <label
                    key={obra._id}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={form.obrasSociales.includes(obra._id)}
                      onChange={() => toggleObraSocial(obra._id)}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-700">{obra.nombre}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.obrasSociales && (
              <p className="text-xs text-red-600 mt-1 ml-1">{errors.obrasSociales}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t bg-white sticky bottom-0 px-4">
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

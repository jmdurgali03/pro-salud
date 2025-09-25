"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Profesional, ProfesionalInput } from "./page";

type Props = {
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput) => void;
  onCancel: () => void;
};

/* ==== Helpers de validación ==== */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (min: number, max: number) => new RegExp(`^\\d{${min},${max}}$`);

type Errors = Partial<Record<"nombre" | "contacto" | "dni" | "matricula" | "especialidadId", string>>;

export default function ProfesionalForm({ initialData, onSubmit, onCancel }: Props) {
  const especialidades = useQuery(api.especialidades.listar) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

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
  const [estado, setEstado] = useState<"Activo" | "Inactivo">(
    initialData?.estado ?? "Activo"
  );
  const [errors, setErrors] = useState<Errors>({});

  const setErr = (k: keyof Errors, msg?: string) =>
    setErrors((e) => ({ ...e, [k]: msg }));

  const validateAll = () => {
    const e: Errors = {};
    if (!nombre.trim() || nombre.trim().length < 3) e.nombre = "Nombre mínimo 3 caracteres.";
    if (!digits(7, 8).test(dni)) e.dni = "DNI debe tener 7 u 8 dígitos numéricos.";
    if (!digits(4, 4).test(matricula)) e.matricula = "Matrícula debe tener exactamente 4 dígitos.";
    if (!emailRe.test(contacto)) e.contacto = "Correo inválido.";
    if (!especialidadId) e.especialidadId = "Seleccione una especialidad.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 👉 Manejar checkboxes de obras sociales
  const handleObraSocialChange = (id: Id<"obrasSociales">) => {
    setObrasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((os) => os !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const data: ProfesionalInput = {
      nombre,
      dni,
      matricula,
      especialidadId: especialidadId as Id<"especialidades">,
      contacto,
      obrasSociales: obrasSeleccionadas,
      estado,
    };

    onSubmit(data);
  };

  const cls = (k?: keyof Errors) =>
    `w-full border rounded px-3 py-2 ${k && errors[k] ? "border-red-500 focus:outline-red-500" : "border-gray-300"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Nombre */}
      <div>
        <input
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErr("nombre", e.target.value.trim().length >= 3 ? undefined : "Nombre mínimo 3 caracteres.");
          }}
          placeholder="Nombre"
          className={cls("nombre")}
          required
          minLength={3}
          autoComplete="name"
        />
        {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
      </div>

      {/* DNI */}
      <div>
        <input
          value={dni}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setDni(v);
            setErr("dni", digits(7, 8).test(v) ? undefined : "DNI debe tener 7 u 8 dígitos numéricos.");
          }}
          placeholder="DNI"
          className={cls("dni")}
          inputMode="numeric"
          pattern="\d{7,8}"
          required
        />
        {errors.dni && <p className="text-sm text-red-600">{errors.dni}</p>}
      </div>

      {/* Matrícula (4 dígitos) */}
      <div>
        <input
          value={matricula}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setMatricula(v);
            setErr("matricula", digits(4, 4).test(v) ? undefined : "Matrícula debe tener exactamente 4 dígitos.");
          }}
          placeholder="Matrícula (4 dígitos)"
          className={cls("matricula")}
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          required
        />
        {errors.matricula && <p className="text-sm text-red-600">{errors.matricula}</p>}
      </div>

      {/* Especialidad */}
      <div>
        <select
          value={especialidadId}
          onChange={(e) => {
            const v = e.target.value as Id<"especialidades"> | "";
            setEspecialidadId(v);
            setErr("especialidadId", v ? undefined : "Seleccione una especialidad.");
          }}
          className={cls("especialidadId")}
          required
        >
          <option value="">Seleccionar especialidad</option>
          {especialidades.map((esp) => (
            <option key={esp._id} value={esp._id}>
              {esp.nombre}
            </option>
          ))}
        </select>
        {errors.especialidadId && <p className="text-sm text-red-600">{errors.especialidadId}</p>}
      </div>

      {/* Contacto (email) */}
      <div>
        <input
          type="email"
          value={contacto}
          onChange={(e) => {
            setContacto(e.target.value);
            setErr("contacto", emailRe.test(e.target.value) ? undefined : "Correo inválido.");
          }}
          placeholder="Correo (ej: usuario@gmail.com)"
          className={cls("contacto")}
          required
        />
        {errors.contacto && <p className="text-sm text-red-600">{errors.contacto}</p>}
      </div>

      {/* Obras Sociales */}
      <div className="space-y-2">
        <label className="font-medium text-gray-700">Obras Sociales</label>
        <div className="max-h-40 overflow-auto pr-1 space-y-1">
          {obrasSociales.map((os) => (
            <label key={os._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={obrasSeleccionadas.includes(os._id)}
                onChange={() => handleObraSocialChange(os._id)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              {os.nombre}
            </label>
          ))}
        </div>
      </div>

      {/* Estado */}
      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value as "Activo" | "Inactivo")}
        className={cls()}
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
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
          disabled={Object.keys(errors).length > 0}
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

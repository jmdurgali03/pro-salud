"use client";

import { useState } from "react";

// Mock data and types since Convex and Next.js libraries are not available
type Id<T> = string; // Placeholder for a Convex Id
type Paciente = {
  _id: Id<"pacientes">;
  nombreCompleto: string;
  email: string;
  telefono: string;
  dni: string;
  fechaNacimiento: string;
  obrasSociales: Id<"obrasSociales">[];
  obrasSocialesNombres?: string[];
};

type ObraSocial = {
  _id: Id<"obrasSociales">;
  nombre: string;
};

const MOCK_OBRAS_SOCIALES: ObraSocial[] = [
  { _id: "1", nombre: "OSDE" },
  { _id: "2", nombre: "Swiss Medical" },
  { _id: "3", nombre: "Sancor Salud" },
  { _id: "4", nombre: "IPS" },
  { _id: "5", nombre: "Particular" },
];

const MOCK_PACIENTES: Paciente[] = [
  {
    _id: "p1",
    nombreCompleto: "Juan Pérez",
    email: "juan.perez@example.com",
    telefono: "1112345678",
    dni: "12345678",
    fechaNacimiento: "1990-05-15",
    obrasSociales: ["1", "3"],
    obrasSocialesNombres: ["OSDE", "Sancor Salud"],
  },
  {
    _id: "p2",
    nombreCompleto: "María Gómez",
    email: "maria.gomez@example.com",
    telefono: "2223456789",
    dni: "87654321",
    fechaNacimiento: "1985-11-20",
    obrasSociales: ["2"],
    obrasSocialesNombres: ["Swiss Medical"],
  },
  {
    _id: "p3",
    nombreCompleto: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    telefono: "3334567890",
    dni: "98765432",
    fechaNacimiento: "1978-01-25",
    obrasSociales: ["5"],
    obrasSocialesNombres: ["Particular"],
  },
];

// Tipo para el form
type FormState = {
  nombreCompleto: string;
  email: string;
  telefono: string;
  dni: string;
  fechaNacimiento: string;
  obrasSociales: Id<"obrasSociales">[];
};

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const [pacientes, setPacientes] = useState(MOCK_PACIENTES);
  const [seleccionado, setSeleccionado] = useState<any | null>(null);
  const [modo, setModo] = useState<"ver" | "editar" | "crear" | "eliminar" | null>(null);

  const obrasSociales = MOCK_OBRAS_SOCIALES;

  const handleCrear = (form: FormState) => {
    const newPaciente: Paciente = {
      ...form,
      _id: `p${pacientes.length + 1}`,
      obrasSocialesNombres: form.obrasSociales.map(
        (id) => MOCK_OBRAS_SOCIALES.find((os) => os._id === id)?.nombre || "Desconocida"
      ),
    };
    setPacientes((prev) => [...prev, newPaciente]);
    setModo(null);
  };

  const handleActualizar = (id: Id<"pacientes">, form: FormState) => {
    const updatedPacientes = pacientes.map((p) =>
      p._id === id
        ? {
            ...p,
            ...form,
            obrasSocialesNombres: form.obrasSociales.map(
              (osId) => MOCK_OBRAS_SOCIALES.find((os) => os._id === osId)?.nombre || "Desconocida"
            ),
          }
        : p
    );
    setPacientes(updatedPacientes);
    setModo(null);
    setSeleccionado(null);
  };

  const handleEliminar = (id: Id<"pacientes">) => {
    setPacientes((prev) => prev.filter((p) => p._id !== id));
    setModo(null);
  };

  // Filtrado simple por nombre o DNI
  const filteredPacientes = pacientes.filter(
    (p) =>
      p.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
      p.dni.includes(search)
  );

  // Estilos para badges
  const getBadgeClass = (nombre: string) => {
    const base =
      "inline-block px-2 py-0.5 mr-1 rounded-full text-xs font-medium";
    switch (nombre) {
      case "OSDE":
      case "OSDE 310":
        return base + " bg-blue-100 text-blue-700";
      case "Swiss Medical":
        return base + " bg-green-100 text-green-700";
      case "Sancor Salud":
        return base + " bg-purple-100 text-purple-700";
      case "IPS":
        return base + " bg-red-100 text-red-700";
      default:
        return base + " bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Pacientes</h1>
        <button
          onClick={() => setModo("crear")}
          className="flex items-center gap-2 rounded-lg px-4 py-2 bg-cyan-600 text-white font-medium shadow hover:bg-cyan-700 transition-colors"
        >
          + Añadir Paciente
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border mb-6">
        <input
          placeholder="Buscar paciente por nombre, DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr>
              <th className="px-4 py-3">Nombre Completo</th>
              <th className="px-4 py-3">DNI</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Obras Sociales</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPacientes.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{p.nombreCompleto}</div>
                  <div className="text-xs text-gray-500">{p.email ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-gray-900">{p.dni}</td>
                <td className="px-4 py-3 text-gray-900">{p.telefono ?? "-"}</td>
                <td className="px-4 py-3">
                  {p.obrasSocialesNombres?.length > 0 ? (
                    p.obrasSocialesNombres
                      .filter((n): n is string => Boolean(n))
                      .map((nombre, i) => (
                        <span key={i} className={getBadgeClass(nombre)}>
                          {nombre}
                        </span>
                      ))
                  ) : (
                    <span className={getBadgeClass("Particular")}>Particular</span>
                  )}
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => {
                      setSeleccionado(p);
                      setModo("ver");
                    }}
                    className="rounded-md px-3 py-1 text-sm text-cyan-600 hover:bg-cyan-50 transition-colors"
                  >
                    👁 Ver
                  </button>
                  <button
                    onClick={() => {
                      setSeleccionado(p);
                      setModo("editar");
                    }}
                    className="rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      setSeleccionado(p);
                      setModo("eliminar");
                    }}
                    className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {filteredPacientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500 italic">
                  No se encontraron pacientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para ver/editar/crear */}
      {modo && (
        <Modal
          onClose={() => {
            setModo(null);
            setSeleccionado(null);
          }}
        >
          {modo === "ver" && seleccionado && (
            <VerPaciente paciente={seleccionado} />
          )}

          {modo === "crear" && (
            <PacienteForm
              titulo="Nuevo paciente"
              initial={{
                nombreCompleto: "",
                email: "",
                telefono: "",
                dni: "",
                fechaNacimiento: "",
                obrasSociales: [],
              }}
              obrasSociales={obrasSociales}
              onSubmit={handleCrear}
              onCancel={() => setModo(null)}
            />
          )}

          {modo === "editar" && seleccionado && (
            <PacienteForm
              titulo="Editar paciente"
              initial={seleccionado}
              obrasSociales={obrasSociales}
              onSubmit={(form) => handleActualizar(seleccionado._id, form)}
              onCancel={() => {
                setModo(null);
                setSeleccionado(null);
              }}
            />
          )}

          {modo === "eliminar" && seleccionado && (
            <ConfirmacionModal
              onConfirm={() => handleEliminar(seleccionado._id)}
              onCancel={() => setModo(null)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

/* Modal genérico */
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}

/* Modal de confirmación */
function ConfirmacionModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-semibold text-gray-900">¿Estás seguro?</h2>
      <p className="text-gray-700">Esta acción no se puede deshacer.</p>
      <div className="flex justify-center gap-4 pt-2">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 border hover:bg-gray-100 text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

/* Ver paciente */
function VerPaciente({ paciente }: { paciente: any }) {
  const getBadgeClass = (nombre: string) => {
    const base = "inline-block px-2 py-0.5 mr-1 rounded-full text-xs font-medium";
    switch (nombre) {
      case "OSDE":
      case "OSDE 310":
        return base + " bg-blue-100 text-blue-700";
      case "Swiss Medical":
        return base + " bg-green-100 text-green-700";
      case "Sancor Salud":
        return base + " bg-purple-100 text-purple-700";
      case "IPS":
        return base + " bg-red-100 text-red-700";
      default:
        return base + " bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Datos del Paciente</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
        <div>
          <b className="font-semibold text-gray-900">Nombre Completo:</b>
          <p className="text-gray-800">{paciente.nombreCompleto}</p>
        </div>
        <div>
          <b className="font-semibold text-gray-900">DNI:</b>
          <p className="text-gray-800">{paciente.dni}</p>
        </div>
        <div>
          <b className="font-semibold text-gray-900">Teléfono:</b>
          <p className="text-gray-800">{paciente.telefono ?? "-"}</p>
        </div>
        <div>
          <b className="font-semibold text-gray-900">Email:</b>
          <p className="text-gray-800">{paciente.email ?? "-"}</p>
        </div>
        <div>
          <b className="font-semibold text-gray-900">Fecha de Nacimiento:</b>
          <p className="text-gray-800">{paciente.fechaNacimiento ?? "-"}</p>
        </div>
        <div className="sm:col-span-2">
          <b className="font-semibold text-gray-900">Obras Sociales:</b>
          <div className="mt-1">
            {paciente.obrasSocialesNombres?.length > 0 ? (
              paciente.obrasSocialesNombres
                .filter((n: any): n is string => Boolean(n))
                .map((nombre: string, i: number) => (
                  <span key={i} className={getBadgeClass(nombre)}>
                    {nombre}
                  </span>
                ))
            ) : (
              <span className={getBadgeClass("Particular")}>Particular</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/* Formulario de paciente */
function PacienteForm({
  titulo,
  initial,
  obrasSociales,
  onSubmit,
  onCancel,
}: {
  titulo: string;
  initial: any;
  obrasSociales: { _id: Id<"obrasSociales">; nombre: string }[];
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    nombreCompleto: initial.nombreCompleto || "",
    email: initial.email || "",
    telefono: initial.telefono || "",
    dni: initial.dni || "",
    fechaNacimiento: initial.fechaNacimiento || "",
    obrasSociales: initial.obrasSociales || [],
  });
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let newErrors: any = {};
    if (!form.nombreCompleto.trim()) {
      newErrors.nombreCompleto = "El nombre completo es obligatorio.";
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

    if (!form.fechaNacimiento.trim()) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    }

    if (form.obrasSociales.length === 0) {
      newErrors.obrasSociales = "Debe seleccionar al menos una obra social.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleObraSocial = (id: Id<"obrasSociales">) => {
    setForm((f) => ({
      ...f,
      obrasSociales: f.obrasSociales.includes(id)
        ? f.obrasSociales.filter((x) => x !== id)
        : [...f.obrasSociales, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-800">Nombre Completo</label>
          <input
            value={form.nombreCompleto}
            onChange={(e) => handleChange("nombreCompleto", e.target.value)}
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${errors.nombreCompleto ? "border-red-500" : ""}`}
            required
          />
          {errors.nombreCompleto && <p className="text-xs text-red-500 mt-1">{errors.nombreCompleto}</p>}
        </div>
        <div>
          <label className="text-sm text-gray-800">DNI</label>
          <input
            value={form.dni}
            onChange={(e) => handleChange("dni", e.target.value)}
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${
              errors.dni ? "border-red-500" : ""
            }`}
            maxLength={8}
            required
          />
          {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni}</p>}
        </div>
        <div>
          <label className="text-sm text-gray-800">Teléfono</label>
          <input
            value={form.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${errors.telefono ? "border-red-500" : ""}`}
            required
          />
          {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
        </div>
        <div>
          <label className="text-sm text-gray-800">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${
              errors.email ? "border-red-500" : ""
            }`}
            required
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="text-sm text-gray-800">Fecha de Nacimiento</label>
          <input
            type="date"
            value={form.fechaNacimiento || ""}
            onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${errors.fechaNacimiento ? "border-red-500" : ""}`}
            required
          />
          {errors.fechaNacimiento && <p className="text-xs text-red-500 mt-1">{errors.fechaNacimiento}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-800">Obras Sociales</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {obrasSociales.map((os) => (
              <label key={os._id} className="flex items-center gap-2 text-gray-900">
                <input
                  type="checkbox"
                  checked={form.obrasSociales.includes(os._id)}
                  onChange={() => toggleObraSocial(os._id)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                {os.nombre}
              </label>
            ))}
          </div>
          {errors.obrasSociales && <p className="text-xs text-red-500 mt-1">{errors.obrasSociales}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 border hover:bg-gray-100 text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg px-4 py-2 bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

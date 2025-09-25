"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation"; // ⬅️ cambiar


// Tipo para el form
type FormState = {
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  dni: string;
  fechaNacimiento?: string;
  obrasSociales: Id<"obrasSociales">[];
};

export default function PacientesPage() {

  const [search, setSearch] = useState("");
  const [seleccionado, setSeleccionado] = useState<any | null>(null);
  const [modo, setModo] = useState<"editar" | "crear" | null>(null);
const router = useRouter();
  // Queries
  const pacientes = useQuery(api.pacientes.listar, { search }) ?? [];
  const obrasSociales = useQuery(api.obrasSociales.listar) ?? [];

  // Mutations
  const crearPaciente = useMutation(api.pacientes.crear);
  const actualizarPaciente = useMutation(api.pacientes.actualizar);
  const eliminarPaciente = useMutation(api.pacientes.eliminar);

  const handleCrear = async (form: FormState) => {
    await crearPaciente(form);
    setModo(null);
  };

  const handleActualizar = async (id: Id<"pacientes">, form: FormState) => {
    await actualizarPaciente({ id, ...form });
    setModo(null);
    setSeleccionado(null);
  };

  const handleEliminar = async (id: Id<"pacientes">) => {
    if (window.confirm("¿Seguro que deseas eliminar este paciente?")) {
      await eliminarPaciente({ id });
    }
  };

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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Gestión de Pacientes
        </h1>
        <button
          onClick={() => setModo("crear")}
          className="flex items-center gap-2 rounded-lg px-4 py-2 bg-cyan-600 text-white font-medium shadow hover:bg-cyan-700"
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
            {pacientes.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {p.nombreCompleto}
                  </div>
                  <div className="text-xs text-gray-500">{p.email ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-gray-900">{p.dni}</td>
                <td className="px-4 py-3 text-gray-900">
                  {p.telefono ?? "-"}
                </td>
                <td className="px-4 py-3">
                  {p.obrasSocialesNombres?.length > 0 ? (
  p.obrasSocialesNombres
    .filter((n): n is string => Boolean(n)) // ⬅️ elimina undefined
    .map((nombre, i) => (
      <span key={i} className={getBadgeClass(nombre)}>
        {nombre}
      </span>
    ))
) : (
  <span className={getBadgeClass("Particular")}>
    Particular
  </span>
)}

                </td>

                <td className="px-4 py-3 text-right space-x-2">
                
                  <button
  onClick={() => router.push(`/pacientes/${p._id}`)}
  className="rounded-md px-3 py-1 text-sm text-cyan-600 hover:bg-cyan-50"
>
  👁 Ver
</button>
                  <button
                    onClick={() => {
                      setSeleccionado(p);
                      setModo("editar");
                    }}
                    className="rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleEliminar(p._id)}
                    className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 italic"
                >
                  No se encontraron pacientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modo && (
        <Modal
          onClose={() => {
            setModo(null);
            setSeleccionado(null);
          }}
        >
          <PacienteForm
            titulo={modo === "crear" ? "Nuevo paciente" : "Editar paciente"}
            initial={
              seleccionado || {
                nombreCompleto: "",
                email: "",
                telefono: "",
                dni: "",
                fechaNacimiento: "",
                obrasSociales: [],
              }
            }
            obrasSociales={obrasSociales}
            onSubmit={(form) =>
              modo === "crear"
                ? handleCrear(form)
                : handleActualizar(seleccionado._id, form)
            }
            onCancel={() => setModo(null)}
          />
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>
        {children}
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
  initial: FormState;
  obrasSociales: { _id: Id<"obrasSociales">; nombre: string }[];
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const handleChange = (field: keyof FormState, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleObraSocial = (id: Id<"obrasSociales">) => {
    setForm((f) => ({
      ...f,
      obrasSociales: f.obrasSociales.includes(id)
        ? f.obrasSociales.filter((x) => x !== id)
        : [...f.obrasSociales, id],
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <h2 className="text-xl font-bold">{titulo}</h2>
      <input
        value={form.nombreCompleto}
        onChange={(e) => handleChange("nombreCompleto", e.target.value)}
        placeholder="Nombre completo"
        className="w-full border rounded-lg p-2"
        required
      />
      <input
        value={form.dni}
        onChange={(e) => handleChange("dni", e.target.value)}
        placeholder="DNI"
        className="w-full border rounded-lg p-2"
        required
      />
      <input
        type="email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
        placeholder="Email"
        className="w-full border rounded-lg p-2"
      />
      <input
        value={form.telefono}
        onChange={(e) => handleChange("telefono", e.target.value)}
        placeholder="Teléfono"
        className="w-full border rounded-lg p-2"
      />
      <input
        type="date"
        value={form.fechaNacimiento || ""}
        onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
        className="w-full border rounded-lg p-2"
      />

      {/* Selección de obras sociales */}
      <div>
        <label className="block font-medium mb-1">Obras Sociales</label>
        {obrasSociales.map((os) => (
          <label key={os._id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.obrasSociales.includes(os._id)}
              onChange={() => toggleObraSocial(os._id)}
            />
            {os.nombre}
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

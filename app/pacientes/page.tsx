"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

import logo from "@/public/logo.png";

type FormState = {
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  dni: string;
  obraSocial: string;
  fechaNacimiento?: string;
};

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const [seleccionado, setSeleccionado] = useState<any | null>(null);
  const [modo, setModo] = useState<"ver" | "editar" | "crear" | null>(null);

  const pacientes = useQuery(api.pacientes.listar, { search });
  const crearPaciente = useMutation(api.pacientes.crear);
  const actualizarPaciente = useMutation(api.pacientes.actualizar);

  const handleCrear = async (form: FormState) => {
    await crearPaciente(form);
    setModo(null);
  };

  const handleActualizar = async (id: Id<"pacientes">, form: FormState) => {
    await actualizarPaciente({ id, ...form });
    setModo(null);
    setSeleccionado(null);
  };

  const handleDelete = useMutation(api.pacientes.eliminar);

  const handleEliminar = async (id: Id<"pacientes">) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar a este paciente?")) {
      await handleDelete({ id });
    }
  };

  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <h1 className="text-2xl font-semibold text-black">Gestión de Pacientes</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModo("crear")}
              className="flex items-center gap-2 rounded-lg px-4 py-2 bg-cyan-600 text-white font-medium shadow hover:bg-cyan-700"
            >
              + Añadir Paciente
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300" />
              <div>
                <p className="text-sm font-medium text-black">Dr. Ana Torres</p>
                <p className="text-xs text-gray-500">Gerente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <input
            placeholder="Buscar paciente por nombre, DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-black placeholder-gray-500"
          />
          <button className="rounded-lg border px-4 py-2 text-black bg-gray-50 hover:bg-gray-100">
            Filtrar por Obra Social ⌄
          </button>
        </div>

        {/* Tabla de pacientes */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">Nombre Completo</th>
                <th className="px-4 py-3">DNI</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Obra Social</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(pacientes ?? []).map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div>
                        <div className="font-medium text-black">{p.nombreCompleto}</div>
                        <div className="text-xs text-gray-500">{p.email ?? ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-black">{p.dni}</td>
                  <td className="px-4 py-3 text-black">{p.telefono ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className="text-black">{p.obraSocial || "Particular"}</span>
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/pacientes/${p._id}`)}
                      className="rounded-md border px-3 py-1 bg-cyan-600 text-white hover:bg-cyan-700"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => {
                        setSeleccionado(p);
                        setModo("editar");
                      }}
                      className="rounded-md border px-3 py-1 hover:bg-gray-100"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleEliminar(p._id)}
                      className="rounded-md border px-3 py-1 hover:bg-gray-100"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
              {(pacientes?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-black">
                    No se encontraron pacientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-700">
            <span>
              Mostrando 1-{pacientes?.length ?? 0} de {pacientes?.length ?? 0} pacientes
            </span>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border rounded hover:bg-gray-100">&lt;</button>
              <button className="px-3 py-1 border rounded bg-cyan-600 text-white">1</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-100">&gt;</button>
            </div>
          </div>
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

            {modo === "editar" && seleccionado && (
              <PacienteForm
                titulo="Editar paciente"
                initial={{
                  nombreCompleto: seleccionado.nombreCompleto,
                  email: seleccionado.email ?? "",
                  telefono: seleccionado.telefono ?? "",
                  dni: seleccionado.dni,
                  obraSocial: seleccionado.obraSocial,
                  fechaNacimiento: seleccionado.fechaNacimiento ?? "",
                }}
                onSubmit={(form) => handleActualizar(seleccionado._id, form)}
                onCancel={() => {
                  setModo(null);
                  setSeleccionado(null);
                }}
              />
            )}

            {modo === "crear" && (
              <PacienteForm
                titulo="Nuevo paciente"
                initial={{
                  nombreCompleto: "",
                  email: "",
                  telefono: "",
                  dni: "",
                  obraSocial: "",
                  fechaNacimiento: "",
                }}
                onSubmit={handleCrear}
                onCancel={() => setModo(null)}
              />
            )}
          </Modal>
        )}
      </main>
    </div>
  );
}

/* Modal */
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
          className="absolute top-2 right-2 text-black hover:text-black"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}

/* Ver paciente */
function VerPaciente({ paciente }: { paciente: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-black">Datos del paciente</h2>
      <div className="text-sm space-y-1">
        <p>
          <b className="text-black">Nombre:</b>{" "}
          <span className="text-black">{paciente.nombreCompleto}</span>
        </p>
        <p>
          <b className="text-black">DNI:</b>{" "}
          <span className="text-black">{paciente.dni}</span>
        </p>
        <p>
          <b className="text-black">Email:</b>{" "}
          <span className="text-black">{paciente.email ?? "-"}</span>
        </p>
        <p>
          <b className="text-black">Teléfono:</b>{" "}
          <span className="text-black">{paciente.telefono ?? "-"}</span>
        </p>
        <p>
          <b className="text-black">Obra Social:</b>{" "}
          <span className="text-black">{paciente.obraSocial ?? "Particular"}</span>
        </p>
        <p>
          <b className="text-black">Fecha de Nacimiento:</b>{" "}
          <span className="text-black">{paciente.fechaNacimiento ?? "-"}</span>
        </p>
      </div>
    </div>
  );
}

/* Formulario paciente */
function PacienteForm({
  titulo,
  initial,
  onSubmit,
  onCancel,
}: {
  titulo: string;
  initial: FormState;
  onSubmit: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    let newErrors: any = {};
    if (!/^\d+$/.test(form.dni)) {
      newErrors.dni = "El DNI solo puede contener números.";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "El formato del email no es válido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-black">{titulo}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-black">Nombre Completo</label>
          <input
            value={form.nombreCompleto}
            onChange={(e) => handleChange("nombreCompleto", e.target.value)}
            className="w-full border rounded-lg p-2 text-black placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="text-sm text-black">DNI</label>
          <input
            value={form.dni}
            onChange={(e) => handleChange("dni", e.target.value)}
            className={`w-full border rounded-lg p-2 text-black placeholder-gray-500 ${
              errors.dni ? "border-red-500" : ""
            }`}
            required
          />
          {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni}</p>}
        </div>
        <div>
          <label className="text-sm text-black">Teléfono</label>
          <input
            value={form.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            className="w-full border rounded-lg p-2 text-black placeholder-gray-500"
          />
        </div>
        <div>
          <label className="text-sm text-black">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full border rounded-lg p-2 text-black placeholder-gray-500 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="text-sm text-black">Fecha de Nacimiento</label>
          <input
            type="date"
            value={form.fechaNacimiento || ""}
            onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
            className="w-full border rounded-lg p-2 text-black placeholder-gray-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-black">Obra Social</label>
          <input
            value={form.obraSocial}
            onChange={(e) => handleChange("obraSocial", e.target.value)}
            className="w-full border rounded-lg p-2 text-black placeholder-gray-500"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 hover:bg-gray-100 text-black"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-lg px-4 py-2 bg-cyan-600 text-white hover:bg-cyan-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

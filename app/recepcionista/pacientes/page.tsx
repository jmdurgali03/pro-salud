"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";

/* --------------------------- Tipos --------------------------- */
type FormState = {
  nombreCompleto: string;
  email: string;
  telefono: string;
  dni: string;
  fechaNacimiento: string;
  obrasSociales: Id<"obrasSociales">[];
};

/* --------------------------- Hook: Debounce --------------------------- */
function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* --------------------------- Página --------------------------- */
export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [seleccionado, setSeleccionado] = useState<any | null>(null);
  const [modo, setModo] = useState<"editar" | "crear" | "eliminar" | null>(null);
  const router = useRouter();

  // Queries (usar el valor debounced para evitar perder foco)
  const pacientesConvex = useQuery(api.pacientes.listar, { search: debouncedSearch });
  const obrasSociales = useQuery(api.obrasSociales.listar);

  // Cache de la última lista válida para que la tabla no parpadee
  const prevPacientesRef = useRef<any[]>([]);
  useEffect(() => {
    if (Array.isArray(pacientesConvex)) {
      prevPacientesRef.current = pacientesConvex;
    }
  }, [pacientesConvex]);

  const isLoadingPac = pacientesConvex === undefined;
  const isLoadingOS = obrasSociales === undefined;

  const filteredPacientes = useMemo(() => {
    return (pacientesConvex ?? prevPacientesRef.current) || [];
  }, [pacientesConvex]);

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
    await eliminarPaciente({ id });
    setModo(null);
  };

  // Estilos para badges
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
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/recepcionista" },
        { label: "Pacientes", href: "/recepcionista/pacientes" },
      ]}
    >
      <div className="min-h-screen bg-gray-50 p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Pacientes</h1>
          <button
            onClick={() => setModo("crear")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 bg-cyan-600 text-white font-medium shadow hover:bg-cyan-700 transition-colors"
            disabled={isLoadingOS}
            title={isLoadingOS ? "Cargando obras sociales..." : ""}
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
          {isLoadingPac && (
            <div className="flex items-center text-sm text-gray-500">Buscando…</div>
          )}
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
              {filteredPacientes.length > 0 ? (
                filteredPacientes.map((p: any) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.nombreCompleto}</div>
                      <div className="text-xs text-gray-500">{p.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{p.dni}</td>
                    <td className="px-4 py-3 text-gray-900">{p.telefono ?? "-"}</td>
                    <td className="px-4 py-3">
                      {Array.isArray(p.obrasSocialesNombres) && p.obrasSocialesNombres.length > 0 ? (
                        p.obrasSocialesNombres
                          .filter((n: any): n is string => Boolean(n))
                          .map((nombre: string, i: number) => (
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
                        onClick={() => router.push(`/recepcionista/pacientes/${p._id}`)}
                        className="rounded-md px-3 py-1 text-sm text-cyan-600 hover:bg-cyan-50 transition-colors"
                        title="Ver"
                      >
                        👁 Ver
                      </button>
                      <button
                        onClick={() => {
                          setSeleccionado(p);
                          setModo("editar");
                        }}
                        className="rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          setSeleccionado(p);
                          setModo("eliminar");
                        }}
                        disabled
                        className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Eliminar (deshabilitado)"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500 italic">
                    {isLoadingPac ? "Cargando pacientes..." : "No se encontraron pacientes"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal para editar/crear/eliminar */}
        {modo && (
          <Modal
            onClose={() => {
              setModo(null);
              setSeleccionado(null);
            }}
          >
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
                obrasSociales={obrasSociales || []}
                onSubmit={handleCrear}
                onCancel={() => setModo(null)}
              />
            )}

            {modo === "editar" && seleccionado && (
              <PacienteForm
                titulo="Editar paciente"
                initial={seleccionado}
                obrasSociales={obrasSociales || []}
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
    </PageWrapper>
  );
}

/* --------------------------- Modal genérico --------------------------- */
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

/* --------------------------- Modal de confirmación --------------------------- */
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

  // Cerrar dropdown al hacer click fuera
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
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

/* --------------------------- Formulario Paciente --------------------------- */
function PacienteForm({
  titulo,
  initial,
  obrasSociales,
  onSubmit,
  onCancel,
}: {
  titulo: string;
  initial: any;
  obrasSociales: any[];
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
    const newErrors: any = {};
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
      newErrors.telefono =
        "El formato del teléfono no es válido. Solo puede contener números y un '+' opcional al inicio.";
    }

    if (!form.email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "El formato del email no es válido.";
    }

    if (!form.fechaNacimiento?.trim()) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
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
    if (validate()) onSubmit(form);
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
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${
              errors.nombreCompleto ? "border-red-500" : ""
            }`}
            required
          />
          {errors.nombreCompleto && (
            <p className="text-xs text-red-500 mt-1">{errors.nombreCompleto}</p>
          )}
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
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${
              errors.telefono ? "border-red-500" : ""
            }`}
            required
          />
          {errors.telefono && (
            <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
          )}
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
            className={`w-full border rounded-lg p-2 text-gray-900 placeholder-gray-500 ${
              errors.fechaNacimiento ? "border-red-500" : ""
            }`}
            required
          />
          {errors.fechaNacimiento && (
            <p className="text-xs text-red-500 mt-1">{errors.fechaNacimiento}</p>
          )}
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
          className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 transition-colors"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

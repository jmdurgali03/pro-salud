"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { PacientesHeader } from "./_components/pacientes-header";
import { PacientesSearchBar } from "./_components/pacientes-search";
import { PacientesTable } from "./_components/pacientes-table";
import { PacientesObrasFilter } from "./_components/pacientes-obras-filter";
import { PacienteForm, PacienteFormValues } from "./_components/paciente-form";
import { ModalContainer } from "../_components/modal-container";
import { ConfirmDialog } from "../_components/confirm-dialog";
import { PacienteRecord } from "./types";

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [seleccionado, setSeleccionado] = useState<PacienteRecord | null>(null);
  const [modo, setModo] = useState<"editar" | "crear" | "eliminar" | null>(null);
  const [obrasFilter, setObrasFilter] = useState<Id<"obrasSociales">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const pacientesConvex = useQuery(api.pacientes.listar, {}) as PacienteRecord[] | undefined;
  const obrasSocialesQuery = useQuery(api.obrasSociales.listar);
  const obrasSociales = (obrasSocialesQuery ?? []) as Array<{
    _id: Id<"obrasSociales">;
    nombre: string;
  }>;

  const prevPacientesRef = useRef<PacienteRecord[]>([]);
  useEffect(() => {
    if (Array.isArray(pacientesConvex)) {
      prevPacientesRef.current = pacientesConvex;
    }
  }, [pacientesConvex]);

  const isLoadingPac = pacientesConvex === undefined;
  const isLoadingOS = obrasSocialesQuery === undefined;

  const filteredPacientes = useMemo(() => {
    const base = (pacientesConvex ?? prevPacientesRef.current) || [];
    const lista = Array.isArray(base) ? (base as PacienteRecord[]) : [];
    const termino = debouncedSearch.trim();
    if (!termino && obrasFilter.length === 0) return lista;

    const terminoNormalizado = termino.toLowerCase();
    const coincide = (valor?: string | number | null) => {
      if (valor === undefined || valor === null) return false;
      const comoTexto = typeof valor === "string" ? valor.trim() : String(valor);
      return comoTexto.toLowerCase().includes(terminoNormalizado);
    };

    return lista.filter((paciente) => {
      const coincideObras =
        obrasFilter.length === 0 || obrasFilter.every((id) => (paciente.obrasSociales ?? []).includes(id));

      if (!coincideObras) return false;

      if (!termino) return true;

      return (
        coincide(paciente.nombreCompleto) ||
        coincide(paciente.dni) ||
        coincide(paciente.email) ||
        coincide(paciente.telefono) ||
        coincide(paciente.fechaNacimiento) ||
        coincide(paciente.genero) ||
        (paciente.obrasSocialesNombres ?? []).some((nombre) => coincide(nombre))
      );
    });
  }, [pacientesConvex, debouncedSearch, obrasFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, obrasFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredPacientes.length / pageSize));
  const paginatedPacientes = filteredPacientes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const crearPaciente = useMutation(api.pacientes.crear);
  const actualizarPaciente = useMutation(api.pacientes.actualizar);
  const eliminarPaciente = useMutation(api.pacientes.eliminar);

  const closeModal = () => {
    setModo(null);
    setSeleccionado(null);
  };

const sanitizeForm = (form: PacienteFormValues) => ({
  ...form,
  nombreCompleto: form.nombreCompleto.trim(),
  email: form.email.trim(),
  telefono: form.telefono.trim(),
  dni: form.dni.trim(),
  fechaNacimiento: form.fechaNacimiento.trim() || undefined,
});

  const handleCrear = async (form: PacienteFormValues) => {
    await crearPaciente(sanitizeForm(form));
    closeModal();
  };

  const handleActualizar = async (id: Id<"pacientes">, form: PacienteFormValues) => {
    await actualizarPaciente({ id, ...sanitizeForm(form) });
    closeModal();
  };

  const handleEliminar = async (id: Id<"pacientes">) => {
    await eliminarPaciente({ id });
    closeModal();
  };

  const handleVer = (id: Id<"pacientes">) => {
    router.push(`/recepcionista/pacientes/${id}`);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/recepcionista" },
        { label: "Pacientes", href: "/recepcionista/pacientes" },
      ]}
    >
      <div className="w-full">
        <div className="w-full px-6 py-8 space-y-6">
          <PacientesHeader onCreate={() => setModo("crear")} disableCreate={isLoadingOS} />
          <PacientesSearchBar value={search} onChange={setSearch} isLoading={isLoadingPac} />
          <PacientesObrasFilter
            obrasSociales={obrasSociales}
            selectedIds={obrasFilter}
            onChange={setObrasFilter}
            disabled={isLoadingOS}
          />
          <PacientesTable
            pacientes={paginatedPacientes}
            onView={handleVer}
            onEdit={(paciente) => {
              setSeleccionado(paciente);
              setModo("editar");
            }}
            onDelete={(paciente) => {
              setSeleccionado(paciente);
              setModo("eliminar");
            }}
            searchTerm={debouncedSearch}
            isLoading={isLoadingPac}
          />
        </div>

        {modo && (
          <ModalContainer onClose={closeModal}>
            {modo === "crear" && (
              <PacienteForm
                title="Nuevo Paciente"
                obrasSociales={obrasSociales}
                onSubmit={handleCrear}
                onCancel={closeModal}
              />
            )}

            {modo === "editar" && seleccionado && (
              <PacienteForm
                title="Editar Paciente"
                initialValues={{
                  ...seleccionado,
                  email: seleccionado.email ?? "",
                  telefono: seleccionado.telefono ?? "",
                  fechaNacimiento: seleccionado.fechaNacimiento ?? "",
                  obrasSociales: seleccionado.obrasSociales ?? [],
                  genero: seleccionado.genero ?? "Masculino",
                }}
                obrasSociales={obrasSociales}
                onSubmit={(form) => handleActualizar(seleccionado._id, form)}
                onCancel={closeModal}
              />
            )}

            {modo === "eliminar" && seleccionado && (
              <ConfirmDialog
                description="Esta acción no se puede deshacer. El paciente será eliminado permanentemente."
                confirmLabel="Eliminar"
                onConfirm={() => handleEliminar(seleccionado._id)}
                onCancel={closeModal}
              />
            )}
          </ModalContainer>
        )}

        {totalPages > 1 && (
          <div className="px-6 pb-10">
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {filteredPacientes.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -
                {Math.min(currentPage * pageSize, filteredPacientes.length)} de {filteredPacientes.length} pacientes
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 min-w-[36px] rounded-lg px-3 text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-green-600 text-white shadow-sm"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

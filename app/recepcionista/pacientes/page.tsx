"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { PacientesHeader } from "./_components/pacientes-header";
import { PacientesSearchBar, ObraSocialOption } from "./_components/pacientes-search";
import { PacientesTable } from "./_components/pacientes-table";
import { PacienteForm, PacienteFormValues } from "./_components/paciente-form";
import { ModalContainer } from "../_components/modal-container";
import { ConfirmDialog } from "../_components/confirm-dialog";
import { PacienteRecord } from "./types";

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [seleccionado, setSeleccionado] = useState<PacienteRecord | null>(null);
  const [modo, setModo] = useState<"editar" | "crear" | "eliminar" | null>(null);
  const router = useRouter();

  const pacientesConvex = useQuery(api.pacientes.listar, {}) as PacienteRecord[] | undefined;
  const obrasSocialesQuery = useQuery(api.obrasSociales.listar);
  const obrasSociales = useMemo(
    () => (obrasSocialesQuery ?? []) as ObraSocialOption[],
    [obrasSocialesQuery]
  );
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<Id<"obrasSociales">[]>([]);

  const prevPacientesRef = useRef<PacienteRecord[]>([]);
  useEffect(() => {
    if (Array.isArray(pacientesConvex)) {
      prevPacientesRef.current = pacientesConvex;
    }
  }, [pacientesConvex]);

  const isLoadingPac = pacientesConvex === undefined;
  const isLoadingOS = obrasSocialesQuery === undefined;

  useEffect(() => {
    setSelectedObrasSociales((current) => {
      const filtered = current.filter((id) =>
        obrasSociales.some((obra) => obra._id === id)
      );
      return filtered.length === current.length ? current : filtered;
    });
  }, [obrasSociales]);

  const toggleObraSocial = useCallback((id: Id<"obrasSociales">) => {
    setSelectedObrasSociales((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }, []);

  const clearObrasSociales = useCallback(() => {
    setSelectedObrasSociales([]);
  }, []);

  const filteredPacientes = useMemo(() => {
    const base = (pacientesConvex ?? prevPacientesRef.current) || [];
    const lista = Array.isArray(base) ? (base as PacienteRecord[]) : [];
    const termino = debouncedSearch.trim();
    const terminoNormalizado = termino.toLowerCase();
    const coincide = (valor?: string | number | null) => {
      if (valor === undefined || valor === null) return false;
      const comoTexto = typeof valor === "string" ? valor.trim() : String(valor);
      return comoTexto.toLowerCase().includes(terminoNormalizado);
    };

    const coincideConBusqueda = (paciente: PacienteRecord) => {
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
    };

    const coincideConObras = (paciente: PacienteRecord) => {
      if (selectedObrasSociales.length === 0) return true;
      const obras = Array.isArray(paciente.obrasSociales) ? paciente.obrasSociales : [];
      return obras.some((obraId) => selectedObrasSociales.includes(obraId));
    };

    return lista.filter((paciente) => coincideConBusqueda(paciente) && coincideConObras(paciente));
  }, [pacientesConvex, debouncedSearch, selectedObrasSociales]);

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
          <PacientesSearchBar
            value={search}
            onChange={setSearch}
            isLoading={isLoadingPac}
            obrasSociales={obrasSociales}
            selectedObrasSociales={selectedObrasSociales}
            onToggleObraSocial={toggleObraSocial}
            onClearObrasSociales={clearObrasSociales}
            isLoadingObrasSociales={isLoadingOS}
          />
          <PacientesTable
            pacientes={filteredPacientes}
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

      </div>
    </PageWrapper>
  );
}

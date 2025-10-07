"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { PacientesHeader } from "@/components/pacientes/pacientes-header";
import { PacientesSearchBar, ObraSocialOption } from "@/components/pacientes/pacientes-search";
import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { PacientesPagination } from "@/components/pacientes/pacientes-pagination";
import { PacienteForm, PacienteFormValues } from "@/components/pacientes/paciente-form";
import { ModalContainer } from "@/components/pacientes/modal-container";
import { PacienteRecord } from "@/components/pacientes/types";
import { PacienteView } from "./paciente-view";


const ITEMS_PER_PAGE = 10;

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [seleccionado, setSeleccionado] = useState<PacienteRecord | null>(null);
  const [modo, setModo] = useState<"editar" | "crear" | "eliminar" | "ver" | null>(null);
  const router = useRouter();

  const pacientesConvex = useQuery(api.pacientes.listar, {}) as PacienteRecord[] | undefined;
  const obrasSocialesQuery = useQuery(api.obrasSociales.listar);
  const obrasSociales = useMemo(
    () => (obrasSocialesQuery ?? []) as ObraSocialOption[],
    [obrasSocialesQuery]
  );
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<Id<"obrasSociales">[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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
    const termino = debouncedSearch.trim().toLowerCase();

    const coincide = (valor?: string | number | null) => {
      if (valor === undefined || valor === null) return false;
      const comoTexto = typeof valor === "string" ? valor.trim() : String(valor);
      return comoTexto.toLowerCase().includes(termino);
    };

    const coincideConBusqueda = (paciente: PacienteRecord) => {
      if (!termino) return true;
      return (
        coincide(paciente.nombre) ||
        coincide(paciente.apellido) ||
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

  const totalPages = useMemo(() => {
    const count = filteredPacientes.length;
    return count === 0 ? 1 : Math.ceil(count / ITEMS_PER_PAGE);
  }, [filteredPacientes.length]);

  const clampedPage = Math.min(currentPage, totalPages);

  const paginatedPacientes = useMemo(() => {
    const start = (clampedPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPacientes.slice(start, end);
  }, [filteredPacientes, clampedPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedObrasSociales]);

  useEffect(() => {
    if (currentPage !== clampedPage) {
      setCurrentPage(clampedPage);
    }
  }, [currentPage, clampedPage]);

  const crearPaciente = useMutation(api.pacientes.crear);
  const actualizarPaciente = useMutation(api.pacientes.actualizar);
  const eliminarPaciente = useMutation(api.pacientes.eliminar);

  const closeModal = () => {
    setModo(null);
    setSeleccionado(null);
  };

  const sanitizeForm = (form: PacienteFormValues) => ({
    ...form,
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    email: form.email?.trim() || "",
    telefono: form.telefono?.trim() || "",
    dni: form.dni.trim(),
    fechaNacimiento: form.fechaNacimiento?.trim() || undefined,
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
    const paciente = paginatedPacientes.find(p => p._id === id);
    if (paciente) {
      setSeleccionado(paciente);
      setModo("ver");
    }
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
          <PacientesHeader hideCreateButton />
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
          <PacientesPagination
            currentPage={clampedPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={ITEMS_PER_PAGE}
            totalItems={filteredPacientes.length}
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
                  nombre: seleccionado.nombre ?? "",
                  apellido: seleccionado.apellido ?? "",
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

            {modo === "ver" && seleccionado && (
              <PacienteView paciente={seleccionado} onCancel={closeModal} />
            )}


          </ModalContainer>
        )}
      </div>
    </PageWrapper>
  );
}
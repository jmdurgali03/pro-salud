"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { HistoriasHeader } from "./_components/historias-header";
import { HistoriasSearchBar, ObraSocialOption } from "./_components/historias-search";
import { HistoriasTable } from "./_components/historias-table";
import { HistoriasPagination } from "./_components/historias-pag";

const ITEMS_PER_PAGE = 10;

type PacienteRecord = {
  _id: Id<"pacientes">;
  nombre: string;
  apellido: string;
  dni?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: string;
  obrasSociales?: Id<"obrasSociales">[];
  obrasSocialesNombres?: string[];
};

export default function HistoriasClinicasListaPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
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

  const handleVer = (id: Id<"pacientes">) => {
    router.push(`/recepcionista/historias/${id}`);
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/recepcionista" },
        { label: "Historias Clínicas", href: "/recepcionista/historias" },
      ]}
    >
      <div className="w-full">
        <div className="w-full px-6 py-8 space-y-6">
          <HistoriasHeader />
          <HistoriasSearchBar
            value={search}
            onChange={setSearch}
            isLoading={isLoadingPac}
            obrasSociales={obrasSociales}
            selectedObrasSociales={selectedObrasSociales}
            onToggleObraSocial={toggleObraSocial}
            onClearObrasSociales={clearObrasSociales}
            isLoadingObrasSociales={isLoadingOS}
          />
          <HistoriasTable
            pacientes={paginatedPacientes}
            onView={handleVer}
            searchTerm={debouncedSearch}
            isLoading={isLoadingPac}
          />
          <HistoriasPagination
            currentPage={clampedPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={ITEMS_PER_PAGE}
            totalItems={filteredPacientes.length}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PageWrapper } from "@/components/page-wrapper";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { PacientesHeader } from "@/components/pacientes/pacientes-header";
import { PacientesSearchBar } from "@/components/pacientes/pacientes-search";
import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { PacientesPagination } from "@/components/pacientes/pacientes-pagination";
import { PacienteForm, PacienteFormValues } from "@/components/pacientes/paciente-form";
import { ModalContainer } from "@/components/pacientes/modal-container";
import { PacienteRecord } from "@/components/pacientes/types";
import { CheckCircle2, Search, AlertTriangle } from "lucide-react";
import { PacientesFilterPopover, type OrdenClave, type ObraSocialOption } from "@/components/pacientes/PacientesFilterPopover";
import { PacienteView } from "@/app/gerente/pacientes/paciente-view";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const pageSize = 10;

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [seleccionado, setSeleccionado] = useState<PacienteRecord | null>(null);
  const [modo, setModo] = useState<"editar" | "crear" | "desactivar" | "activar" | "ver" | null>(null);
  const router = useRouter();

  const pacientesConvex = useQuery(api.pacientes.listar, {}) as PacienteRecord[] | undefined;
  const obrasSocialesQuery = useQuery(api.obrasSociales.listar);
  const obrasSociales = useMemo(
    () => (obrasSocialesQuery ?? []) as ObraSocialOption[],
    [obrasSocialesQuery]
  );

  const prevPacientesRef = useRef<PacienteRecord[]>([]);
  useEffect(() => {
    if (Array.isArray(pacientesConvex)) {
      prevPacientesRef.current = pacientesConvex;
    }
  }, [pacientesConvex]);

  // === Filtros ===
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<Id<"obrasSociales">[]>([]);
  const [orden, setOrden] = useState<OrdenClave>("reciente");

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

  const isLoadingPac = pacientesConvex === undefined;
  const isLoadingOS = obrasSocialesQuery === undefined;

  // === Filtro + Ordenamiento centralizados ===
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

    let listaFiltrada = lista.filter((p) => coincideConBusqueda(p) && coincideConObras(p));

    const byNombre = (a: PacienteRecord) =>
      `${a.apellido ?? ""} ${a.nombre ?? ""}`.trim().toLowerCase();
    if (orden === "alf-asc") {
      listaFiltrada = [...listaFiltrada].sort((a, b) => byNombre(a).localeCompare(byNombre(b)));
    } else if (orden === "alf-desc") {
      listaFiltrada = [...listaFiltrada].sort((a, b) => byNombre(b).localeCompare(byNombre(a)));
    } else if (orden === "antiguo" || orden === "reciente") {
      const dir = orden === "reciente" ? -1 : 1;
      listaFiltrada = [...listaFiltrada].sort((a, b) => {
        const ta = (a as any)._creationTime ?? 0;
        const tb = (b as any)._creationTime ?? 0;
        return ta === tb ? 0 : ta < tb ? dir : -dir;
      });
    }

    return listaFiltrada;
  }, [pacientesConvex, debouncedSearch, selectedObrasSociales, orden]);

  // === Paginación ===
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredPacientes.length / pageSize));
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedObrasSociales, orden]);

  useEffect(() => {
    if (currentPage !== clampedPage) setCurrentPage(clampedPage);
  }, [currentPage, clampedPage]);

  const paginatedPacientes = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredPacientes.slice(start, end);
  }, [filteredPacientes, clampedPage]);

  // === Mutaciones ===
  const crearPaciente = useMutation(api.pacientes.crear);
  const actualizarPaciente = useMutation(api.pacientes.actualizar);
  const cambiarEstadoPaciente = useMutation(api.pacientes.cambiarEstado);

  const closeModal = () => {
    setModo(null);
    setSeleccionado(null);
  };

  const sanitizeForm = (form: PacienteFormValues) => ({
    ...form,
    nombre: form.nombre?.trim() || "",
    apellido: form.apellido?.trim() || "",
    email: form.email?.trim() || "",
    telefono: form.telefono?.trim() || "",
    dni: form.dni.trim(),
    fechaNacimiento: form.fechaNacimiento?.trim() || undefined,
  });

  const handleCrear = async (form: PacienteFormValues) => {
    try {
      await crearPaciente(sanitizeForm(form));
      closeModal();
      setToast("Paciente creado correctamente.");
    } catch {
      setToast("Error al crear el paciente.");
    }
  };

  const handleActualizar = async (id: Id<"pacientes">, form: PacienteFormValues) => {
    try {
      await actualizarPaciente({ id, ...sanitizeForm(form) });
      closeModal();
      setToast("Paciente actualizado correctamente.");
    } catch {
      setToast("Error al actualizar el paciente.");
    }
  };

  const handleDesactivar = async (id: Id<"pacientes">) => {
    try {
      await cambiarEstadoPaciente({ id, estado: "Inactivo" });
      closeModal();
      setToast("Paciente desactivado correctamente.");
    } catch {
      setToast("Error al desactivar el paciente.");
    }
  };

  const handleActivar = async (id: Id<"pacientes">) => {
    try {
      await cambiarEstadoPaciente({ id, estado: "Activo" });
      closeModal();
      setToast("Paciente activado correctamente.");
    } catch {
      setToast("Error al activar el paciente.");
    }
  };

  const handleVer = (id: Id<"pacientes">) => {
    const paciente = paginatedPacientes.find((p) => p._id === id);
    if (paciente) {
      setSeleccionado(paciente);
      setModo("ver");
    }
  };

  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const summaryCount = selectedObrasSociales.length + (orden !== "reciente" ? 1 : 0);
  const onApplyFilters = () => setCurrentPage(1);

  // === Render ===
  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/gerente" },
        { label: "Pacientes", href: "/gerente/pacientes" },
      ]}
    >
      <div className="w-full">
        <div className="w-full px-6 py-8 space-y-6">
          <PacientesHeader hideCreateButton />

          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, especialidad u obra social..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={isLoadingPac}
                className="w-full h-14 pl-12 pr-4 text-base rounded-2xl border border-gray-200 shadow-md focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
              />
            </div>
            <div className="flex-shrink-0">
              <PacientesFilterPopover
                obrasSociales={obrasSociales}
                selectedObras={selectedObrasSociales}
                onToggleObra={toggleObraSocial}
                onClearObras={clearObrasSociales}
                orden={orden}
                setOrden={setOrden}
                onApply={onApplyFilters}
                summaryCount={summaryCount}
                buttonClass="h-14 px-5 rounded-2xl border border-gray-200 shadow-md bg-white hover:bg-gray-50 transition duration-150"
                buttonLabel="Filtros"
              />
            </div>
          </div>

          <PacientesTable
            pacientes={paginatedPacientes}
            onView={handleVer}
            onEdit={(paciente) => {
              setSeleccionado(paciente);
              setModo("editar");
            }}
            onDeactivate={(paciente) => {
              setSeleccionado(paciente);
              setModo("desactivar");
            }}
            onActivate={(paciente) => {
              setSeleccionado(paciente);
              setModo("activar");
            }}
            searchTerm={debouncedSearch}
            isLoading={isLoadingPac}
          />

          <PacientesPagination
            currentPage={clampedPage}
            pageSize={pageSize}
            totalItems={filteredPacientes.length}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </div>

        {/* Modales para crear, editar y ver */}
        {modo && modo !== "desactivar" && modo !== "activar" && (
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

        {/* ✅ AlertDialog para desactivar paciente */}
        <AlertDialog open={modo === "desactivar"} onOpenChange={(open) => !open && closeModal()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <AlertDialogTitle className="text-center">
                ¿Desactivar paciente?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Esta acción marcará como Inactivo al paciente{" "}
                <strong>
                  "{seleccionado?.nombre} {seleccionado?.apellido}"
                </strong>
                . No se perderá información, pero el paciente figurará como inactivo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => seleccionado && handleDesactivar(seleccionado._id)}
                className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
              >
                Desactivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ✅ AlertDialog para activar paciente */}
        <AlertDialog open={modo === "activar"} onOpenChange={(open) => !open && closeModal()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <AlertDialogTitle className="text-center">
                ¿Activar paciente?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Esto marcará como Activo al paciente {" "}
                <strong>
                  "{seleccionado?.nombre} {seleccionado?.apellido}"
                </strong>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => seleccionado && handleActivar(seleccionado._id)}
                className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
              >
                Activar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toast de confirmación */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-white shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <p className="font-medium">{toast}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-100 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

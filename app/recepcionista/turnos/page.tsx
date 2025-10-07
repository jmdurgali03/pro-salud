"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageWrapper } from "@/components/page-wrapper";
import { TurnosHeader } from "./_components/TurnosHeader";
import { TurnosTable } from "./_components/TurnosTable";
import { TurnosFilters } from "./_components/TurnosFilters";
import { TurnoModal } from "./_components/TurnoModal";
import type { TurnoConJoin } from "@/app/recepcionista/cal-turnos/_components/types";
import TurnoDialog from "@/components/calendario/CreateTurnoDialog";
import { PlusCircle } from "lucide-react";

export default function TurnosPage() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<string>("Todos");
  const [orden, setOrden] = useState<string>("fecha-desc");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<TurnoConJoin | null>(null);

  const turnos = (useQuery(api.turnos.listarConNombres, {}) ?? []) as TurnoConJoin[];

  // 🔹 Filtrado
  // 👇 pegalo cerca del top del componente
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") // sin acentos
      .toLowerCase()
      .trim();

  const collator = new Intl.Collator("es", { sensitivity: "base" });

  // 🔎 Filtrado
  const filtrados = useMemo(() => {
    const q = normalize(search);
    return (turnos ?? []).filter((t) => {
      const hay =
        normalize(`${t.pacienteNombre} ${t.pacienteApellido} ${t.profesionalNombre} ${t.profesionalApellido}`).includes(q);
      const matchEstado = estado === "Todos" || t.estado === estado;
      return hay && matchEstado;
    });
  }, [turnos, search, estado]);

  // ↕ Ordenamiento (única fuente de verdad)
  const ordenados = useMemo(() => {
    const arr = [...filtrados];

    const byFechaAsc = (a: TurnoConJoin, b: TurnoConJoin) => a.start - b.start;

    switch (orden) {
      case "fecha-asc":
        arr.sort((a, b) => a.start - b.start);
        break;
      case "fecha-desc":
        arr.sort((a, b) => b.start - a.start);
        break;
      case "paciente-nombre":
        arr.sort((a, b) => {
          const A = `${a.pacienteNombre} ${a.pacienteApellido}`;
          const B = `${b.pacienteNombre} ${b.pacienteApellido}`;
          const cmp = collator.compare(A, B);
          return cmp !== 0 ? cmp : byFechaAsc(a, b);
        });
        break;
      case "paciente-apellido":
        arr.sort((a, b) => {
          const A = `${a.pacienteApellido} ${a.pacienteNombre}`;
          const B = `${b.pacienteApellido} ${b.pacienteNombre}`;
          const cmp = collator.compare(A, B);
          return cmp !== 0 ? cmp : byFechaAsc(a, b);
        });
        break;
      case "profesional":
        arr.sort((a, b) => {
          const A = `${a.profesionalApellido} ${a.profesionalNombre}`;
          const B = `${b.profesionalApellido} ${b.profesionalNombre}`;
          const cmp = collator.compare(A, B);
          return cmp !== 0 ? cmp : byFechaAsc(a, b);
        });
        break;
      case "estado":
        {
          const peso: Record<TurnoConJoin["estado"], number> = {
            Confirmado: 0,
            Pendiente: 1,
            Cancelado: 2,
            // si usás Finalizado en esta vista:
            // @ts-ignore
            Finalizado: 3,
          };
          arr.sort((a, b) => {
            const cmp = (peso[a.estado] ?? 9) - (peso[b.estado] ?? 9);
            return cmp !== 0 ? cmp : byFechaAsc(a, b);
          });
        }
        break;
      default:
        break;
    }
    return arr;
  }, [filtrados, orden]);


  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Inicio", href: "/recepcionista" },
        { label: "Turnos", href: "/recepcionista/turnos" },
      ]}
    >
      <div className="p-6 space-y-6">
        {/* Encabezado + botón crear turno */}
        <div className="flex justify-between items-center">
          <TurnosHeader />
          <TurnoDialog
            defaultDate={new Date()}
            trigger={
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg shadow transition-all">
                <PlusCircle className="w-4 h-4" />
                Nuevo turno
              </button>
            }
          />
        </div>

        {/* Filtros */}
        <TurnosFilters
          search={search}
          setSearch={setSearch}
          estado={estado}
          setEstado={setEstado}
          orden={orden}
          setOrden={setOrden}
        />

        {/* Tabla */}
        <TurnosTable
          turnos={ordenados}
          onSelectTurno={(t) => setTurnoSeleccionado(t)}
        />

        {/* Modal detalle */}
        {turnoSeleccionado && (
          <TurnoModal
            turno={turnoSeleccionado}
            onClose={() => setTurnoSeleccionado(null)}
          />
        )}
      </div>
    </PageWrapper>
  );
}

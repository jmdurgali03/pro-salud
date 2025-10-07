"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Filter as FilterIcon, ChevronDown, Check, Search as SearchIcon } from "lucide-react";

// Tipos de datos re-exportados o definidos para la compatibilidad
// Asumo que ObraSocialOption se puede importar o lo re-defino aquí para que el componente sea autocontenido.
// Para este ejemplo, lo defino aquí, pero en un entorno real, podría ser necesario importar ObraSocialOption
// si se usa en otro lado y se quiere evitar duplicación.
export type ObraSocialOption = {
    _id: Id<"obrasSociales">;
    nombre: string;
    // Otros campos que pueda tener una Obra Social
};

export type EstadoFiltro = "Todos" | "Activo" | "Inactivo";
export type OrdenClave = "reciente" | "antiguo" | "alf-asc" | "alf-desc";

/* =========================
   Utilidades comunes (Movidas desde page.tsx)
========================= */
function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) onOutside();
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onOutside, ref]);
}

/* =========================
   Popover de Filtros Unificados
========================= */
export function FiltersPopover({
    obrasSociales,
    selectedObras,
    onToggleObra,
    onClearObras,
    estado,
    setEstado,
    orden,
    setOrden,
    onApply,
    summaryCount,
    buttonLabel = "Filtros",
}: {
    obrasSociales: ObraSocialOption[];
    selectedObras: Id<"obrasSociales">[];
    onToggleObra: (id: Id<"obrasSociales">) => void;
    onClearObras: () => void;
    estado: EstadoFiltro;
    setEstado: (v: EstadoFiltro) => void;
    orden: OrdenClave;
    setOrden: (v: OrdenClave) => void;
    onApply: () => void;
    summaryCount: number;
    buttonLabel?: string;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const [osQuery, setOsQuery] = useState("");
    useOnClickOutside(rootRef, () => setOpen(false));

    const filteredOS = useMemo(() => {
        const q = osQuery.trim().toLowerCase();
        if (!q) return obrasSociales;
        return obrasSociales.filter((o) => o.nombre.toLowerCase().includes(q));
    }, [osQuery, obrasSociales]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setOpen(false);
            btnRef.current?.focus();
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl
                    border border-gray-200 bg-white shadow-sm hover:shadow
                    text-gray-800 text-base font-medium transition
                    focus:outline-none focus:ring-2 focus:ring-purple-300
                "
                aria-expanded={open}
            >
                <FilterIcon className="h-4 w-4" />
                {buttonLabel}
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                {summaryCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {summaryCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="dialog"
                    onKeyDown={onKeyDown}
                    className="absolute z-30 mt-2 w-[min(720px,90vw)] rounded-xl border border-gray-200 bg-white shadow-2xl right-0"
                >
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Columna 1: Obras Sociales */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-800">Obras Sociales</h3>
                            </div>

                            <div className="relative mb-3">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    value={osQuery}
                                    onChange={(e) => setOsQuery(e.target.value)}
                                    placeholder="Buscar obra social…"
                                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                />
                            </div>

                            <div className="max-h-56 overflow-auto rounded-md border border-gray-100">
                                {filteredOS.length === 0 && (
                                    <div className="p-3 text-sm text-gray-500">Sin resultados.</div>
                                )}
                                {filteredOS.map((o) => {
                                    const checked = selectedObras.includes(o._id);
                                    return (
                                        <label
                                            key={o._id as string}
                                            className="flex items-center gap-3 px-3 py-2 text-sm border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300"
                                                checked={checked}
                                                onChange={() => onToggleObra(o._id)}
                                            />
                                            <span className="flex-1">{o.nombre}</span>
                                            {checked && <Check className="h-4 w-4 text-purple-600" />}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Columna 2: Estado y Orden */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">Estado</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {(["Todos", "Activo", "Inactivo"] as EstadoFiltro[]).map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setEstado(opt)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border transition ${estado === opt
                                                ? "bg-purple-50 border-purple-300 text-purple-700"
                                                : "bg-white border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">Orden</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {([
                                        { key: "reciente", label: "Más reciente" },
                                        { key: "antiguo", label: "Más antiguo" },
                                        { key: "alf-asc", label: "Alfabético A–Z" },
                                        { key: "alf-desc", label: "Alfabético Z–A" },
                                    ] as { key: OrdenClave; label: string }[]).map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setOrden(key)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border transition ${orden === key
                                                ? "bg-pink-50 border-pink-300 text-pink-700"
                                                : "bg-white border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 p-3 border-t bg-gray-50 rounded-b-xl">
                        <button
                            onClick={() => {
                                // limpiar todo
                                onClearObras();
                                setEstado("Todos");
                                setOrden("reciente");
                            }}
                            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-white"
                        >
                            Limpiar todo
                        </button>
                        <button
                            onClick={() => {
                                onApply();
                                setOpen(false);
                            }}
                            className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
                        >
                            Aplicar filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
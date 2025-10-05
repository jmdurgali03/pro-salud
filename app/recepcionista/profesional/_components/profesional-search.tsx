"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export type ObraSocialOption = {
    _id: Id<"obrasSociales">;
    nombre: string;
};

type ProfesionalSearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    isLoading?: boolean;
    obrasSociales: ObraSocialOption[];
    selectedObrasSociales: Id<"obrasSociales">[];
    onToggleObraSocial: (id: Id<"obrasSociales">) => void;
    onClearObrasSociales: () => void;
    isLoadingObrasSociales?: boolean;
};

export function ProfesionalSearchBar({
    value,
    onChange,
    isLoading = false,
    obrasSociales,
    selectedObrasSociales,
    onToggleObraSocial,
    onClearObrasSociales,
    isLoadingObrasSociales = false,
}: ProfesionalSearchBarProps) {
    const [showFilters, setShowFilters] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCount = selectedObrasSociales.length;

    return (
        <div className="flex flex-col sm:flex-row gap-3 relative">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Buscar por nombre, DNI, especialidad u obra social..."
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                />
            </div>

            <div className="relative" ref={filterRef}>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    disabled={isLoadingObrasSociales}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                        Obras Sociales
                        {selectedCount > 0 && (
                            <span className="ml-1.5 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                                {selectedCount}
                            </span>
                        )}
                    </span>
                </button>

                {showFilters && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Filtrar por Obras Sociales
                            </h3>
                            {selectedCount > 0 && (
                                <button
                                    onClick={onClearObrasSociales}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                >
                                    <X className="h-3 w-3" />
                                    Limpiar
                                </button>
                            )}
                        </div>

                        <div className="max-h-64 overflow-y-auto p-2">
                            {isLoadingObrasSociales ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    Cargando obras sociales...
                                </div>
                            ) : obrasSociales.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    No hay obras sociales disponibles
                                </div>
                            ) : (
                                obrasSociales.map((obraSocial) => (
                                    <label
                                        key={obraSocial._id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedObrasSociales.includes(obraSocial._id)}
                                            onChange={() => onToggleObraSocial(obraSocial._id)}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-700 flex-1">
                                            {obraSocial.nombre}
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
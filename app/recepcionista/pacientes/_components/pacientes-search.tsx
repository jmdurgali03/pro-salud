"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { getObraSocialBadgeClass } from "../../_components/obra-social-badge";

export type ObraSocialOption = {
  _id: Id<"obrasSociales">;
  nombre: string;
};

type PacientesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  obrasSociales: ObraSocialOption[];
  selectedObrasSociales: Id<"obrasSociales">[];
  onToggleObraSocial: (id: Id<"obrasSociales">) => void;
  onClearObrasSociales: () => void;
  isLoadingObrasSociales?: boolean;
};

export function PacientesSearchBar({
  value,
  onChange,
  isLoading = false,
  obrasSociales,
  selectedObrasSociales,
  onToggleObraSocial,
  onClearObrasSociales,
  isLoadingObrasSociales = false,
}: PacientesSearchBarProps) {
  const [openFilter, setOpenFilter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFilter(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedNames = useMemo(
    () =>
      obrasSociales
        .filter((obra) => selectedObrasSociales.includes(obra._id))
        .map((obra) => obra.nombre),
    [obrasSociales, selectedObrasSociales]
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              placeholder="Buscar por nombre, DNI, email, teléfono u obra social..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/50 text-gray-900 placeholder-gray-400 transition-all duration-200"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="md:w-auto flex items-center gap-3">
            {selectedNames.length > 0 && (
              <div className="hidden md:flex flex-wrap gap-1.5 max-w-xs">
                {selectedNames.slice(0, 3).map((nombre, index) => (
                  <span
                    key={`${nombre}-${index}`}
                    className={getObraSocialBadgeClass(nombre, { compact: true })}
                  >
                    {nombre}
                  </span>
                ))}
                {selectedNames.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    +{selectedNames.length - 3}
                  </span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setOpenFilter((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                selectedNames.length > 0
                  ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Obras sociales
              {selectedNames.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs">
                  {selectedNames.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {openFilter && (
        <div
          className="absolute z-40 mt-2 w-full sm:w-96 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="px-5 py-4 flex items-start justify-between gap-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-800">Filtrar por obras sociales</p>
              <p className="text-xs text-gray-500 mt-1">
                Marca una o varias opciones para limitar los resultados.
              </p>
            </div>
            {selectedObrasSociales.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearObrasSociales();
                  setOpenFilter(false);
                }}
                className="text-xs font-semibold text-green-600 hover:text-green-700"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoadingObrasSociales ? (
              <div className="py-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
              </div>
            ) : obrasSociales.length > 0 ? (
              <ul className="py-2 flex flex-col gap-1">
                {obrasSociales.map((obra) => {
                  const checked = selectedObrasSociales.includes(obra._id);
                  return (
                    <li key={obra._id.toString()}>
                      <label
                        className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-colors ${
                          checked ? "bg-green-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleObraSocial(obra._id)}
                          className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span
                          className={`${getObraSocialBadgeClass(obra.nombre, { compact: true })} flex-1 justify-center`}
                        >
                          {obra.nombre}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">
                No hay obras sociales registradas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { getObraSocialBadgeClass } from "../../_components/obra-social-badge";

type ObraSocial = {
  _id: Id<"obrasSociales">;
  nombre: string;
};

type PacientesObrasFilterProps = {
  obrasSociales: ObraSocial[];
  selectedIds: Id<"obrasSociales">[];
  onChange: (ids: Id<"obrasSociales">[]) => void;
  disabled?: boolean;
};

export function PacientesObrasFilter({
  obrasSociales,
  selectedIds,
  onChange,
  disabled = false,
}: PacientesObrasFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleId = (id: Id<"obrasSociales">) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((current) => current !== id)
        : [...selectedIds, id]
    );
  };

  const clearFilters = () => {
    onChange([]);
  };

  const selectedNames = obrasSociales
    .filter((os) => selectedIds.includes(os._id))
    .map((os) => os.nombre);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Filtrar por obra social
          <span className={`text-xs font-semibold ${selectedIds.length ? "text-green-600" : "text-gray-400"}`}>
            {selectedIds.length ? `${selectedIds.length} seleccionadas` : "Todas"}
          </span>
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className="absolute left-0 z-20 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Obras sociales</p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-green-600 hover:text-green-700"
              >
                Limpiar
              </button>
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {obrasSociales.length ? (
                obrasSociales.map((os) => (
                  <label key={os._id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={selectedIds.includes(os._id)}
                      onChange={() => toggleId(os._id)}
                    />
                    <span className="truncate">{os.nombre}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay obras sociales disponibles.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedNames.map((nombre, index) => (
            <span
              key={`${nombre}-${index}`}
              className={getObraSocialBadgeClass(nombre)}
            >
              {nombre}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

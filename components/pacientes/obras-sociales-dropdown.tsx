"use client";

import { useEffect, useRef, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

type ObrasSocial = {
  _id: Id<"obrasSociales">;
  nombre: string;
};

type ObrasSocialesDropdownProps = {
  obrasSociales: ObrasSocial[];
  selectedIds: Id<"obrasSociales">[];
  onToggle: (id: Id<"obrasSociales">) => void;
  error?: string;
};

export function ObrasSocialesDropdown({
  obrasSociales,
  selectedIds,
  onToggle,
  error,
}: ObrasSocialesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedNames = (obrasSociales || [])
    .filter((os) => selectedIds.includes(os._id))
    .map((os) => os.nombre);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="text-sm font-semibold text-gray-700 block mb-2">
        Obras Sociales <span className="text-red-500">*</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full border rounded-xl p-3 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-all duration-200 ${
          error ? "border-red-300 ring-2 ring-red-200" : "border-gray-200"
        }`}
      >
        <div className="flex-1 min-w-0">
          {selectedNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedNames.map((name, i) => (
                <span
                  key={i}
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">Seleccionar obras sociales (o 'Particular')...</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {(obrasSociales || []).length > 0 ? (
            obrasSociales.map((os) => (
              <label
                key={os._id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(os._id)}
                  onChange={() => onToggle(os._id)}
                  className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="text-gray-900 flex-1 font-medium">{os.nombre}</span>
              </label>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No hay obras sociales disponibles
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

"use client";

// Se eliminan imports no usados para el filtro interno (useEffect, useMemo, useRef, useState, Filter, getObraSocialBadgeClass)
import { Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export type ObraSocialOption = {
  _id: Id<"obrasSociales">;
  nombre: string;
};

type PacientesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  // Se mantienen estas props en la interfaz para no romper PacientesPage.tsx, aunque ya no se usan internamente
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
  // Se ignoran las props de filtro aquí, ya que el filtro se gestiona externamente
}: PacientesSearchBarProps) {
  // Se ha eliminado todo el estado, referencias, efectos, y lógica de badges/popover de obras sociales.

  return (
    <div className="relative">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Usamos p-4 y flex-col/flex-row para mantener la alineación flexible */}
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            {/* Icono de búsqueda */}
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            
            {/* Campo de input */}
            <input
              placeholder="Buscar por nombre, DNI, email, teléfono u obra social..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400/50 text-gray-900 placeholder-gray-400 transition-all duration-200"
            />
            
            {/* Indicador de carga */}
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* BLOQUE ELIMINADO: Anteriormente contenía el div que mostraba los badges de obras sociales seleccionadas 
            y el botón de filtro interno. 
          */}
        </div>
      </div>
    </div>
  );
}

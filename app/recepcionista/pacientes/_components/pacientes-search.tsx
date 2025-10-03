"use client";

import { Search } from "lucide-react";

type PacientesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
};

export function PacientesSearchBar({ value, onChange, isLoading = false }: PacientesSearchBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          placeholder="Buscar por nombre, DNI, email, teléfono u obra social..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-400/50 text-gray-900 placeholder-gray-400 transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}

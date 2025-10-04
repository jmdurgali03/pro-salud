"use client";

import { UserPlus } from "lucide-react";

type PacientesHeaderProps = {
  onCreate: () => void;
  disableCreate?: boolean;
};

export function PacientesHeader({ onCreate, disableCreate = false }: PacientesHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-300 to-green-700 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
        </div>
        <p className="text-gray-600 text-base md:ml-5">
          Administra la información de todos los pacientes registrados
        </p>
      </div>
      <button
        onClick={onCreate}
        disabled={disableCreate}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        title={disableCreate ? "Cargando obras sociales..." : ""}
      >
        <UserPlus size={20} strokeWidth={2.5} />
        Nuevo Paciente
      </button>
    </div>
  );
}

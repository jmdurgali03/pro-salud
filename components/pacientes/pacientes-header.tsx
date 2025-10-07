"use client";

import { UserPlus } from "lucide-react";

type PacientesHeaderProps = {
  onCreate?: () => void;
  disableCreate?: boolean;
  hideCreateButton?: boolean;
};

export function PacientesHeader({
  onCreate,
  disableCreate = false,
  hideCreateButton = false,
}: PacientesHeaderProps) {
  return (
    // ✅ 1. Contenedor principal para alinear el título (izquierda) y el botón (derecha)
    // Se usa 'flex items-center justify-between' para la alineación horizontal.
    // He eliminado el flex-col y gap-6 iniciales para una alineación inmediata.
    <div className="flex items-center justify-between py-2"> 
      
      {/* ⬅️ Contenedor del Título (izquierda) */}
      {/* El div se centra verticalmente gracias al 'items-center' del padre */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-300 to-green-700 rounded-full"></div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
      </div>
      
      {/* ➡️ Contenedor del Botón (derecha) */}
      {!hideCreateButton && onCreate && (
        <button
          onClick={onCreate}
          disabled={disableCreate}
          // Asegúrate de que las clases del botón no lo desplacen verticalmente
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          title={disableCreate ? "Cargando obras sociales..." : ""}
        >
          <UserPlus size={20} strokeWidth={2.5} />
          Nuevo Paciente
        </button>
      )}

      {/* 💡 La descripción (<p>) se ha ELIMINADO de este contenedor para no romper la alineación.
           Si la descripción es necesaria, debe colocarse FUERA de este componente flex, 
           o en un <div className="w-full"> debajo de este header, por ejemplo:
        <p className="text-gray-600 text-base mt-2 md:ml-5">
            Administra la información de todos los pacientes registrados
        </p> 
      */}
    </div>
  );
}
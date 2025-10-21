"use client";

import { useEffect, useRef, useState } from "react";
import { Edit2, Eye, MoreHorizontal, Trash2, Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { PacienteRecord } from "./types";
import { getObraSocialBadgeClass } from "@/components/pacientes/obra-social-badge";


type PacientesTableProps = {
  pacientes: PacienteRecord[];
  onView: (id: Id<"pacientes">) => void;
  onEdit: (paciente: PacienteRecord) => void;
  onDeactivate?: (paciente: PacienteRecord) => void;
  onActivate?: (paciente: PacienteRecord) => void;
  onDelete?: (paciente: PacienteRecord) => void;
  searchTerm: string;
  isLoading?: boolean;
};

export function PacientesTable({
  pacientes,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  searchTerm,
  isLoading = false,
}: PacientesTableProps) {
    
  // Función para normalizar y mostrar el género
  const getDisplayGender = (genero?: string | null) => {
    if (!genero) return "—";
    const lowerCaseGender = genero.toLowerCase().trim();
    if (lowerCaseGender === "masculino" || lowerCaseGender.startsWith('m')) {
      return "Masculino";
    }
    if (lowerCaseGender === "femenino" || lowerCaseGender.startsWith('f')) {
      return "Femenino";
    }
    return "Otro"; // Para cualquier otro valor (no binario o no especificado)
  };
    
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Teléfono
              </th>
              {/* ✅ COLUMNA AGREGADA: GÉNERO */}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Género
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Obras Sociales
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pacientes.length > 0 ? (
              pacientes.map((paciente) => (
                <tr key={paciente._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-semibold text-gray-900">
                      {paciente.nombre} {paciente.apellido}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">DNI: {paciente.dni || "—"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 align-top">
                    {paciente.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 align-top">
                    {paciente.telefono || "—"}
                  </td>
                  {/* ✅ CELDA DE DATOS AGREGADA: GÉNERO */}
                  <td className="px-6 py-4 text-sm text-gray-700 align-top">
                    {getDisplayGender(paciente.genero)}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(paciente.obrasSocialesNombres) && paciente.obrasSocialesNombres.length > 0 ? (
                        paciente.obrasSocialesNombres
                          .filter((nombre): nombre is string => Boolean(nombre))
                          .map((nombre, i) => (
                            <span key={i} className={getObraSocialBadgeClass(nombre)}>
                              {nombre}
                            </span>
                          ))
                      ) : (
                        <span className="text-gray-400 text-sm italic">Sin obra social asignada</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {(() => {
                      const estado = paciente.estado ?? "Activo";
                      const isActivo = estado === "Activo";
                      const cls = isActivo
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-red-100 text-red-700 border border-red-200";
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
                          {isActivo ? "Activo" : "Inactivo"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ActionsMenu
                      onView={() => onView(paciente._id)}
                      onEdit={() => onEdit(paciente)}
                      onDeactivate={onDeactivate ? () => onDeactivate(paciente) : undefined}
                      onActivate={onActivate ? () => onActivate(paciente) : undefined}
                      onDelete={onDelete ? () => onDelete(paciente) : undefined}
                      estado={(paciente.estado as any) ?? "Activo"}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* Colspan ajustado a 7 por nueva columna Estado */}
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="text-gray-400" size={28} />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {isLoading ? "Cargando pacientes..." : "No se encontraron pacientes"}
                    </p>
                    {!isLoading && searchTerm && (
                      <p className="text-sm text-gray-400">Intenta con otro término de búsqueda</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type ActionsMenuProps = {
  onView: () => void;
  onEdit: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
  estado: "Activo" | "Inactivo";
};

function ActionsMenu({ onView, onEdit, onDeactivate, onActivate, onDelete, estado }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const triggerAction = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Acciones"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </button>

      {open && buttonRef.current && (
        <div
          ref={menuRef}
          className="fixed w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
          style={{
            top: (() => {
              const rect = buttonRef.current!.getBoundingClientRect();
              // El menú tiene 3 botones + padding, ajusté la altura para evitar que se salga de la pantalla
              const menuHeight = 132; 
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < menuHeight + 10) {
                // Abre hacia arriba si no hay espacio abajo
                return rect.top - menuHeight - 4;
              }
              return rect.bottom + 4; // Abre hacia abajo
            })(),
            // Posiciona a la derecha del botón
            right: window.innerWidth - buttonRef.current.getBoundingClientRect().right,
          }}
        >
          <button
            onClick={() => triggerAction(onView)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver paciente
          </button>
          <button
            onClick={() => triggerAction(onEdit)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar datos
          </button>
          {/* Toggle Activar/Desactivar según estado cuando hay handlers provistos */}
          {estado === "Activo" && onDeactivate && (
            <button
              onClick={() => triggerAction(onDeactivate)}
              className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Desactivar paciente
            </button>
          )}
          {estado === "Inactivo" && onActivate && (
            <button
              onClick={() => triggerAction(onActivate)}
              className="w-full px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Activar paciente
            </button>
          )}
          {/* Fallback: si no hay toggle, mostrar Eliminar si existe */}
          {!onDeactivate && !onActivate && onDelete && (
            <button
              onClick={() => triggerAction(onDelete)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

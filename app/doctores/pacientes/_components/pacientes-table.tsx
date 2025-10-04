"use client";

import { useEffect, useRef, useState } from "react";
import { Edit2, Eye, MoreHorizontal, Trash2, Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { PacienteRecord } from "../types";
import { getObraSocialBadgeClass } from "../../_components/obra-social-badge";

type PacientesTableProps = {
  pacientes: PacienteRecord[];
  onView: (id: Id<"pacientes">) => void;
  onEdit: (paciente: PacienteRecord) => void;
  onDelete: (paciente: PacienteRecord) => void;
  searchTerm: string;
  isLoading?: boolean;
};

export function PacientesTable({
  pacientes,
  onView,
  onEdit,
  onDelete,
  searchTerm,
  isLoading = false,
}: PacientesTableProps) {
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Obras Sociales
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
                    <div className="text-xs text-gray-500 mt-0.5">
                      Género: {paciente.genero ?? "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 align-top">
                    {paciente.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 align-top">
                    {paciente.telefono || "—"}
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
                  <td className="px-6 py-4 text-center">
                    <ActionsMenu
                      onView={() => onView(paciente._id)}
                      onEdit={() => onEdit(paciente)}
                      onDelete={() => onDelete(paciente)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
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
  onDelete: () => void;
};

function ActionsMenu({ onView, onEdit, onDelete }: ActionsMenuProps) {
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
              const menuHeight = 132;
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < menuHeight + 10) {
                return rect.top - menuHeight - 4;
              }
              return rect.bottom + 4;
            })(),
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
          <button
            onClick={() => triggerAction(onDelete)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar paciente
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import { FileText, FlaskConical, Pill, Stethoscope } from "lucide-react";

export default function SidebarPaciente({ nombre, apellido }: { nombre: string; apellido: string }) {
  return (
    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <div className="text-sm text-gray-500">Paciente:</div>
        <div className="font-semibold text-gray-900">
          {nombre} {apellido}
        </div>
      </div>
      <nav className="space-y-1">
        <a
          href="#resumen"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FileText className="h-4 w-4" />
          Resumen
        </a>
        <a
          href="#consultas"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <Stethoscope className="h-4 w-4" />
          Consultas
        </a>
        <a
          href="#diagnosticos"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FlaskConical className="h-4 w-4" />
          Diagnósticos
        </a>
        <a
          href="#tratamientos"
          className="pointer-events-none flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400"
        >
          <Pill className="h-4 w-4" />
          Tratamientos
        </a>
      </nav>
    </aside>
  );
}

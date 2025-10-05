// app/recepcionista/pacientes/_components/HeroPaciente.tsx
"use client";

import { Calendar, IdCard, Mail, Phone, Stethoscope, Venus } from "lucide-react";
import { calcularEdad, formatDNI, formatFechaEs, initials } from "./ui-format";

export default function HeroPaciente({
  nombre,
  apellido,
  dni,
  genero,
  fechaNacimiento,
  email,
  telefono,
  obrasSociales,
  onNuevaConsulta,
  onNuevoDiagnostico,
  onNuevaNota,
  onNuevoTratamiento,
  diagnosticoHabilitado = true,
}: {
  nombre?: string;
  apellido?: string;
  dni?: string;
  genero?: string;
  fechaNacimiento?: string | number;
  email?: string;
  telefono?: string;
  obrasSociales?: string[];
  onNuevaConsulta: () => void;
  onNuevoDiagnostico: () => void;
  onNuevaNota: () => void;
  onNuevoTratamiento: () => void;
  diagnosticoHabilitado?: boolean;
}) {
  return (
    <div className="relative isolate">
      <div className="h-28 w-full bg-gradient-to-r from-sky-50 to-emerald-50" />
      <div className="mx-auto -mt-10 max-w-6xl px-6">
        <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-lg p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Identidad + datos grandes */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-emerald-600 text-white text-lg font-semibold shadow-md">
                  {initials(nombre, apellido)}
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold leading-tight text-gray-900">
                  {nombre || apellido ? `${nombre ?? ""} ${apellido ?? ""}`.trim() : "Historia clínica"}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base md:text-lg">
                <span className="inline-flex items-center gap-2 text-gray-700 font-medium">
                  <IdCard className="h-5 w-5 text-gray-500" />
                  DNI: <span className="font-semibold text-gray-900">{formatDNI(dni)}</span>
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                <span className="inline-flex items-center gap-2 text-gray-700 font-medium">
                  <Venus className="h-5 w-5 text-gray-500" />
                  Género: <span className="font-semibold text-gray-900">{genero ?? "—"}</span>
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                <span className="inline-flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  Fecha de nacimiento:{" "}
                  <span className="font-semibold text-gray-900">{formatFechaEs(fechaNacimiento)}</span>
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                <span className="inline-flex items-center gap-2 text-gray-700 font-medium">
                  Edad: <span className="font-semibold text-gray-900">{calcularEdad(fechaNacimiento)}</span>
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                <span className="inline-flex items-center gap-2 text-gray-700 font-medium">
                  <Mail className="h-5 w-5 text-gray-500" />
                  Email: <span className="font-semibold text-gray-900">{email ?? "—"}</span>
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:inline-block" />
                <span className="inline-flex items-center gap-2 text-gray-700 font-medium">
                  <Phone className="h-5 w-5 text-gray-500" />
                  Teléfono: <span className="font-semibold text-gray-900">{telefono ?? "—"}</span>
                </span>
              </div>
            </div>

            {/* Acciones */}

          </div>

          {/* Chips de Obra social */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500 inline-flex items-center gap-2">
              <Stethoscope className="h-4 w-4" /> Obras sociales:
            </span>
            {(obrasSociales?.length ?? 0) > 0 ? (
              obrasSociales!.map((os) => (
                <span
                  key={os}
                  className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200"
                >
                  {os}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                Particular
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

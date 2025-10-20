// components/pacientes/HeroPaciente.tsx
"use client";

import { Calendar, IdCard, Mail, Phone, Stethoscope, Venus, ClipboardList, Pill, Stethoscope as DxIcon } from "lucide-react";
import { calcularEdad, formatDNI, formatFechaEs, initials } from "./ui-format";

type Props = {
  nombre?: string;
  apellido?: string;
  dni?: string;
  genero?: string;
  fechaNacimiento?: string | number;
  email?: string;
  telefono?: string;
  obrasSociales?: string[];
  onNuevoDiagnostico?: () => void;
  onNuevaIndicacion?: () => void;
  onNuevoMedicamento?: () => void;
  diagnosticoHabilitado?: boolean;
};

export default function HeroPaciente({
  nombre,
  apellido,
  dni,
  genero,
  fechaNacimiento,
  email,
  telefono,
  obrasSociales,
  onNuevoDiagnostico,
  onNuevaIndicacion,
  onNuevoMedicamento,
  diagnosticoHabilitado = true,
}: Props) {
  const nombreCompleto = nombre || apellido ? `${nombre ?? ""} ${apellido ?? ""}`.trim() : "Historia clínica";

  const Item = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="inline-flex items-center gap-2 leading-tight">
      <span className="text-gray-400">{icon}</span>
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
  const Dot = () => <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-gray-300" aria-hidden="true" />;

  return (
    <div className="relative isolate">
      <div className="h-24 w-full bg-gradient-to-r from-sky-50 via-emerald-50 to-amber-50" />
      <div className="mx-auto -mt-8 max-w-6xl px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-2xl font-bold text-white shadow-md">
                {initials(nombre, apellido)}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-semibold text-gray-900 md:text-4xl">{nombreCompleto}</h1>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap items-center gap-2">
              {onNuevoDiagnostico && (
                <button
                  onClick={onNuevoDiagnostico}
                  disabled={!diagnosticoHabilitado}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-sm ${
                    diagnosticoHabilitado
                      ? "border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                      : "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  title="Nuevo diagnóstico"
                >
                  <DxIcon className="h-4 w-4" />
                  Diagnóstico
                </button>
              )}

              {onNuevaIndicacion && (
                <button
                  onClick={onNuevaIndicacion}
                  className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-sky-100"
                  title="Nueva indicación médica"
                >
                  <ClipboardList className="h-4 w-4" />
                  Indicaciones médicas
                </button>
              )}

              {onNuevoMedicamento && (
                <button
                  onClick={onNuevoMedicamento}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:bg-emerald-100"
                  title="Nuevo medicamento"
                >
                  <Pill className="h-4 w-4" />
                  Medicamentos
                </button>
              )}
            </div>
          </div>

          {/* Datos */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg">
            <Item icon={<IdCard className="h-5 w-5" />} label="DNI" value={formatDNI(dni)} />
            <Dot />
            <Item icon={<Venus className="h-5 w-5" />} label="Género" value={genero ?? "—"} />
            <Dot />
            <Item icon={<Calendar className="h-5 w-5" />} label="Fecha de nacimiento" value={formatFechaEs(fechaNacimiento)} />
            <Dot />
            <Item label="Edad" icon={<Calendar className="h-5 w-5" />} value={calcularEdad(fechaNacimiento)} />
            <Dot />
            <Item icon={<Mail className="h-5 w-5" />} label="Email" value={email ?? "—"} />
            <Dot />
            <Item icon={<Phone className="h-5 w-5" />} label="Teléfono" value={telefono ?? "—"} />
          </div>

          {/* Obras sociales */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
              <Stethoscope className="h-4 w-4" />
              Obras sociales:
            </span>
            {(obrasSociales?.length ?? 0) > 0 ? (
              obrasSociales!.map((os) => (
                <span key={os} className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
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

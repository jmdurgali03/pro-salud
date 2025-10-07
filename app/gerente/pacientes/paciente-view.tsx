"use client";

import { PacienteRecord } from "@/components/pacientes/types";

type PacienteViewProps = {
    paciente: PacienteRecord;
    onCancel: () => void;
};

export function PacienteView({ paciente, onCancel }: PacienteViewProps) {
    const formatearFecha = (fecha?: string) => {
        if (!fecha) return "No especificado";
        const date = new Date(fecha);
        if (isNaN(date.getTime())) return "No especificado";

        const dia = date.getDate().toString().padStart(2, "0");
        const mes = (date.getMonth() + 1).toString().padStart(2, "0");
        const año = date.getFullYear();

        return `${dia}/${mes}/${año}`;
    };

    const InfoField = ({ label, value }: { label: string; value: string | undefined }) => (
        <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-base text-gray-900">{value || "No especificado"}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos del Paciente</h2>
                <div className="h-1 w-20 bg-green-600 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Nombre" value={paciente.nombre} />
                <InfoField label="Apellido" value={paciente.apellido} />
                <InfoField label="DNI" value={paciente.dni} />
                <InfoField label="Fecha de Nacimiento" value={formatearFecha(paciente.fechaNacimiento)} />
                <InfoField label="Género" value={paciente.genero} />
                <InfoField label="Email" value={paciente.email} />
                <InfoField label="Teléfono" value={paciente.telefono} />

                <div className="space-y-1 md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Obras Sociales</p>
                    {paciente.obrasSocialesNombres && paciente.obrasSocialesNombres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {paciente.obrasSocialesNombres.map((nombre, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                                >
                                    {nombre}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-base text-gray-900">Sin obras sociales</p>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
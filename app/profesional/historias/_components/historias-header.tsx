"use client";

export function HistoriasHeader() {
    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-300 to-green-700 rounded-full"></div>
                    <h1 className="text-3xl font-bold text-gray-900">Historias Clínicas</h1>
                </div>
                <p className="text-gray-600 text-base md:ml-5">
                    Administra la información de todos los pacientes registrados
                </p>
            </div>
        </div>
    );
}
"use client";

import ProfesionalForm from "./ProfesionalForm";
import type { Profesional, ProfesionalInput } from "./page";
import { X, AlertCircle, Clock } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Props = {
  title: string;
  initialData?: Profesional;
  onSubmit: (data: ProfesionalInput) => void;
  onCancel: () => void;
  errorText?: string;
  loading?: boolean;
  onClientError?: (msg: string | null) => void;
  viewMode?: boolean;
  especialidades?: any[];
  obrasSociales?: any[];
};

export default function ProfesionalModal({
  title,
  initialData,
  onSubmit,
  onCancel,
  errorText,
  loading,
  onClientError,
  viewMode = false,
  especialidades,
  obrasSociales,
}: Props) {
  // 🔹 Si no vienen desde el padre, las buscamos nosotros
  const especialidadesQuery = useQuery(api.especialidades.listar);
  const obrasSocialesQuery = useQuery(api.obrasSociales.listar);

  // 🔹 Usamos las que estén disponibles
  const especialidadesFinal = especialidades ?? especialidadesQuery ?? [];
  const obrasSocialesFinal = obrasSociales ?? obrasSocialesQuery ?? [];

  const getObrasSocialesNombres = (ids: Id<"obrasSociales">[]) =>
    ids
      .map((id) => obrasSocialesFinal.find((os: any) => os._id === id)?.nombre || "")
      .filter(Boolean);


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Error Alert */}
        {errorText && !viewMode && (
          <div className="mx-8 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{errorText}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {viewMode && initialData ? (
            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Nombre completo
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900">
                  {initialData.nombre}
                </div>
              </div>

              {/* DNI + Matrícula */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    DNI
                  </label>
                  <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900">
                    {initialData.dni}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Matrícula
                  </label>
                  <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900">
                    {initialData.matricula}
                  </div>
                </div>
              </div>

              {/* Especialidad */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Especialidad
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900">
                  {especialidadesFinal.length > 0
                    ? especialidadesFinal.find((e) => e._id === initialData.especialidadId)?.nombre || "—"
                    : "Cargando..."}

                </div>
              </div>

              {/* Franjas Horarias */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Franjas horarias
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900">
                  {initialData.franjasHorarias &&
                    initialData.franjasHorarias.length > 0 ? (
                    <div className="space-y-1 text-sm">
                      {(() => {
                        const diasSemana = [
                          "Lun",
                          "Mar",
                          "Mié",
                          "Jue",
                          "Vie",
                          "Sáb",
                          "Dom",
                        ];

                        // Agrupar franjas por día
                        const franjasPorDia = initialData.franjasHorarias.reduce(
                          (
                            acc: Record<
                              number,
                              { inicio: string; fin: string }[]
                            >,
                            f
                          ) => {
                            if (!acc[f.dia]) acc[f.dia] = [];
                            acc[f.dia].push({ inicio: f.inicio, fin: f.fin });
                            return acc;
                          },
                          {}
                        );

                        const dias = Object.keys(franjasPorDia)
                          .map(Number)
                          .sort((a, b) => a - b);

                        const grupos: {
                          inicio: number;
                          fin: number;
                          franjas: any[];
                        }[] = [];
                        let actualInicio = dias[0];
                        let actualFin = dias[0];
                        let franjasActual = franjasPorDia[dias[0]];

                        for (let i = 1; i < dias.length; i++) {
                          const dia = dias[i];
                          const iguales =
                            JSON.stringify(franjasPorDia[dia]) ===
                            JSON.stringify(franjasActual);

                          if (iguales && dia === actualFin + 1) {
                            actualFin = dia;
                          } else {
                            grupos.push({
                              inicio: actualInicio,
                              fin: actualFin,
                              franjas: franjasActual,
                            });
                            actualInicio = dia;
                            actualFin = dia;
                            franjasActual = franjasPorDia[dia];
                          }
                        }
                        grupos.push({
                          inicio: actualInicio,
                          fin: actualFin,
                          franjas: franjasActual,
                        });

                        // Render final
                        return grupos.map((g, i) => {
                          const etiquetaDias =
                            g.inicio === g.fin
                              ? diasSemana[g.inicio - 1]
                              : `${diasSemana[g.inicio - 1]}–${diasSemana[g.fin - 1]
                              }`;
                          const horarios = g.franjas
                            .map((f) => `${f.inicio} a ${f.fin}`)
                            .join(", ");

                          return (
                            <div key={i} className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span className="font-medium">
                                {etiquetaDias} {horarios}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Sin franjas horarias definidas
                    </span>
                  )}
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Correo electrónico
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 break-all">
                  {initialData.contacto}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Teléfono
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900">
                  {initialData.telefono}
                </div>
              </div>

              {/* Obras Sociales */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Obras Sociales
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                  {obrasSocialesFinal.length > 0 ? (
                    getObrasSocialesNombres(initialData.obrasSociales).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {getObrasSocialesNombres(initialData.obrasSociales).map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-200"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Sin obras sociales</span>
                    )
                  ) : (
                    <span className="text-gray-400">Cargando...</span>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Estado
                </label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${initialData.estado === "Activo"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                  >
                    {initialData.estado}
                  </span>
                </div>
              </div>

              {/* Botón Cerrar */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={onCancel}
                  className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <ProfesionalForm
              initialData={initialData}
              onSubmit={onSubmit}
              onCancel={onCancel}
              submitting={!!loading}
              onClientError={onClientError}
            />
          )}
        </div>

      </div>
    </div>
  );
}

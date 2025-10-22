// components/PanelTurnosInner.tsx
"use client";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Resumen = {
  profesionalId: Id<"profesionales">;
  pendientes: number;
  confirmados: number;
  cancelados: number;
  total: number;
  porcentajeConfirmados: number;
};

export default function PanelTurnosInner({
  profesionalesFiltrados,
  getEspecialidadNombre,
  argsResumen
}: {
  profesionalesFiltrados: any[];
  getEspecialidadNombre: (id: Id<"especialidades">) => string;
  argsResumen: Record<string, any>;
}) {
  // ❗️Hook SIEMPRE llamado, sin try/catch
  const data = useQuery(api.turnos.resumenProfesionales, argsResumen);
  // Mientras carga, Convex retorna undefined
  const lista: Resumen[] = Array.isArray(data) ? data : [];

  const mapa = useMemo(() => {
    const m = new Map<string, Resumen>();
    for (const r of lista) m.set(r.profesionalId as unknown as string, r);
    return m;
  }, [lista]);

  return (
    <div className="overflow-hidden border border-gray-200 rounded-xl shadow bg-white">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Panel de Turnos</h2>
      </div>
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-4 text-left">Profesional</th>
            <th className="p-4 text-left">Especialidad</th>
            <th className="p-4 text-center">Pendientes</th>
            <th className="p-4 text-center">Confirmados</th>
            <th className="p-4 text-center">Cancelados</th>
            <th className="p-4 text-center">Total</th>
            <th className="p-4 text-center">% Confirmados</th>
          </tr>
        </thead>
        <tbody>
          {profesionalesFiltrados.map((prof) => {
            const r = mapa.get(prof._id.toString()) ?? {
              pendientes: 0, confirmados: 0, cancelados: 0, total: 0, porcentajeConfirmados: 0
            };
            return (
              <tr key={`panel-${prof._id}`} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{prof.apellido} {prof.nombre}</td>
                <td className="p-4">{getEspecialidadNombre(prof.especialidadId)}</td>
                <td className="p-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{r.pendientes}</span></td>
                <td className="p-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{r.confirmados}</span></td>
                <td className="p-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">{r.cancelados}</span></td>
                <td className="p-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{r.total}</span></td>
                <td className="p-4 text-center">
                  <span className={[
                    "px-2 py-1 rounded-full text-xs font-semibold",
                    r.porcentajeConfirmados >= 80 ? "bg-emerald-100 text-emerald-700" :
                    r.porcentajeConfirmados >= 50 ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700",
                  ].join(" ")}>
                    {r.porcentajeConfirmados.toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
          {profesionalesFiltrados.length === 0 && (
            <tr><td colSpan={7} className="p-6 text-center text-gray-400 italic text-sm">No hay profesionales para mostrar en el panel.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

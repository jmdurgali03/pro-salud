"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { startOfDay, endOfDay } from "date-fns";

type TurnoConJoin = {
    _id: string;
    start: number;
    end: number;
    tipo: string;
    estado: "Confirmado" | "Pendiente" | "Cancelado";
    pacienteNombre: string;
    pacienteApellido: string;
    profesionalNombre: string;
    profesionalApellido: string;
    especialidadNombre: string;
    obrasSocialesPaciente: string[];
};

export default function ProximosTurnosHoy() {
    const hoy = new Date();
    const inicioHoy = startOfDay(hoy).getTime();
    const finHoy = endOfDay(hoy).getTime();

    // Obtener todos los turnos del día
    const todosLosTurnos = useQuery(api.turnos.listarRango, {
        from: inicioHoy,
        to: finHoy,
    }) as TurnoConJoin[] | undefined;

    // Filtrar solo los turnos futuros y ordenar por hora
    const turnosProximos = (todosLosTurnos || [])
        .filter((t) => t.start >= Date.now())
        .sort((a, b) => a.start - b.start)
        .slice(0, 5); // Mostrar solo los próximos 5 turnos

    return (
        <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b p-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Clock size={24} className="text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">Próximos Turnos de Hoy</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {!todosLosTurnos ? (
                    <div className="text-center py-8 text-gray-500">
                        Cargando turnos...
                    </div>
                ) : turnosProximos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay más turnos programados para hoy
                    </div>
                ) : (
                    <div className="space-y-4">
                        {turnosProximos.map((turno) => (
                            <div
                                key={turno._id}
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="text-center min-w-[80px]">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {new Date(turno.start).toLocaleTimeString("es-AR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>

                                    <div className="h-12 w-px bg-gray-200" />

                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 truncate">
                                            {turno.pacienteNombre} {turno.pacienteApellido}
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                            <span className="truncate">Profesional: {turno.profesionalNombre} {turno.profesionalApellido}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="truncate">{turno.especialidadNombre}</span>
                                        </div>
                                        {turno.obrasSocialesPaciente.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {turno.obrasSocialesPaciente[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Badge
                                        className={
                                            turno.estado === "Confirmado"
                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                : turno.estado === "Pendiente"
                                                    ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                                    : "bg-red-500 text-white hover:bg-red-600"
                                        }
                                    >
                                        {turno.estado}
                                    </Badge>
                                </div>
                            </div>
                        ))}

                        {todosLosTurnos && todosLosTurnos.length > turnosProximos.length && (
                            <Link href="/recepcionista/cal-turnos">
                                <div className="text-center pt-2">
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                                        Ver todos los turnos del día →
                                    </button>
                                </div>
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
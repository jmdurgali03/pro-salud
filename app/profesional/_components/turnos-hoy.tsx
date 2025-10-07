"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProfesionalTurnosHoy() {
    const { user } = useUser();

    // Buscar el profesional asociado al Clerk User
    const profesional = useQuery(api.profesionales.getByClerkUser, {
        clerkUserId: user?.id ?? "",
    });

    // Traer turnos del profesional
    const turnos =
        useQuery(
            api.turnos.listarConNombres,
            profesional?._id ? { profesionalId: profesional._id } : "skip"
        ) ?? [];

    // Filtrar próximos turnos (hoy y futuro, ordenados por fecha)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const proximosTurnos = turnos
        .filter((turno) => new Date(turno.start) >= today)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 5); // Mostrar solo los próximos 5 turnos

    // Formatear fecha
    const formatFecha = (timestamp: number) => {
        const date = new Date(timestamp);
        const hoy = new Date();
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);

        // Verificar si es hoy
        if (
            date.getDate() === hoy.getDate() &&
            date.getMonth() === hoy.getMonth() &&
            date.getFullYear() === hoy.getFullYear()
        ) {
            return "Hoy";
        }

        // Verificar si es mañana
        if (
            date.getDate() === mañana.getDate() &&
            date.getMonth() === mañana.getMonth() &&
            date.getFullYear() === mañana.getFullYear()
        ) {
            return "Mañana";
        }

        // Formato normal
        return new Intl.DateTimeFormat("es-AR", {
            weekday: "short",
            day: "numeric",
            month: "short",
        }).format(date);
    };

    const formatHora = (timestamp: number) => {
        return new Intl.DateTimeFormat("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(new Date(timestamp));
    };

    // Estados de turno con colores
    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "confirmado":
                return "bg-green-100 text-green-700 border-green-200";
            case "pendiente":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "cancelado":
                return "bg-red-100 text-red-700 border-red-200";
        }
    };

    if (proximosTurnos.length === 0) {
        return (
            <div className="mb-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Próximos Turnos</h2>
                    </div>
                </div>
                <Card className="border border-gray-200/60">
                    <CardContent className="p-8 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay turnos programados próximamente</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Próximos Turnos</h2>
                </div>
                <Link
                    href="/profesional/cal-turnos"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm transition-colors"
                >
                    Ver agenda completa
                    <ArrowRight size={16} />
                </Link>
            </div>

            <div className="space-y-3">
                {proximosTurnos.map((turno) => (
                    <Card
                        key={turno._id}
                        className="border border-gray-200/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group hover:-translate-y-0.5"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Fecha y hora */}
                                    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl px-4 py-3 min-w-[90px] shadow-md shadow-blue-500/20">
                                        <span className="text-xs font-medium opacity-90">
                                            {formatFecha(turno.start)}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {formatHora(turno.start)}
                                        </span>
                                    </div>

                                    {/* Información del paciente */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <User size={16} className="text-gray-400" />
                                            <h3 className="font-semibold text-gray-900">
                                                {turno.pacienteNombre || "Sin nombre"}
                                                {" "}
                                                {turno.pacienteApellido || "Sin apellido"}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock size={14} className="text-gray-400" />
                                            <span>
                                                {formatHora(turno.start)} - {formatHora(turno.end)}
                                            </span>
                                        </div>
                                        {(turno as any).motivo && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                                {(turno as any).motivo}
                                            </p>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
                                                turno.estado
                                            )}`}
                                        >
                                            {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
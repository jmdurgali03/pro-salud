"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, UserPlus, BriefcaseMedical, Clock, User, Stethoscope } from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";

const actions = [
    {
        title: "Agendar Turno",
        description: "Programa citas para pacientes",
        icon: Calendar,
        href: "/recepcionista/cal-turnos",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        title: "Registrar Paciente",
        description: "Alta de nuevos pacientes",
        icon: UserPlus,
        href: "/recepcionista/pacientes",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        title: "Datos Profesional",
        description: "Información de especialistas",
        icon: BriefcaseMedical,
        href: "/recepcionista/profesional",
        gradient: "from-purple-500 to-pink-500",
    },
];

type TurnoConJoin = {
    _id: string;
    start: number;
    end: number;
    tipo: string;
    estado: "Confirmado" | "Pendiente" | "Cancelado";
    pacienteNombre: string;
    profesionalNombre: string;
    especialidadNombre: string;
    obrasSocialesPaciente: string[];
};

export default function RecepcionistaHome() {
    // Obtener turnos desde el inicio del día actual hasta 7 días adelante
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const turnos = (useQuery(api.turnos.listarRango, {
        from: inicioHoy.getTime(),
        to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(),
    }) as TurnoConJoin[]) ?? [];

    const ahora = Date.now();

    // Buscar turno en curso o próximo turno
    const turnosActivos = turnos.filter(t =>
        (t.estado === "Confirmado" || t.estado === "Pendiente")
    );

    // Primero buscar si hay un turno EN CURSO (entre start y end)
    const turnoEnCurso = turnosActivos.find(t =>
        t.start <= ahora && t.end >= ahora
    );

    // Si no hay turno en curso, buscar el próximo turno futuro
    const proximoTurnoFuturo = turnosActivos
        .filter(t => t.start > ahora)
        .sort((a, b) => a.start - b.start)[0];

    const proximoTurno = turnoEnCurso || proximoTurnoFuturo;
    const esEnCurso = !!turnoEnCurso;

    return (
        <PageWrapper breadcrumbs={[{ label: "Inicio", href: "/recepcionista" }]}>
            <div className="w-full max-w-7xl mx-auto py-10 px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Mesa de Entrada</h1>
                    <p className="text-gray-600">Gestiona turnos, pacientes y profesionales desde un solo lugar</p>
                </div>

                {/* Actions Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {actions.map(({ title, description, icon: Icon, href, gradient }) => (
                        <Link key={href} href={href} className="block group">
                            <Card className="hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden h-full group-hover:-translate-y-1">
                                <CardContent className="p-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={28} className="text-white" />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
                                    <p className="text-sm text-gray-500">{description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Próximo Turno */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {esEnCurso ? "Turno en Curso" : "Próximo Turno"}
                    </h2>

                    {proximoTurno ? (
                        <Card className={`border-l-4 ${esEnCurso ? 'border-l-green-500 bg-green-50' : 'border-l-blue-500'} shadow-lg`}>
                            <CardContent className="p-6">
                                {esEnCurso && (
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-green-700 font-semibold text-sm uppercase">En curso ahora</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Fecha y Hora */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Clock className="text-blue-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Fecha y Hora</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(proximoTurno.start).toLocaleDateString("es-AR", {
                                                    day: "numeric",
                                                    month: "long",
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(proximoTurno.start).toLocaleTimeString("es-AR", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Paciente */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <User className="text-green-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Paciente</p>
                                            <p className="font-semibold text-gray-900">{proximoTurno.pacienteNombre}</p>
                                            {proximoTurno.obrasSocialesPaciente.length > 0 && (
                                                <p className="text-sm text-gray-600">{proximoTurno.obrasSocialesPaciente[0]}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Profesional */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <Stethoscope className="text-purple-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Profesional</p>
                                            <p className="font-semibold text-gray-900">{proximoTurno.profesionalNombre}</p>
                                            <p className="text-sm text-gray-600">{proximoTurno.especialidadNombre}</p>
                                        </div>
                                    </div>

                                    {/* Estado y Tipo */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <Calendar className="text-amber-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Información</p>
                                            <Badge
                                                className={`mb-2 ${proximoTurno.estado === "Confirmado"
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : "bg-yellow-500 hover:bg-yellow-600"
                                                    }`}
                                            >
                                                {proximoTurno.estado}
                                            </Badge>
                                            <p className="text-sm text-gray-600">{proximoTurno.tipo}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-2">
                            <CardContent className="p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="text-gray-400" size={32} />
                                </div>
                                <p className="text-gray-500 text-lg">No hay turnos programados próximamente</p>
                                <p className="text-gray-400 text-sm mt-2">Los turnos aparecerán aquí cuando se agenden</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
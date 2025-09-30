"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, UserPlus, BriefcaseMedical } from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";
import ProximosTurnosHoy from "./_components/prox-turnos";

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

export default function RecepcionistaHome() {

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

                <ProximosTurnosHoy />
            </div>
        </PageWrapper>
    );
}
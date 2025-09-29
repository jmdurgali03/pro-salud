"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, UserPlus, BriefcaseMedical } from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";

const actions = [
    {
        title: "Agendar Turno",
        icon: Calendar,
        href: "/recepcionista/cal-turnos",
        color: "bg-blue-100 text-blue-600",
    },
    {
        title: "Registrar Paciente",
        icon: UserPlus,
        href: "/recepcionista/pacientes",
        color: "bg-green-100 text-green-600",
    },
    {
        title: "Datos Profesional",
        icon: BriefcaseMedical,
        href: "/recepcionista/profesional",
        color: "bg-purple-100 text-purple-600",
    },
];

export default function RecepcionistaHome() {
    return (
        <PageWrapper breadcrumbs={[{ label: "Inicio", href: "/recepcionista" }]}>
            <div className="w-full max-w-7xl mx-auto py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {actions.map(({ title, icon: Icon, href, color }) => (
                        <Link key={href} href={href} className="block">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer rounded-xl">
                                <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}>
                                        <Icon size={28} />
                                    </div>
                                    <span className="font-medium text-gray-900">{title}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </PageWrapper>
    );
}

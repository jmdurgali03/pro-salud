"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ArrowRight,
  Users,
  CircleUserIcon,
  ChartBarBigIcon,
} from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";
import { useUser } from "@clerk/nextjs";
import { ProfesionalTurnosHoy } from "./_components/turnos-hoy";

const actions = [
  {
    title: "Perfil",
    description: "Información personal y configuración",
    icon: CircleUserIcon,
    href: "/profesional/perfil",
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-50",
    shadowColor: "shadow-violet-500/20",
  },
  {
    title: "Gestión de Turnos",
    description: "Agenda y administra turnos médicos",
    icon: Calendar,
    href: "/profesional/cal-turnos",
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    shadowColor: "shadow-blue-500/20",
  },
  {
    title: "Pacientes",
    description: "Registro y gestión de pacientes",
    icon: Users,
    href: "/profesional/pacientes",
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50",
    shadowColor: "shadow-green-500/20",
  },
  {
    title: "Reportes",
    description: "Visualiza métricas y estadísticas profesionales",
    icon: ChartBarBigIcon,
    href: "/profesional/reportes",
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    shadowColor: "shadow-amber-500/20",
  },
];

export default function ProfesionalHome() {
  const { user } = useUser();

  return (
    <>
      <PageWrapper breadcrumbs={[{ label: "Inicio", href: "/profesional" }]}>
        <div className="w-full min-h-screen bg-white">
          <div className="max-w-7xl mx-auto py-8 px-6">
            {/* Header Section */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Bienvenido {user?.fullName}
                </h1>
              </div>
              <p className="text-gray-600 text-lg ml-5">
                Gestiona la información de tus pacientes y administra tus turnos.
              </p>
            </div>

            {/* Quick Actions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {actions.map(
                ({
                  title,
                  description,
                  icon: Icon,
                  href,
                  gradient,
                  bgLight,
                  shadowColor,
                }) => (
                  <Link key={href} href={href} className="block group">
                    <Card
                      className={`hover:shadow-2xl ${shadowColor} transition-all duration-300 border border-gray-200/60 overflow-hidden h-full group-hover:-translate-y-1 group-hover:border-transparent relative`}
                    >
                      <CardContent className="p-6 relative">
                        {/* Background decoration */}
                        <div
                          className={`absolute top-0 right-0 w-40 h-40 ${bgLight} rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-0`}
                        ></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-4`}
                          >
                            <Icon
                              size={28}
                              className="text-white"
                              strokeWidth={2.5}
                            />
                          </div>

                          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                            {title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {description}
                          </p>

                          <ArrowRight
                            size={20}
                            className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300 mt-4"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              )}
            </div>

            <div className="mt-10">
              <ProfesionalTurnosHoy />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
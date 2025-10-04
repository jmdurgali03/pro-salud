"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  UserPlus,
  BriefcaseMedical,
  ArrowRight,
  Home,
  Users,
} from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";
import { useUser, UserButton } from "@clerk/nextjs";
import { AppSidebar } from "@/components/sidebar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// 🔹 Acciones principales del panel
const actions = [
  {
    title: "Vista Agenda",
    description: "Visualiza los turnos ocupados y disponibles.",
    icon: Calendar,
    href: "/profesional/cal-turnos",
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    shadowColor: "shadow-blue-500/20",
  },
  {
    title: "Registrar Paciente",
    description: "Alta de nuevos pacientes",
    icon: UserPlus,
    href: "/profesional/pacientes",
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50",
    shadowColor: "shadow-green-500/20",
  },
  {
    title: "Datos Profesional",
    description: "Información de especialistas",
    icon: BriefcaseMedical,
    href: "/profesional/profesional",
    gradient: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-50",
    shadowColor: "shadow-purple-500/20",
  },
];

// 🔹 Enlaces del sidebar
const links = [
  { href: "/profesional", label: "Inicio", icon: Home },
  { href: "/profesional/cal-turnos", label: "Turnos", icon: Calendar },
  { href: "/profesional/pacientes", label: "Pacientes", icon: Users },
];

export default function ProfesionalHome() {
  const { user } = useUser();

  // 🔹 Consultamos datos del profesional logueado
  const profesional = useQuery(api.profesionales.getByClerkUser, {
    clerkUserId: user?.id || "",
  });

  return (
    <>
      <AppSidebar links={links} panelName="Panel Profesional" />

      <PageWrapper breadcrumbs={[{ label: "Inicio", href: "/profesional" }]}>
        <div className="w-full min-h-screen bg-white">
          <div className="max-w-7xl mx-auto py-8 px-6 space-y-10">
            {/* 🔹 Encabezado con información del profesional */}
           

            {/* 🔹 Bienvenida */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Bienvenido {user?.fullName}
                </h1>
              </div>
              <p className="text-gray-600 text-lg ml-5">
                Gestiona la información de tus pacientes y administra tus
                turnos.
              </p>
            </div>

            {/* 🔹 Accesos Rápidos */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Accesos Rápidos
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        className={`hover:shadow-xl ${shadowColor} transition-all duration-300 border border-gray-200/60 overflow-hidden h-full group-hover:-translate-y-1 group-hover:border-transparent relative`}
                      >
                        <CardContent className="p-6 relative">
                          {/* Decoración de fondo */}
                          <div
                            className={`absolute top-0 right-0 w-32 h-32 ${bgLight} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-0`}
                          ></div>

                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                                  {title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {description}
                                </p>
                              </div>
                              <ArrowRight
                                size={20}
                                className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                              />
                            </div>

                            <div
                              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}
                            >
                              <Icon
                                size={26}
                                className="text-white"
                                strokeWidth={2.5}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

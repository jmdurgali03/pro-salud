"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseMedical, ArrowRight, Home, Users, Cross, Stethoscope} from "lucide-react";
import { PageWrapper } from "@/components/page-wrapper";
import { useUser } from "@clerk/nextjs";
import { AppSidebar } from "@/components/sidebar";



const actions = [
  {
    title: "Registrar Profesional",
    description: "Alta de nuevo Especialista",
    icon: BriefcaseMedical,
    href: "/gerente/profesional",
    gradient: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-50",
    shadowColor: "shadow-purple-500/20",
  },
];

const links = [
  { href: "/gerente", label: "Inicio", icon: Home },
  { href: "/gerente/profesional", label: "Profesionales", icon: BriefcaseMedical },
  { href: "/gerente/pacientes", label: "Pacientes", icon: Users },
  { href: "/gerente/obras-sociales", label: "Obras Sociales", icon: Cross},
  { href: "/gerente/especialidades", label: "Especialidades", icon: Stethoscope},


];

export default function GerenteHome() {
  const { user } = useUser();
  return (
    <>
      <AppSidebar links={links} panelName="Panel Gerente" />
      <PageWrapper breadcrumbs={[{ label: "Inicio", href: "/gerente" }]}>
        <div className="w-full min-h-screen bg-white px-16 py-12 space-y-12">
          
          {/* Header Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-10 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h1 className="text-4xl font-bold text-gray-900">
                                    Bienvenido {user?.fullName}
                                </h1>
            </div>
            <p className="text-gray-600 text-lg ml-5">
              Gestiona turnos, pacientes y profesionales desde un solo lugar
            </p>
          </div>

          {/* Quick Actions Section */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300"></div>
              <h2 className="text-2xl font-semibold text-gray-800">Accesos Rápidos</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {actions.map(({ title, description, icon: Icon, href, gradient, bgLight, shadowColor }) => (
                <Link key={href} href={href} className="block group">
                  <Card
                    className={`hover:shadow-xl ${shadowColor} transition-all duration-300 border border-gray-200/60 overflow-hidden h-full group-hover:-translate-y-1 group-hover:border-transparent relative`}
                  >
                    <CardContent className="p-8 relative">
                      {/* Background decoration */}
                      <div
                        className={`absolute top-0 right-0 w-40 h-40 ${bgLight} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-0`}
                      ></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                              {title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {description}
                            </p>
                          </div>
                          <ArrowRight
                            size={22}
                            className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                          />
                        </div>

                        <div
                          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon size={28} className="text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

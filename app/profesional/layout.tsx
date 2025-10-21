"use client"

import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Calendar, ChartBarBigIcon, CircleUserIcon, Home, Users } from "lucide-react";

const links = [
    { href: "/profesional", label: "Inicio", icon: Home },
    { href: "/profesional/perfil", label: "Perfil", icon: CircleUserIcon },
    { href: "/profesional/cal-turnos", label: "Turnos", icon: Calendar },
    { href: "/profesional/pacientes", label: "Pacientes", icon: Users },
    { href: "/profesional/reportes", label: "Reportes", icon: ChartBarBigIcon },
];

export default function ProfesionalLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar links={links} panelName="Panel Profesional" />
            <div className="flex w-full h-screen">
                <main className="flex-1 w-full overflow-y-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}

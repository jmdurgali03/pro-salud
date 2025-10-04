"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Home, BriefcaseMedical, Users, Cross, Stethoscope, ChartLine, BadgeCheck} from "lucide-react";

const links = [
  { href: "/gerente", label: "Inicio", icon: Home },
  { href: "/gerente/profesional", label: "Profesionales", icon: BriefcaseMedical },
  { href: "/gerente/pacientes", label: "Pacientes", icon: Users },
  { href: "/gerente/obras-sociales", label: "Obras Sociales", icon: Cross },
  { href: "/gerente/especialidades", label: "Especialidades", icon: Stethoscope},
  { href: "/gerente/permisos", label: "Permisos", icon: BadgeCheck},
  {href: "/gerente/reportes", label: "Reportes", icon: ChartLine},

];

export default function GerenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar links={links} panelName="Panel Gerente" />

        <main className="flex-1 w-full overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

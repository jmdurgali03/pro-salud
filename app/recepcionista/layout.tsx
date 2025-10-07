"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Home, BriefcaseMedical, Users, Calendar, CalendarSearch } from "lucide-react";

const links = [
  { href: "/recepcionista", label: "Inicio", icon: Home },
  { href: "/recepcionista/cal-turnos", label: "Calendario", icon: Calendar },
  { href: "/recepcionista/turnos", label: "Turnos", icon: CalendarSearch },
  { href: "/recepcionista/pacientes", label: "Pacientes", icon: Users },
  { href: "/recepcionista/profesional", label: "Profesionales", icon: BriefcaseMedical },
];

export default function RecepcionistaLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <AppSidebar links={links} panelName="Panel Recepcionista" />
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

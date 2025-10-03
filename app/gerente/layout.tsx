"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Home, BriefcaseMedical } from "lucide-react";

const links = [
  { href: "/gerente", label: "Inicio", icon: Home },
  { href: "/gerente/profesional", label: "Profesionales", icon: BriefcaseMedical },
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

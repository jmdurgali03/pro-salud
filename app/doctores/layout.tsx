"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DoctorSidebar } from "./_components/sidebar-rec"; // si tenés uno especial para doctor, cambialo

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen">
        <DoctorSidebar />
        <main className="flex-1 w-full p-6 bg-gray-50">{children}</main>
      </div>
    </SidebarProvider>
  );
}

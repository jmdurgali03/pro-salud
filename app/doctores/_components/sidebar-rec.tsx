"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  Users2,
  BriefcaseMedical,
  Home,
  LogOut,
  HeartPulse,
} from "lucide-react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { User } from "@clerk/nextjs/server";

const links = [
  { href: "/profesional", label: "Inicio", icon: Home },
  //{ href: "/doctores/perfil", label: "Perfil", icon: BriefcaseMedical },
  { href: "/profesional/pacientes", label: "Pacientes", icon: Users2 },
];

export function DoctorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { user } = useUser();

  // Buscar datos del profesional (nombre, apellido, especialidad, contacto)
  const profesional = useQuery(api.profesionales.getByClerkUser, {
    clerkUserId: user?.id || "",
  });

  return (
    <Sidebar {...props}>
      {/* Header con logo */}
      <SidebarHeader className="flex items-center gap-2 px-4 py-3 border-b">
        <div className="p-2 bg-blue-100 rounded-md">
          <HeartPulse className="w-6 h-6 text-blue-600" />
        </div>
        <span className="font-semibold text-gray-800">ProSalud</span>
      </SidebarHeader>

      {/* Perfil del Doctor */}
      {profesional && (
        <div className="flex flex-col items-center px-4 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <UserButton appearance={{ elements: { avatarBox: "w-16 h-16" } }} />
          <h2 className="mt-2 text-base font-semibold text-gray-800">
            Dr. {profesional.nombre} {profesional.apellido}
          </h2>
          <p className="text-xs text-gray-500">{profesional.contacto}</p>
          <p className="mt-1 text-sm font-medium text-blue-600">
            {profesional.especialidadNombre || "Especialidad"}
          </p>
        </div>
      )}

      {/* Links principales */}
      <SidebarContent>
        <SidebarMenu>
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                      ${isActive
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-blue-600" : "text-gray-600"}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer con logout */}
      <div className="mt-auto border-t p-4 flex flex-col gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2"
              variant="ghost"
            >
              <LogOut className="w-5 h-5" />
              <span>Salir</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                Se cerrará tu sesión actual y tendrás que volver a iniciar sesión
                para acceder nuevamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => signOut({ redirectUrl: "/" })}
              >
                Cerrar sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}

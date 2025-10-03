"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calendar,
    Users,
    BriefcaseMedical,
    Home,
    LogOut,
    HeartPulse,
} from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";

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

const links = [
    { href: "/profesional", label: "Inicio", icon: Home },
    { href: "/profesional/cal-turnos", label: "Turnos", icon: Calendar },
    { href: "/profesional/pacientes", label: "Pacientes", icon: Users },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const { signOut } = useAuth();

    return (
        <Sidebar {...props} className="border-r bg-gradient-to-b from-white to-gray-50/50">
            {/* Header con logo */}
            <SidebarHeader className="flex items-center gap-3 px-6 py-5 border-b border-gray-200/60">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                    <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-xl text-gray-800 tracking-tight">ProSalud</span>
                <span className="text-xs text-slate-500">Panel Profesional</span>
            </SidebarHeader>

            {/* Links principales */}
            <SidebarContent className="px-3 py-4">
                <SidebarMenu className="space-y-2">
                    {links.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <SidebarMenuItem key={href}>
                                <SidebarMenuButton asChild isActive={isActive}>
                                    <Link
                                        href={href}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 group
                      ${isActive
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                                                : "text-gray-700 hover:bg-gray-100 hover:scale-[1.01]"}
                    `}
                                    >
                                        <Icon
                                            size={24}
                                            strokeWidth={2.5}
                                            className={`transition-transform duration-200 ${isActive
                                                ? "text-white"
                                                : "text-gray-500 group-hover:text-blue-600 group-hover:scale-110"
                                                }`}
                                        />
                                        <span className={`text-base font-semibold ${isActive ? "text-white" : ""}`}>
                                            {label}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer con user y logout */}
            <div className="mt-auto border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-center p-2">
                        <UserButton />
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 border border-gray-200 bg-white shadow-sm hover:shadow-md group"
                                variant="ghost"
                            >
                                <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span className="font-medium">Salir</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl">Â¿Cerrar sesiÃ³n?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600">
                                    Se cerrarÃ¡ tu sesiÃ³n actual y tendrÃ¡s que volver a iniciar sesiÃ³n
                                    para acceder nuevamente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg shadow-red-600/30"
                                    onClick={() => signOut({ redirectUrl: "/" })}
                                >
                                    Cerrar sesiÃ³n
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <SidebarRail />
        </Sidebar>
    );
}
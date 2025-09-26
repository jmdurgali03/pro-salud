"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calendar,
    Users,
    BriefcaseMedical,
    HeartPulse,
    ChevronRight,
    ChevronLeft,
    LogOut,
} from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
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
    { href: "/recepcionista/cal-turnos", label: "Turnos", icon: Calendar },
    { href: "/recepcionista/pacientes", label: "Pacientes", icon: Users },
    { href: "/recepcionista/profesional", label: "Profesionales", icon: BriefcaseMedical },
];

export function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(false);
    const { signOut } = useAuth();

    // Colapsar sidebar al navegar en mobile
    useEffect(() => {
        setExpanded(false);
    }, [pathname]);

    return (
        <aside
            className={`${expanded ? "w-56" : "w-16 md:w-56"} h-screen border-r bg-white transition-all 
            duration-300 flex flex-col justify-between fixed md:static z-50`}
        >
            {/* Header con Logo */}
            <div>
                <div className="flex items-center gap-3 px-4 py-4 border-b">
                    <div className="p-2 bg-blue-100 rounded-md">
                        <HeartPulse className="w-6 h-6 text-blue-600" />
                    </div>
                    <span
                        className={`font-semibold text-gray-800 ${expanded ? "inline" : "hidden"
                            } md:inline`}
                    >
                        ProSalud
                    </span>
                </div>

                {/* Chevron debajo del logo (solo en mobile) */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="md:hidden w-full flex items-center justify-center py-2 border-b hover:bg-gray-50"
                >
                    {expanded ? (
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                </button>

                {/* Links */}
                <nav className="flex flex-col py-4">
                    {links.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`
                                group flex items-center gap-3 px-4 py-2 my-1 rounded-md transition-all
                                hover:bg-gray-100 
                                ${isActive ? "shadow-[0_0_6px_rgba(0,150,255,0.4)] bg-blue-50" : ""}
                                `}
                            >
                                <Icon
                                    size={22}
                                    className={`${isActive ? "text-blue-600" : "text-gray-600 group-hover:text-gray-800"
                                        }`}
                                />
                                <span
                                    className={`text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-700"
                                        } ${expanded ? "inline" : "hidden"} md:inline`}
                                >
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom: User + Logout */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 p-4 border-t">
                {/* User Button */}
                <div className="w-full md:w-auto flex justify-center">
                    <UserButton />
                </div>

                {/* Logout Button */}
                <div className="w-full md:w-auto">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="w-full md:w-auto hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                                variant="ghost"
                            >
                                <LogOut className="w-5 h-5" />
                                {/* Texto: siempre en desktop, en mobile solo si expanded */}
                                <span className={`${expanded ? "inline" : "hidden"} md:inline`}>Salir</span>
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
            </div>
        </aside>
    );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";

export function Navbar() {
    const { isSignedIn } = useUser();
    const { userId } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    const currentUser = useQuery(
        api.users.getCurrentUser,
        userId ? { clerkId: userId } : "skip"
    );

    const { goToRolePage } = useRoleRedirect();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleHomeClick = () => {
        if (currentUser?.role) {
            goToRolePage(currentUser.role);
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "backdrop-blur-md bg-white/80 shadow-md"
                : "bg-white/95"
                }`}
        >
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                {/* Logo */}
                <Link href="#inicio" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="ProSalud Logo"
                        width={160}
                        height={160}
                        priority
                    />
                    <span className="sr-only">ProSalud</span>
                </Link>

                {/* Links desktop */}
                <nav className="hidden md:flex gap-8 text-lg font-medium text-gray-700">
                    {[
                        { href: "#inicio", label: "Inicio" },
                        { href: "#servicios", label: "Servicios" },
                        { href: "#contacto", label: "Contacto" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="transition-all hover:shadow-md hover:shadow-gray-300 rounded-md px-2 py-1 hover:text-gray-900"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Botones desktop */}
                <div className="hidden md:flex items-center gap-4">
                    {isSignedIn ? (
                        <>
                            <UserButton afterSignOutUrl="/" />
                            <Button onClick={handleHomeClick}>Home</Button>
                        </>
                    ) : (
                        <>
                            <Button asChild>
                                <Link href="/sign-up">Registrarse</Link>
                            </Button>
                            <Button disabled>Home</Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-7 w-7" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-6">
                            <SheetTitle className="sr-only">Menu de nav</SheetTitle>

                            <nav className="flex flex-col gap-4 text-lg font-medium mt-4">
                                <Link
                                    href="#inicio"
                                    className="hover:bg-gray-100 hover:shadow-md hover:shadow-gray-300 rounded-md px-3 py-1"
                                >
                                    Inicio
                                </Link>
                                <Link
                                    href="#servicios"
                                    className="hover:bg-gray-100 hover:shadow-md hover:shadow-gray-300 rounded-md px-3 py-1"
                                >
                                    Servicios
                                </Link>
                                <Link
                                    href="#acerca"
                                    className="hover:bg-gray-100 hover:shadow-md hover:shadow-gray-300 rounded-md px-3 py-1"
                                >
                                    Acerca de
                                </Link>
                                <Link
                                    href="#contacto"
                                    className="hover:bg-gray-100 hover:shadow-md hover:shadow-gray-300 rounded-md px-3 py-1"
                                >
                                    Contacto
                                </Link>
                            </nav>

                            <div className="mt-6">
                                {isSignedIn ? (
                                    <div className="flex items-center gap-3">
                                        <UserButton afterSignOutUrl="/" />
                                        <Button className="flex-1" onClick={handleHomeClick}>
                                            Home
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Button asChild className="flex-1">
                                            <Link href="/sign-up">Registrarse</Link>
                                        </Button>
                                        <Button disabled className="flex-1">
                                            Home
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

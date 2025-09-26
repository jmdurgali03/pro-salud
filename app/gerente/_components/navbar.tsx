"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { isSignedIn } = useUser();
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { href: "/gerente/dashboard", label: "Inicio" },
        { href: "/gerente/pacientes", label: "Pacientes" },
        { href: "/gerente/profesionales", label: "Profesionales" },
        { href: "/gerente/turno", label: "Turno" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 w-full border z-50 transition-all duration-300 ${scrolled
                ? "backdrop-blur-md bg-white/80 shadow-md"
                : "bg-white/95"
                }`}
        >
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="ProSalud Logo"
                        width={120}
                        height={40}
                        className="h-40 w-auto"
                        priority
                    />
                </Link>

                {/* Links desktop */}
                <nav className="hidden md:flex gap-8 text-lg font-medium absolute left-1/2 -translate-x-1/2">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`relative px-2 py-1 transition-all rounded-md
                            hover:shadow-md hover:shadow-gray-300 
                            ${pathname === link.href
                                    ? "text-blue-600 font-semibold "
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* User / Registro */}
                <div className="hidden md:flex items-center gap-4">
                    {isSignedIn ? (
                        <UserButton />
                    ) : (
                        <Button asChild>
                            <Link href="/sign-up">Registrarse</Link>
                        </Button>
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
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`rounded-md px-3 py-1 transition-all
                                        hover:bg-gray-100 hover:shadow-md hover:shadow-gray-300
                                        ${pathname === link.href
                                                ? "text-blue-600 font-semibold shadow-[0_0_10px_rgba(0,200,200,0.6)]"
                                                : "text-gray-700"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-6">
                                {isSignedIn ? (
                                    <UserButton />
                                ) : (
                                    <Button asChild>
                                        <Link href="/sign-up">Registrarse</Link>
                                    </Button>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

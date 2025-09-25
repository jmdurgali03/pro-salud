"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo + Nombre */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-black" /> {/* cuadradito del logo */}
          <span className="font-semibold text-blue-600 text-lg">ProSalud</span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Inicio
          </Link>
          <Link href="/pacientes" className="hover:text-gray-900">
            Pacientes
          </Link>
          <Link href="/profesionales" className="hover:text-gray-900">
            Profesionales
          </Link>
          <Link href="/cal-turnos" className="hover:text-gray-900">
            Turnos
          </Link>
          <Link href="/facturacion" className="hover:text-gray-900">
            Facturación
          </Link>
          <Link href="/informes" className="hover:text-gray-900">
            Informes
          </Link>
        </nav>

        {/* Search + Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              className="pl-9 pr-3 py-1.5 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Image
            src="/avatar.png" // cámbialo por la ruta de tu avatar real
            alt="Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      </div>
    </header>
  );
}

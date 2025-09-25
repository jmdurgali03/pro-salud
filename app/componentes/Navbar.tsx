"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="text-xl font-bold text-sky-700">ProSalud</div>

        {/* Links */}
        <nav className="flex items-center gap-6 text-gray-700 font-medium">
          <Link href="/">Inicio</Link>
          <Link href="/pacientes">Pacientes</Link>
          <Link href="/profesionales">Profesionales</Link>
          <Link href="/citas">Citas</Link>
          <Link href="/facturacion">Facturación</Link>
          <Link href="/informes">Informes</Link>
        </nav>

        {/* Perfil */}
        <div>
          <img
            src="/avatar.png"
            alt="perfil"
            className="h-8 w-8 rounded-full border"
          />
        </div>
      </div>
    </header>
  );
}

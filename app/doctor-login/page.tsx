"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DoctorLogin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const profesionales = useQuery(api.profesionales.listar) ?? [];

  const handleLogin = () => {
    const doctor = profesionales.find(
      (p) => p.usuario === usuario && p.password === password
    );
    if (doctor) {
      router.push(`/doctores/${doctor._id}`);
    } else {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Acceso Doctor</h1>
      <input
        className="border p-2 mb-2 w-64"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />
      <input
        className="border p-2 mb-4 w-64"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Ingresar
      </button>
    </div>
  );
}

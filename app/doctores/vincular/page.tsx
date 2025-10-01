"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function VincularDoctor() {
  const { user } = useUser();
  const router = useRouter();
  const vincular = useMutation(api.profesionales.vincularConClerk);

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!user) return;
    const res = await vincular({ usuario, password, clerkId: user.id });
    if (res.ok) {
      router.push("/doctores");
    } else {
      alert("Usuario o contraseña inválidos");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Vincular cuenta de Doctor</h1>
      <input
        className="border p-2 mb-2 w-64"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-64"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Vincular
      </button>
    </div>
  );
}

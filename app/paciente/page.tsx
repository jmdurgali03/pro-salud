"use client";

import { useUser } from "@clerk/nextjs";

export default function PacientePage() {
  const { user } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bienvenido {user?.firstName}</h1>
      <p>Aquí podrás ver tus turnos médicos, historial, etc.</p>
    </div>
  );
}

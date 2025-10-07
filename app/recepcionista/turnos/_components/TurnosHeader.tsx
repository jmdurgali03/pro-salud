import { CalendarCheck2 } from "lucide-react";

export function TurnosHeader() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
          <CalendarCheck2 className="w-6 h-6" />
          Administración de Turnos
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Visualizá, filtrá y gestioná los turnos de todos los profesionales.
        </p>
      </div>
    </header>
  );
}
import { useState } from "react";

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export default function Calendar({ selectedDate, onSelectDate }: Props) {
  // Estado para el mes actual
  const [currentDate, setCurrentDate] = useState(new Date(2024, 6, 1)); // Julio 2024 por defecto

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primer día y cantidad de días del mes
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Nombres cortos de semana
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  // Función para cambiar de mes
  const changeMonth = (offset: number) => {
    const newDate = new Date(year, month + offset, 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="w-full max-w-lg mb-10">
      {/* Header con navegación */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          {"<"}
        </button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          {">"}
        </button>
      </div>

      {/* Encabezado días de semana */}
      <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Espacios en blanco antes del primer día */}
        {Array.from({ length: firstDay }).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}

        {/* Días del mes */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const iso = date.toISOString().split("T")[0];
          const isSelected = selectedDate === iso;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(iso)}
              className={`p-2 rounded-full ${
                isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

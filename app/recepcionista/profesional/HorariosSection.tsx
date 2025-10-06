"use client";

import { useState } from "react";

export type Franja = {
  inicio: string;
  fin: string;
  dias: number[]; // días seleccionados 0=domingo ... 6=sábado
};

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

type Props = {
  initialFranjas?: Franja[];
  onChange: (franjas: Franja[]) => void;
};

export default function HorariosSection({ initialFranjas = [], onChange }: Props) {
  const [franjas, setFranjas] = useState<Franja[]>(
    initialFranjas.length > 0 ? initialFranjas : [{ inicio: "08:00", fin: "12:00", dias: [1, 2, 3, 4, 5] }]
  );

  const handleChange = (newFranjas: Franja[]) => {
    setFranjas(newFranjas);
    onChange(newFranjas);
  };

  const agregarFranja = () => {
    handleChange([...franjas, { inicio: "08:00", fin: "12:00", dias: [] }]);
  };

  const actualizarFranja = (index: number, cambios: Partial<Franja>) => {
    handleChange(
      franjas.map((f, i) => (i === index ? { ...f, ...cambios } : f))
    );
  };

  const eliminarFranja = (index: number) => {
    handleChange(franjas.filter((_, i) => i !== index));
  };

  const toggleDia = (index: number, dia: number) => {
    const nueva = [...franjas];
    const seleccionados = nueva[index].dias;
    if (seleccionados.includes(dia)) {
      nueva[index].dias = seleccionados.filter((d) => d !== dia);
    } else {
      nueva[index].dias = [...seleccionados, dia];
    }
    handleChange(nueva);
  };

  return (
    <div className="border-t border-gray-200 pt-5">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Horarios de atención
      </h3>

      {franjas.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">No hay franjas definidas.</p>
      )}

      <div className="space-y-4">
        {franjas.map((f, i) => (
          <div key={i} className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={f.inicio}
                onChange={(e) =>
                  actualizarFranja(i, { inicio: e.target.value })
                }
                className="border rounded-lg px-3 py-2 text-sm w-28"
              />
              <span className="text-gray-500">a</span>
              <input
                type="time"
                value={f.fin}
                onChange={(e) => actualizarFranja(i, { fin: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-28"
              />
              <button
                type="button"
                onClick={() => eliminarFranja(i)}
                className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Eliminar
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {DIAS_SEMANA.map((dia, diaIdx) => {
                const checked = f.dias.includes(diaIdx);
                return (
                  <label
                    key={diaIdx}
                    className={`flex items-center gap-2 text-sm cursor-pointer select-none px-2 py-1 rounded-md border ${
                      checked
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDia(i, diaIdx)}
                      className="hidden"
                    />
                    {dia}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
  type="button"
  onClick={agregarFranja}
  disabled={franjas.length >= 2}
  className={`mt-4 px-3 py-2 rounded-lg text-sm transition-colors ${
    franjas.length >= 2
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
  }`}
>
  + Agregar franja
</button>

    </div>
  );
}

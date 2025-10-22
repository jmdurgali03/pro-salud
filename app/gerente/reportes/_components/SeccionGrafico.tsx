"use client";

export function SeccionGrafico({
  titulo,
  icono,
  modo,
  setModo,
  fecha,
  setFecha,
  children,
  extraFiltro,
}: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          {icono} {titulo} ({modo})
        </h2>
        <div className="flex items-center gap-3">
          {extraFiltro}
          <select
            value={modo}
            onChange={(e) => setModo(e.target.value as any)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="dia">Por día</option>
            <option value="mes">Por mes</option>
            <option value="año">Por año</option>
          </select>
          <input
            type="month"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      {children}
    </div>
  );
}

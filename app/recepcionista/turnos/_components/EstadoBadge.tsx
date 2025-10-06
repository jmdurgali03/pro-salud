export function EstadoBadge({ estado }: { estado: string }) {
  const colorMap: Record<string, string> = {
    Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Confirmado: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Cancelado: "bg-red-100 text-red-800 border-red-300",
    Finalizado: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colorMap[estado] || "bg-gray-100"}`}
    >
      {estado}
    </span>
  );
}

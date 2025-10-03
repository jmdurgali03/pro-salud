type BadgeOptions = {
  compact?: boolean;
};

export const getObraSocialBadgeClass = (nombre: string, options: BadgeOptions = {}) => {
  const base = options.compact
    ? "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
    : "inline-block px-3 py-1 mr-1.5 mb-1.5 rounded-full text-xs font-semibold";
  switch (nombre) {
    case "OSDE":
    case "OSDE 310":
      return base + " bg-blue-100 text-blue-700 border border-blue-200";
    case "Swiss Medical":
      return base + " bg-cyan-100 text-cyan-700 border border-cyan-200";
    case "Sancor Salud":
      return base + " bg-purple-100 text-purple-700 border border-purple-200";
    case "IPS":
      return base + " bg-amber-100 text-amber-700 border border-amber-200";
    default:
      return base + " bg-gray-100 text-gray-700 border border-gray-200";
  }
};

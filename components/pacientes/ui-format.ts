// app/recepcionista/pacientes/_components/ui-format.ts
export function formatDNI(dni?: string) {
  if (!dni) return "—";
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function toDate(val?: string | number) {
  if (!val) return undefined;
  if (typeof val === "number") return new Date(val);
  const parts = typeof val === "string" ? val.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  if (parts) {
    const [, y, m, d] = parts;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const d2 = new Date(val as any);
  return isNaN(d2.getTime()) ? undefined : d2;
}

export function formatFechaEs(val?: string | number) {
  const d = toDate(val);
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}

export function calcularEdad(val?: string | number) {
  const d = toDate(val);
  if (!d) return "—";
  const hoy = new Date();
  let edad = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad--;
  return `${edad} años`;
}

export function initials(n?: string, a?: string) {
  return ((n?.[0] ?? "") + (a?.[0] ?? "")).toUpperCase() || "P";
}

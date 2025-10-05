// app/recepcionista/pacientes/_components/KPI.tsx
"use client";

export function KPI({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export function KPIGrid({
  consultas,
  diagnosticos,
  tratamientos,
  notas,
}: {
  consultas: number;
  diagnosticos: number;
  tratamientos: number;
  notas: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
      <KPI title="Consultas" value={consultas} />
      <KPI title="Diagnósticos" value={diagnosticos} />
      <KPI title="Tratamientos" value={tratamientos} />
      <KPI title="Notas médicas" value={notas} />
    </div>
  );
}

"use client";
import Table from "./Table";

type Diagnostico = {
  _id: string;
  fecha: number;
  descripcion: string;
  profesional: string;
};

export default function DiagnosticosTable({ data }: { data: Diagnostico[] | null | undefined }) {
  return (
    <Table headers={["Fecha", "Diagnóstico", "Profesional"]}>
      {(data ?? []).map((d) => (
        <tr key={d._id} className="text-gray-800">
          <td className="px-4 py-3">{new Date(d.fecha).toLocaleDateString()}</td>
          <td className="px-4 py-3 text-cyan-700">{d.descripcion}</td>
          <td className="px-4 py-3">{d.profesional}</td>
        </tr>
      ))}
      {(data?.length ?? 0) === 0 && (
        <tr>
          <td className="px-4 py-4 text-gray-600" colSpan={3}>
            No hay diagnósticos registrados.
          </td>
        </tr>
      )}
    </Table>
  );
}

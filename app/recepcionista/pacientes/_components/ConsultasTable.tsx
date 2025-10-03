"use client";
import Table from "./Table";

type Consulta = {
  _id: string;
  fecha: number;
  motivo: string;
  profesional: string;
  notas?: string;
};

export default function ConsultasTable({ data }: { data: Consulta[] | null | undefined }) {
  return (
    <Table headers={["Fecha", "Motivo", "Médico", "Notas"]}>
      {(data ?? []).map((c) => (
        <tr key={c._id} className="text-gray-800">
          <td className="px-4 py-3">{new Date(c.fecha).toLocaleDateString()}</td>
          <td className="px-4 py-3 text-cyan-700">{c.motivo}</td>
          <td className="px-4 py-3">{c.profesional}</td>
          <td className="px-4 py-3 text-gray-600">{c.notas ?? "-"}</td>
        </tr>
      ))}
      {(data?.length ?? 0) === 0 && (
        <tr>
          <td className="px-4 py-4 text-gray-600" colSpan={4}>
            No hay consultas registradas.
          </td>
        </tr>
      )}
    </Table>
  );
}

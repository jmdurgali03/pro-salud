const appointments: Record<string, {
  hora: string;
  paciente: string;
  profesional: string;
  tipo: string;
  estado: string;
}[]> = {
  "2024-07-15": [
    { hora: "09:00 - 10:00", paciente: "Sofía", profesional: "Dr. García", tipo: "Consulta", estado: "Confirmado" }
  ]
};

export default function AppointmentsTable({ selectedDate }: { selectedDate: string }) {
  const turnos = appointments[selectedDate] ?? [];

  return (
    <tbody>
      {turnos.map((a, idx) => (
        <tr key={idx}>
          <td>{a.hora}</td>
          <td>{a.paciente}</td>
          <td>{a.profesional}</td>
          <td>{a.tipo}</td>
          <td>{a.estado}</td>
        </tr>
      ))}
    </tbody>
  );
}

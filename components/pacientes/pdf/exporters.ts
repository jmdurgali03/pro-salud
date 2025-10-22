import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** ===== Tipos LITE (permisivos) ===== */
export type PacienteLite = {
  _id: any;
  nombre?: string;
  apellido?: string;
  dni?: string;
  genero?: string;
  fechaNacimiento?: string | number;
  email?: string;
  telefono?: string;
  obrasSocialesNombres?: string[];
};

export type DiagnosticoLite = {
  _id: any;
  descripcion: string;
  profesionalId: any;
  estado: "Presuntivo" | "Definitivo" | string;
  fecha?: number | string;
};

export type IndicacionLite = {
  _id: any;
  fecha: number | string;
  tipo: string;
  nombre: string;
  observaciones?: string;
  profesionalId: any;
  diagnosticoId?: any; // puede venir undefined/null
};

export type MedicamentoLite = {
  _id: any;
  fechaInicio: number | string;
  fechaFin?: number | string | null;
  estado: "Activo" | "Suspendido" | "Finalizado" | string;
  nombreComercial?: string;
  droga: string;
  forma?: string;
  dosis: string;
  frecuencia: string;
  duracion?: string;
  via?: string;
  indicaciones?: string;
  cronico?: boolean;
  notas?: string;
  profesionalId: any;
  indicacionId?: any;
  diagnosticoId?: any;
};

/* =============== utils =============== */
const fmt = (ts?: number | string | null) => {
  if (!ts && ts !== 0) return "—";
  const d = typeof ts === "number" ? new Date(ts) : new Date(ts);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-AR");
};

/* ===== Headers ===== */

/** Header básico: Título (centrado) + Emitido: fecha/hora (derecha) + línea divisoria */
const headerBasic = (doc: jsPDF, titulo: string) => {
  doc.setFontSize(16);
  doc.text(titulo, 105, 15, { align: "center" });

  doc.setFontSize(9);
  const emitido = new Date().toLocaleString("es-AR");
  doc.text(`Emitido: ${emitido}`, 195, 22, { align: "right" });

  doc.line(15, 26, 195, 26);
};

/** Header con datos del paciente (para PDFs por sección) */
const headerWithPatient = (doc: jsPDF, titulo: string, paciente?: PacienteLite) => {
  doc.setFontSize(16);
  doc.text(titulo, 105, 15, { align: "center" });

  doc.setFontSize(9);
  const emitido = new Date().toLocaleString("es-AR");
  doc.text(`Emitido: ${emitido}`, 195, 22, { align: "right" });

  if (paciente) {
    doc.text(
      `Paciente: ${paciente?.apellido ?? ""}, ${paciente?.nombre ?? ""}  |  DNI: ${
        paciente?.dni ?? "—"
      }  |  OS: ${paciente?.obrasSocialesNombres?.join(", ") || "Sin OS"}`,
      105,
      22,
      { align: "center" }
    );
  }

  doc.line(15, 26, 195, 26);
};

/* =============== Exportadores =============== */
export function exportDiagnosticosPDF(params: {
  paciente: PacienteLite | null | undefined;
  diagnosticos: DiagnosticoLite[] | undefined;
  getProfesionalNombre: (id: any) => string | undefined;
}) {
  const { paciente, diagnosticos = [], getProfesionalNombre } = params;
  const doc = new jsPDF();

  headerWithPatient(doc, "Diagnósticos", paciente || undefined);

  autoTable(doc, {
    startY: 32,
    head: [["Fecha", "Descripción", "Estado", "Profesional"]],
    body: diagnosticos.map((dx) => [
      fmt(dx.fecha),
      dx.descripcion,
      dx.estado,
      getProfesionalNombre(dx.profesionalId) || "—",
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [46, 204, 113] },
    theme: "striped",
  });

  doc.save(
    `Diagnosticos_${(paciente?.apellido ?? "").replace(/\s+/g, "_")}_${(paciente?.nombre ?? "")
      .replace(/\s+/g, "_")}.pdf`
  );
}

export function exportIndicacionesPDF(params: {
  paciente: PacienteLite | null | undefined;
  indicaciones: IndicacionLite[] | undefined;
  getProfesionalNombre: (id: any) => string | undefined;
  getDiagnosticoDescripcion: (id: any) => string | undefined;
}) {
  const { paciente, indicaciones = [], getProfesionalNombre, getDiagnosticoDescripcion } = params;
  const doc = new jsPDF();

  headerWithPatient(doc, "Indicaciones médicas", paciente || undefined);

  autoTable(doc, {
    startY: 32,
    head: [["Fecha", "Tipo", "Nombre", "Dx (si corresponde)", "Profesional"]],
    body: indicaciones.map((i) => [
      fmt(i.fecha),
      i.tipo,
      i.nombre,
      i.diagnosticoId ? getDiagnosticoDescripcion(i.diagnosticoId) || "—" : "—",
      getProfesionalNombre(i.profesionalId) || "—",
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [26, 188, 156] },
    theme: "striped",
  });

  doc.save(
    `Indicaciones_${(paciente?.apellido ?? "").replace(/\s+/g, "_")}_${(paciente?.nombre ?? "")
      .replace(/\s+/g, "_")}.pdf`
  );
}

export function exportMedicamentosPDF(params: {
  paciente: PacienteLite | null | undefined;
  medicamentos: MedicamentoLite[] | undefined;
  getProfesionalNombre: (id: any) => string | undefined;
  getIndicacionNombre: (id: any) => string | undefined;
  getDiagnosticoDescripcion: (id: any) => string | undefined;
}) {
  const {
    paciente,
    medicamentos = [],
    getProfesionalNombre,
    getIndicacionNombre,
    getDiagnosticoDescripcion,
  } = params;

  const doc = new jsPDF();

  headerWithPatient(doc, "Medicamentos", paciente || undefined);

  autoTable(doc, {
    startY: 32,
    head: [
      [
        "Inicio",
        "Fin",
        "Estado",
        "Nombre comercial",
        "Droga",
        "Dosis / Frec.",
        "Vía",
        "Indicación",
        "Dx",
        "Profesional",
      ],
    ],
    body: medicamentos.map((m) => [
      fmt(m.fechaInicio),
      fmt(m.fechaFin ?? null),
      m.estado,
      m.nombreComercial || "—",
      m.droga,
      `${m.dosis} / ${m.frecuencia}`,
      m.via || "—",
      m.indicacionId ? getIndicacionNombre(m.indicacionId) || "—" : "—",
      m.diagnosticoId ? getDiagnosticoDescripcion(m.diagnosticoId) || "—" : "—",
      getProfesionalNombre(m.profesionalId) || "—",
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [136, 84, 208] },
    theme: "striped",
    columnStyles: { 5: { cellWidth: 28 }, 7: { cellWidth: 24 }, 8: { cellWidth: 24 } },
  });

  doc.save(
    `Medicamentos_${(paciente?.apellido ?? "").replace(/\s+/g, "_")}_${(paciente?.nombre ?? "")
      .replace(/\s+/g, "_")}.pdf`
  );
}

export function exportHistoriaCompletaPDF(params: {
  paciente: PacienteLite | null | undefined;
  diagnosticos: DiagnosticoLite[] | undefined;
  indicaciones: IndicacionLite[] | undefined;
  medicamentos: MedicamentoLite[] | undefined;
  getProfesionalNombre: (id: any) => string | undefined;
  getIndicacionNombre: (id: any) => string | undefined;
  getDiagnosticoDescripcion: (id: any) => string | undefined;
}) {
  const {
    paciente,
    diagnosticos = [],
    indicaciones = [],
    medicamentos = [],
    getProfesionalNombre,
    getIndicacionNombre,
    getDiagnosticoDescripcion,
  } = params;

  const doc = new jsPDF();

  // ✅ Título + fecha; SIN datos del paciente en el header.
  headerBasic(doc, "Historia Clínica");

  // Bloque de datos del paciente (único)
  doc.setFontSize(11);
  const y0 = 32;
  doc.text(`Nombre: ${(paciente?.apellido ?? "")}, ${(paciente?.nombre ?? "")}`, 15, y0);
  doc.text(`DNI: ${paciente?.dni ?? "—"}`, 15, y0 + 6);
  doc.text(
    `OS: ${paciente?.obrasSocialesNombres?.join(", ") || "Sin OS"}   |   Tel: ${
      paciente?.telefono || "—"
    }   |   Email: ${paciente?.email || "—"}`,
    15,
    y0 + 12
  );

  let y = y0 + 18;

  // ---- Diagnósticos
  doc.setFontSize(13);
  doc.text("Diagnósticos", 15, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Fecha", "Descripción", "Estado", "Profesional"]],
    body: diagnosticos.map((dx) => [
      fmt(dx.fecha),
      dx.descripcion,
      dx.estado,
      getProfesionalNombre(dx.profesionalId) || "—",
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [46, 204, 113] },
    theme: "striped",
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ---- Indicaciones
  doc.setFontSize(13);
  doc.text("Indicaciones médicas", 15, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Fecha", "Tipo", "Nombre", "Dx", "Profesional"]],
    body: indicaciones.map((i) => [
      fmt(i.fecha),
      i.tipo,
      i.nombre,
      i.diagnosticoId ? getDiagnosticoDescripcion(i.diagnosticoId) || "—" : "—",
      getProfesionalNombre(i.profesionalId) || "—",
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [26, 188, 156] },
    theme: "striped",
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ---- Medicamentos
  doc.setFontSize(13);
  doc.text("Medicamentos", 15, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [
      ["Inicio", "Fin", "Estado", "Nombre comercial", "Droga", "Dosis/Frec.", "Vía", "Indicación", "Dx", "Profesional"],
    ],
    body: medicamentos.map((m) => [
      fmt(m.fechaInicio),
      fmt(m.fechaFin ?? null),
      m.estado,
      m.nombreComercial || "—",
      m.droga,
      `${m.dosis} / ${m.frecuencia}`,
      m.via || "—",
      m.indicacionId ? getIndicacionNombre(m.indicacionId) || "—" : "—",
      m.diagnosticoId ? getDiagnosticoDescripcion(m.diagnosticoId) || "—" : "—",
      getProfesionalNombre(m.profesionalId) || "—",
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [136, 84, 208] },
    theme: "striped",
    columnStyles: { 5: { cellWidth: 28 }, 7: { cellWidth: 24 }, 8: { cellWidth: 24 } },
  });

  doc.save(
    `HistoriaClinica_${(paciente?.apellido ?? "").replace(/\s+/g, "_")}_${(paciente?.nombre ?? "")
      .replace(/\s+/g, "_")}.pdf`
  );
}

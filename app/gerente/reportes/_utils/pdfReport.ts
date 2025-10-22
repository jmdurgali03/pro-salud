import { jsPDF } from "jspdf";

type Color = [number, number, number];

export const generarReporteProsaludPDF = ({
  turnos,
  pacientes,
  profesionales,
  obrasSociales,
  obrasPorUso,
  especialidades,
}: any) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const teal: Color = [20, 94, 83];

  // ============================================================
  // 1️⃣ ENCABEZADO
  // ============================================================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(...teal);
  pdf.text("Centro Médico ProSalud", margin, y);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60);
  y += 8;
  pdf.text("Reporte General del Centro Médico", margin, y);
  y += 6;
  pdf.setFontSize(10);
  pdf.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, margin, y);
  y += 8;
  pdf.setDrawColor(...teal);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ============================================================
  // 2️⃣ INDICADORES GENERALES
  // ============================================================
  const totalTurnos = turnos.length || 1;
  const count = (estado: string) => turnos.filter((t: any) => t.estado === estado).length;

  const indicadores = [
    { label: "Confirmados", color: [22, 163, 74], value: (count("Confirmado") / totalTurnos) * 100 },
    { label: "Cancelados", color: [220, 38, 38], value: (count("Cancelado") / totalTurnos) * 100 },
    { label: "Pendientes", color: [234, 179, 8], value: (count("Pendiente") / totalTurnos) * 100 },
    { label: "Finalizados", color: [37, 99, 235], value: (count("Finalizado") / totalTurnos) * 100 },
  ];

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.text("Indicadores Generales", margin, y);
  y += 8;

  indicadores.forEach((i, idx) => {
    const cardX = margin + idx * 45;
    pdf.setDrawColor(...teal);
    pdf.roundedRect(cardX, y, 40, 20, 3, 3, "S");
    pdf.setFontSize(10);
    pdf.text(i.label, cardX + 3, y + 8);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${i.value.toFixed(1)}%`, cardX + 3, y + 15);
    pdf.setFont("helvetica", "normal");
  });
  y += 30;

// ============================================================
// 3️⃣ HEATMAP DE OCUPACIÓN (con grises + eje de horas)
// ============================================================
pdf.setFont("helvetica", "bold");
pdf.text("Ocupación semanal (Heatmap)", margin, y);
y += 8;

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const startHour = 8;
const endHour = 20;
const grid: number[][] = Array.from({ length: 7 }, () => Array(endHour - startHour).fill(0));

for (const t of turnos) {
  if (!["Confirmado", "Finalizado"].includes(t.estado)) continue;
  const d = new Date(t.start);
  const day = (d.getDay() + 6) % 7;
  const hour = d.getHours();
  if (hour >= startHour && hour < endHour) grid[day][hour - startHour]++;
}

const max = Math.max(1, ...grid.flat());
const cellW = 8;
const cellH = 5;

dias.forEach((d, row) => {
  pdf.setTextColor(60);
  pdf.text(d, margin, y + row * (cellH + 1) + 4);
  grid[row].forEach((val: number, col: number) => {
    const intensity = val / max;
    let r: number, g: number, b: number;
    if (intensity < 0.25) {
      const gray = 220 - Math.floor(intensity * 120);
      r = g = b = gray;
    } else {
      r = Math.floor(30 * (1 - intensity));
      g = Math.floor(180 * intensity + 60);
      b = Math.floor(100 + 50 * intensity);
    }
    pdf.setFillColor(r, g, b);
    pdf.rect(
      margin + 12 + col * (cellW + 1),
      y + row * (cellH + 1),
      cellW,
      cellH,
      "F"
    );
  });
});

// 🔹 Etiquetas de horas (eje X)
pdf.setFontSize(8);
pdf.setTextColor(90);
for (let h = startHour; h < endHour; h += 2) {
  const x = margin + 12 + (h - startHour) * (cellW + 1);
  pdf.text(`${h}:00`, x, y + dias.length * (cellH + 1) + 5, { align: "center" });
}
pdf.setFontSize(10);
pdf.text("# Turnos", margin, y - 2);
y += dias.length * (cellH + 1) + 12;


  // ============================================================
  // 4️⃣ DISTRIBUCIÓN POR OBRAS SOCIALES
  // ============================================================
  pdf.setFontSize(13);
  pdf.setTextColor(0);
  pdf.text("Distribución por Obras Sociales", margin, y);
  y += 8;

  const obras = (obrasPorUso as any[]).slice(0, 6).map((o: any) => ({
    nombre: o.nombre || "Sin nombre",
    cantidad: o.valor || o.cantidad || 0,
  }));

  const totalObras = obras.reduce((sum, o) => sum + o.cantidad, 0) || 1;
  const cx1 = 70, cy1 = y + 40, r1 = 30;
  let startAngle1 = 0;

  obras.forEach((o, i) => {
  const color: Color = [
    40 + (i * 40) % 200,
    160 - (i * 20) % 120,
    100 + (i * 50) % 140,
  ];
  const slice = (o.cantidad / totalObras) * Math.PI * 2;
  const endAngle = startAngle1 + slice;

  pdf.setFillColor(...color);
  pdf.moveTo(cx1, cy1);
  for (let a = startAngle1; a <= endAngle; a += Math.PI / 50) {
    pdf.lineTo(cx1 + r1 * Math.cos(a), cy1 + r1 * Math.sin(a));
  }
  pdf.lineTo(cx1, cy1);
  pdf.fill();

  // 🔹 Cuadro de color + texto alineado
  const textY = y + 10 + i * 8;
  pdf.setFillColor(...color);
  pdf.rect(115, textY - 4, 5, 5, "F");
  pdf.setTextColor(0);
  pdf.text(
    `${o.nombre}: ${((o.cantidad / totalObras) * 100).toFixed(1)}%`,
    122,
    textY
  );
  startAngle1 = endAngle;
});


  // Nueva página
  pdf.addPage();
  y = margin;

  // ============================================================
  // 5️⃣ DISTRIBUCIÓN POR GÉNERO
  // ============================================================
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Distribución por Género", margin, y);
  y += 8;

  const totalPacientes = pacientes.length || 1;
  const masc = pacientes.filter((p: any) => p.genero === "Masculino").length;
  const fem = pacientes.filter((p: any) => p.genero === "Femenino").length;
  const otro = totalPacientes - masc - fem;

  const datosGenero = [
    { label: "Masculino", color: [59, 130, 246] as Color, valor: masc },
    { label: "Femenino", color: [236, 72, 153] as Color, valor: fem },
    { label: "Otro", color: [250, 204, 21] as Color, valor: otro },
  ];

  const cx = 70;
  const cy = y + 40;
  const radio = 30;
  let startAngle = 0;
  const total = masc + fem + otro || 1;
  const toXY = (a: number): [number, number] => [cx + radio * Math.cos(a), cy + radio * Math.sin(a)];

  datosGenero.forEach((d) => {
    const slice = (d.valor / total) * 2 * Math.PI;
    const endAngle = startAngle + slice;
    pdf.setFillColor(...d.color);
    pdf.moveTo(cx, cy);
    for (let a = startAngle; a <= endAngle; a += Math.PI / 50) {
      const [x, y] = toXY(a);
      pdf.lineTo(x, y);
    }
    pdf.lineTo(cx, cy);
    pdf.fill();
    startAngle = endAngle;
  });

  let legendY = y + 10;
  datosGenero.forEach((d) => {
    pdf.setFillColor(...d.color);
    pdf.rect(120, legendY, 5, 5, "F");
    pdf.text(`${d.label}: ${((d.valor / total) * 100).toFixed(1)}%`, 130, legendY + 4);
    legendY += 8;
  });
  y += 80;

// ============================================================
// 6️⃣ EVOLUCIÓN DE TURNOS (curvas suaves + ejes + leyenda horizontal)
// ============================================================
pdf.setFont("helvetica", "bold");
pdf.setFontSize(14);
pdf.text("Evolución de Turnos", margin, y);
pdf.setFontSize(10);
pdf.text("# Turnos", margin, y + 20);

// ============================================================
// 🔹 Agrupamiento y ordenamiento de fechas reales (YYYY-MM-DD)
// ============================================================
const agrupadoPorFecha: Record<string, Record<string, number>> = {};
for (const t of turnos) {
  const d = new Date(t.start);
  const key = d.toISOString().split("T")[0]; // ✅ formato ISO ordenable
  agrupadoPorFecha[key] ||= {
    Confirmado: 0,
    Cancelado: 0,
    Finalizado: 0,
    Pendiente: 0,
  };
  agrupadoPorFecha[key][t.estado]++;
}

const fechas = Object.keys(agrupadoPorFecha).sort(
  (a, b) => new Date(a).getTime() - new Date(b).getTime()
);

const maxY = Math.max(
  ...fechas.map((f) => Math.max(...Object.values(agrupadoPorFecha[f]))),
  1
);

// ============================================================
// 🔹 Configuración de gráfico base
// ============================================================
const chartX = margin + 15;
const chartY = y + 15;
const chartW = pageWidth - margin * 2 - 20;
const chartH = 60;

// Marco del gráfico
pdf.setDrawColor(230);
pdf.rect(chartX, chartY, chartW, chartH);

// Eje Y
pdf.setFontSize(8);
pdf.setTextColor(100);
for (let i = 0; i <= maxY; i++) {
  const yTick = chartY + chartH - (i / maxY) * chartH;
  pdf.setDrawColor(240);
  pdf.line(chartX, yTick, chartX + chartW, yTick);
  pdf.text(String(i), chartX - 5, yTick + 2, { align: "right" });
}

// ============================================================
// 🔹 Eje X (Fechas reales con formato corto día/mes)
// ============================================================
const step = Math.max(1, Math.floor(fechas.length / 6));
pdf.setFontSize(8);
pdf.setTextColor(90);

fechas.forEach((f, i) => {
  if (i % step === 0) {
    const x = chartX + (chartW / Math.max(fechas.length - 1, 1)) * i;
    const [year, month, day] = f.split("-"); // ✅ YYYY-MM-DD
    pdf.text(`${day}/${month}`, x, chartY + chartH + 5, { align: "center" });
  }
});

// Etiqueta eje X
pdf.setFontSize(10);
pdf.setTextColor(0);
pdf.text("Fechas", chartX + chartW, chartY + chartH + 10, { align: "right" });

// ============================================================
// 🔹 Colores por estado y curvas suavizadas
// ============================================================
const colores: Record<string, Color> = {
  Confirmado: [34, 197, 94],
  Cancelado: [239, 68, 68],
  Finalizado: [37, 99, 235],
  Pendiente: [245, 158, 11],
};

// Curvas
Object.entries(colores).forEach(([estado, color]) => {
  pdf.setDrawColor(...color);
  let prevX = 0,
    prevY = 0;

  fechas.forEach((f, i) => {
    const val = agrupadoPorFecha[f][estado];
    const x = chartX + (chartW / Math.max(fechas.length - 1, 1)) * i;
    const yVal = chartY + chartH - (val / maxY) * chartH;

    if (i > 0) {
      // Segmentos intermedios para suavizar
      const midX1 = prevX + (x - prevX) * 0.33;
      const midY1 = prevY + (yVal - prevY) * 0.33;
      const midX2 = prevX + (x - prevX) * 0.66;
      const midY2 = prevY + (yVal - prevY) * 0.66;
      pdf.line(prevX, prevY, midX1, midY1);
      pdf.line(midX1, midY1, midX2, midY2);
      pdf.line(midX2, midY2, x, yVal);
    }

    // Puntos
    pdf.circle(x, yVal, 0.8, "F");

    prevX = x;
    prevY = yVal;
  });
});

// ============================================================
// 🔹 Leyenda centrada debajo del gráfico
// ============================================================
const legendItems = Object.entries(colores);
const legendWidth = legendItems.length * 35;
let legendStart = pageWidth / 2 - legendWidth / 2;
let legendY2 = chartY + chartH + 10;

pdf.setFontSize(9);
legendItems.forEach(([estado, color]) => {
  pdf.setFillColor(...color);
  pdf.rect(legendStart, legendY2 - 3, 5, 5, "F");
  pdf.text(estado, legendStart + 8, legendY2 + 1);
  legendStart += 35;
});

y += chartH + 35;


// ============================================================
// 7️⃣ TURNOS POR ESPECIALIDAD (curvas suaves + ejes y etiquetas)
// ============================================================
pdf.setFont("helvetica", "bold");
pdf.setFontSize(14);
pdf.text("Turnos por Especialidad", margin, y);
y += 8;

especialidades.forEach((esp: any) => {
  const relacionados = turnos.filter(
    (t: any) => t.especialidadNombre === esp.nombre
  );
  if (!relacionados.length) return;

  // 🔹 Agrupar por fecha ISO (YYYY-MM-DD)
  const agrupados: Record<string, number> = {};
  relacionados.forEach((t: any) => {
    const d = new Date(t.start);
    const key = d.toISOString().split("T")[0]; // ✅ ordenable
    agrupados[key] = (agrupados[key] || 0) + 1;
  });

  // 🔹 Ordenar cronológicamente
  const fechas = Object.keys(agrupados).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const maxVal = Math.max(...Object.values(agrupados), 1);

  // 🔹 Configuración de área del gráfico
  const graphX = margin + 15;
  const graphY = y + 15;
  const graphW = pageWidth - 2 * margin - 15;
  const graphH = 50;

  // Marco
  pdf.setDrawColor(230);
  pdf.rect(graphX, graphY, graphW, graphH);

  // Eje Y (# Turnos)
  pdf.setFontSize(8);
  pdf.setTextColor(100);
  for (let i = 0; i <= maxVal; i++) {
    const yTick = graphY + graphH - (i / maxVal) * graphH;
    pdf.setDrawColor(240);
    pdf.line(graphX, yTick, graphX + graphW, yTick);
    pdf.text(String(i), graphX - 4, yTick + 2, { align: "right" });
  }

  // 🔹 Eje X (día/mes)
  const stepX = Math.max(1, Math.floor(fechas.length / 6));
  pdf.setFontSize(8);
  pdf.setTextColor(90);
  fechas.forEach((f, i) => {
    if (i % stepX === 0) {
      const [year, month, day] = f.split("-"); // ✅ corregido
      const x = graphX + (graphW / Math.max(fechas.length - 1, 1)) * i;
      pdf.text(`${day}/${month}`, x, graphY + graphH + 5, { align: "center" });
    }
  });

  // Etiquetas globales
  pdf.setFontSize(10);
  pdf.setTextColor(0);
  pdf.text("# Turnos", margin, graphY - 3);
  pdf.text("Fechas", graphX + graphW, graphY + graphH + 10, {
    align: "right",
  });

  // 🔹 Línea azul suave + puntos
  pdf.setDrawColor(14, 165, 233);
  let prevX = 0,
    prevY = 0;

  fechas.forEach((f, i) => {
    const val = agrupados[f];
    const x = graphX + (graphW / Math.max(fechas.length - 1, 1)) * i;
    const yVal = graphY + graphH - (val / maxVal) * graphH;

    if (i > 0) {
      // Suavizado manual con interpolación de 3 segmentos
      const midX1 = prevX + (x - prevX) * 0.33;
      const midY1 = prevY + (yVal - prevY) * 0.33;
      const midX2 = prevX + (x - prevX) * 0.66;
      const midY2 = prevY + (yVal - prevY) * 0.66;
      pdf.line(prevX, prevY, midX1, midY1);
      pdf.line(midX1, midY1, midX2, midY2);
      pdf.line(midX2, midY2, x, yVal);
    }

    // Punto del día
    pdf.circle(x, yVal, 0.8, "F");

    prevX = x;
    prevY = yVal;
  });

  // 🔹 Título de la especialidad
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(esp.nombre, margin, y);

  y += graphH + 35; // Espaciado entre gráficos

  // 🔹 Salto automático de página si no hay espacio
  if (y > pageHeight - 60) {
    pdf.addPage();
    y = margin;
  }
});

  // ============================================================
  // PIE DE PÁGINA
  // ============================================================
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(
      `Centro Médico ProSalud — Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  pdf.save(`Reporte_ProSalud_${new Date().toLocaleDateString("es-AR")}.pdf`);
};

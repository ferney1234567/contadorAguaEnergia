import jsPDF from "jspdf";
import autoTable, { CellHookData } from "jspdf-autotable";

/* =========================
   TIPOS
========================= */
interface ExportarDashboardPDFParams {
  anio: number;
  meses: string[];
  consumoAguaMensual: number[];
  consumoEnergiaMensual: number[];
  totalAguaAnual: number;
  totalEnergiaAnual: number;
  promedioAguaReal: number;
  promedioEnergiaReal: number;
  metaAgua: number;
  metaEnergia: number;
}

/* =========================
   EXPORTADOR PDF
========================= */
export function exportarDashboardPDF({
  anio,
  meses,
  consumoAguaMensual,
  consumoEnergiaMensual,
  totalAguaAnual,
  totalEnergiaAnual,
  promedioAguaReal,
  promedioEnergiaReal,
  metaAgua,
  metaEnergia,
}: ExportarDashboardPDFParams): void {
  const doc = new jsPDF("p", "mm", "a4");

  /* ======================================================
     🎨 COLORES CORPORATIVOS (TIPADOS CORRECTAMENTE)
  ====================================================== */
  const rojoEnvia: [number, number, number] = [220, 38, 38];
  const azulAgua: [number, number, number] = [14, 165, 233];
  const amarilloEnergia: [number, number, number] = [245, 158, 11];
  const verdeOk: [number, number, number] = [22, 163, 74];

  /* ======================================================
     📄 PORTADA
  ====================================================== */
  doc.setFontSize(20);
  doc.text("Envia Mensajería y Transporte", 105, 30, { align: "center" });

  doc.setFontSize(13);
  doc.text(
    "Sistema de Gestión de Consumo de Agua y Energía",
    105,
    40,
    { align: "center" }
  );

  doc.setFontSize(11);
  doc.text(`Año en análisis: ${anio}`, 105, 50, { align: "center" });

  doc.setFontSize(10);
  doc.text(
    "Reporte generado automáticamente · Uso interno corporativo",
    105,
    60,
    { align: "center" }
  );

  /* ======================================================
     📊 RESUMEN GENERAL
  ====================================================== */
  autoTable(doc, {
    startY: 75,
    head: [["Indicador", "Valor", "Unidad"]],
    body: [
      ["Consumo anual de agua", totalAguaAnual.toLocaleString(), "Litros"],
      ["Consumo anual de energía", totalEnergiaAnual.toLocaleString(), "kWh"],
      ["Promedio diario de agua", promedioAguaReal.toString(), "L/día"],
      ["Promedio diario de energía", promedioEnergiaReal.toString(), "kWh/día"],
      ["Meta anual de agua", metaAgua.toLocaleString(), "Litros"],
      ["Meta anual de energía", metaEnergia.toLocaleString(), "kWh"],
    ],
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: rojoEnvia },
  });

  /* ======================================================
     📄 RESUMEN ANUAL POR MES
  ====================================================== */
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Resumen Anual por Mes", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Mes", "Agua (L)", "Energía (kWh)"]],
    body: meses.map((mes, i) => [
      mes,
      consumoAguaMensual[i]?.toLocaleString() ?? "0",
      consumoEnergiaMensual[i]?.toLocaleString() ?? "0",
    ]),
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: rojoEnvia },
  });

  /* ======================================================
     💧 DETALLE MENSUAL AGUA
  ====================================================== */
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Detalle Mensual · Agua", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Mes", "Consumo (L)", "Meta", "Estado"]],
    body: meses.map((mes, i) => {
      const consumo = consumoAguaMensual[i] ?? 0;
      const estado = consumo <= metaAgua ? "Dentro de meta" : "Excedido";

      return [
        mes,
        consumo.toLocaleString(),
        metaAgua.toLocaleString(),
        estado,
      ];
    }),
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: azulAgua },
    didParseCell: (data: CellHookData) => {
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.textColor =
          data.cell.raw === "Dentro de meta" ? verdeOk : rojoEnvia;
      }
    },
  });

  /* ======================================================
     ⚡ DETALLE MENSUAL ENERGÍA
  ====================================================== */
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Detalle Mensual · Energía", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Mes", "Consumo (kWh)", "Meta", "Estado"]],
    body: meses.map((mes, i) => {
      const consumo = consumoEnergiaMensual[i] ?? 0;
      const estado = consumo <= metaEnergia ? "Dentro de meta" : "Excedido";

      return [
        mes,
        consumo.toLocaleString(),
        metaEnergia.toLocaleString(),
        estado,
      ];
    }),
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: amarilloEnergia },
    didParseCell: (data: CellHookData) => {
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.textColor =
          data.cell.raw === "Dentro de meta" ? verdeOk : rojoEnvia;
      }
    },
  });

  /* ======================================================
     📌 PIE DE PÁGINA GLOBAL
  ====================================================== */
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `© ${anio} Envia · Uso interno corporativo`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`Reporte_Consumo_Envia_${anio}.pdf`);
}
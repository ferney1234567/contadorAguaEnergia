import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export async function exportarDashboardPDF({
  anio,
  meses = [],
  consumoAguaMensual = [],
  consumoEnergiaMensual = [],
  totalAguaAnual = 0,
  totalEnergiaAnual = 0,
  promedioAguaReal = 0,
  promedioEnergiaReal = 0,
  metaAgua = 0,
  metaEnergia = 0,
}: ExportarDashboardPDFParams) {

  const doc = new jsPDF();

  const ROJO: [number, number, number] = [198, 40, 40];
  const GRIS: [number, number, number] = [90, 90, 90];

  const pageWidth = doc.internal.pageSize.getWidth();

  /* =========================
     🔒 VALIDACIÓN SEGURA
  ========================= */
  const safe = (v: any) => Number(v || 0);

  /* =========================
     🖼️ LOGO (MEJORADO)
  ========================= */
  const cargarLogo = async () => {
    try {
      const response = await fetch("/img/logo.png");
      const blob = await response.blob();

      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  /* =========================
     🔴 HEADER CORPORATIVO
  ========================= */
  doc.setFillColor(...ROJO);
  doc.rect(0, 0, pageWidth, 32, "F");

  const logo = await cargarLogo();

  if (logo) {
    doc.addImage(logo, "PNG", 15, 6, 22, 20);
  }

  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("ENVÍA COLVANES", 42, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de monitoreo ambiental", 42, 22);

  /* =========================
     🧾 TITULO
  ========================= */
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  doc.text("Informe Corporativo", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  doc.text(`Consumo de Agua y Energía - ${anio}`, pageWidth / 2, 58, {
    align: "center",
  });

  /* =========================
     📊 TARJETAS MODERNAS
  ========================= */
  const tarjeta = (
    x: number,
    y: number,
    titulo: string,
    valor: number,
    unidad: string
  ) => {
    // borde
    doc.setDrawColor(220);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, 85, 28, 3, 3, "FD");

    // título
    doc.setFontSize(10);
    doc.setTextColor(...GRIS);
    doc.text(titulo, x + 5, y + 8);

    // valor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(safe(valor).toLocaleString("es-CO"), x + 5, y + 18);

    // unidad
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    doc.text(unidad, x + 5, y + 24);
  };

  // filas
  tarjeta(15, 70, "Consumo Agua Anual", totalAguaAnual, "m³");
  tarjeta(110, 70, "Consumo Energía Anual", totalEnergiaAnual, "kWh");

  tarjeta(15, 105, "Promedio Agua", promedioAguaReal, "L/día");
  tarjeta(110, 105, "Promedio Energía", promedioEnergiaReal, "kWh/día");

  /* =========================
     📋 TABLA CON ESTILO ENVÍA
  ========================= */
  autoTable(doc, {
    startY: 145,

    head: [["Mes", "Agua (m³)", "Energía (kWh)"]],

    body: meses.map((mes, i) => [
      mes,
      safe(consumoAguaMensual[i]).toLocaleString("es-CO"),
      safe(consumoEnergiaMensual[i]).toLocaleString("es-CO"),
    ]),

    styles: {
      fontSize: 9,
      halign: "center",
    },

    headStyles: {
      fillColor: ROJO,
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  /* =========================
     📌 RESUMEN FINAL
  ========================= */
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setTextColor(0);

  doc.text(
    `Meta Agua: ${metaAgua.toLocaleString("es-CO")} m³`,
    15,
    finalY
  );

  doc.text(
    `Meta Energía: ${metaEnergia.toLocaleString("es-CO")} kWh`,
    15,
    finalY + 8
  );

  /* =========================
     🧾 FOOTER
  ========================= */
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);

  doc.text(
    "Documento generado automáticamente - ENVÍA COLVANES",
    pageWidth / 2,
    285,
    { align: "center" }
  );

  /* =========================
     💾 EXPORTAR
  ========================= */
  doc.save(`Informe_Envia_${anio}.pdf`);
}
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
export async function exportarDashboardPDF({
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
}: ExportarDashboardPDFParams): Promise<void> {
  const doc = new jsPDF("p", "mm", "a4");

  /* ======================================================
     🎨 COLORES CORPORATIVOS
  ====================================================== */
  const rojoEnvia: [number, number, number] = [198, 40, 40];
  const rojoOscuro: [number, number, number] = [140, 24, 24];
  const rojoSuave: [number, number, number] = [252, 242, 242];
  const grisTexto: [number, number, number] = [70, 70, 70];
  const grisClaro: [number, number, number] = [235, 235, 235];
  const negroSuave: [number, number, number] = [35, 35, 35];
  const azulAgua: [number, number, number] = [14, 165, 233];
  const amarilloEnergia: [number, number, number] = [245, 158, 11];
  const verdeOk: [number, number, number] = [22, 163, 74];
  const rojoAlerta: [number, number, number] = [220, 38, 38];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* ======================================================
     🖼️ CARGAR IMAGEN DESDE PUBLIC
  ====================================================== */
  const cargarImagen = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    // 🔥 SOLUCIÓN NEXT
    img.src = window.location.origin + url;

    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

  const convertirImagenABase64 = (img: HTMLImageElement): string => {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

  ctx.drawImage(img, 0, 0);

  // 🔥 CORRECTO
  return canvas.toDataURL("image/png");
};

  const dibujarLogo = async () => {
    try {
      const img = await cargarImagen("/img/logo.png");
      const base64 = convertirImagenABase64(img);

      const maxWidth = 34;
      const maxHeight = 18;

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      doc.addImage(base64, "PNG", 14, 10, finalWidth, finalHeight);
    } catch (error) {
      console.log("No se pudo cargar el logo:", error);
    }
  };

  /* ======================================================
     🔢 FORMATEADORES
  ====================================================== */
  const formatearNumero = (valor: number | undefined | null, decimales = 0) => {
    return Number(valor || 0).toLocaleString("es-CO", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
  };

  const obtenerEstado = (consumo: number, meta: number) => {
    if (consumo <= meta) return "Dentro de meta";
    return "Excedido";
  };

  const colorEstado = (estado: string): [number, number, number] => {
    return estado === "Dentro de meta" ? verdeOk : rojoAlerta;
  };

  const dibujarEncabezadoPagina = (titulo: string, subtitulo?: string) => {
    doc.setFillColor(...rojoEnvia);
    doc.rect(0, 0, pageWidth, 18, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(titulo, 14, 11.5);

    if (subtitulo) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(subtitulo, 14, 16);
    }

    doc.setTextColor(...negroSuave);
  };

  const dibujarPieGlobal = () => {
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      doc.setDrawColor(...grisClaro);
      doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...grisTexto);
      doc.text(`© ${anio} Envia · Uso interno corporativo`, 14, pageHeight - 8);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 8, {
        align: "right",
      });
    }
  };

  /* ======================================================
     📄 PORTADA
  ====================================================== */
  await dibujarLogo();

  doc.setFillColor(...rojoEnvia);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text("Informe Corporativo de Consumo", 105, 50, { align: "center" });

  doc.setFontSize(15);
  doc.text("Agua y Energía", 105, 58, { align: "center" });

  doc.setDrawColor(...rojoEnvia);
  doc.setLineWidth(0.8);
  doc.line(55, 64, 155, 64);

  doc.setTextColor(...grisTexto);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Envia Mensajería y Transporte", 105, 75, { align: "center" });
  doc.text(`Año evaluado: ${anio}`, 105, 82, { align: "center" });
  doc.text("Sistema de seguimiento ambiental y operativo", 105, 89, {
    align: "center",
  });

  /* ======================================================
     🟥 BLOQUES RESUMEN VISUAL
  ====================================================== */
  const dibujarTarjeta = (
    x: number,
    y: number,
    w: number,
    h: number,
    titulo: string,
    valor: string,
    unidad: string,
    colorBarra: [number, number, number]
  ) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...grisClaro);
    doc.roundedRect(x, y, w, h, 3, 3, "FD");

    doc.setFillColor(...colorBarra);
    doc.roundedRect(x, y, 4, h, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...negroSuave);
    doc.text(titulo, x + 8, y + 10);

    doc.setFontSize(14);
    doc.setTextColor(...rojoOscuro);
    doc.text(valor, x + 8, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...grisTexto);
    doc.text(unidad, x + 8, y + 27);
  };

  dibujarTarjeta(
    14,
    105,
    86,
    32,
    "Consumo anual de agua",
    formatearNumero(totalAguaAnual),
    "Metros Cubicos",
    azulAgua
  );
  dibujarTarjeta(
    110,
    105,
    86,
    32,
    "Consumo anual de energía",
    formatearNumero(totalEnergiaAnual),
    "kWh",
    amarilloEnergia
  );
  dibujarTarjeta(
    14,
    145,
    86,
    32,
    "Promedio diario agua",
    formatearNumero(promedioAguaReal, 2),
    "L/día",
    azulAgua
  );
  dibujarTarjeta(
    110,
    145,
    86,
    32,
    "Promedio diario energía",
    formatearNumero(promedioEnergiaReal, 2),
    "kWh/día",
    amarilloEnergia
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...rojoOscuro);
  doc.text("Resumen", 14, 192);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...grisTexto);

  const textoResumen =
    `Este informe presenta el comportamiento anual del consumo de agua y energía correspondiente al año ${anio}. ` +
    `Se consolidan los datos mensuales, los totales anuales, los promedios diarios y el cumplimiento frente a las metas establecidas, ` +
    `con una presentación orientada a seguimiento corporativo, control interno y apoyo a la toma de decisiones.`;

  const resumenLineas = doc.splitTextToSize(textoResumen, 180);
  doc.text(resumenLineas, 14, 200);

  /* ======================================================
     📊 TABLA RESUMEN GENERAL
  ====================================================== */
  autoTable(doc, {
    startY: 225,
    head: [["Indicador", "Valor", "Unidad"]],
    body: [
      ["Consumo anual de agua", formatearNumero(totalAguaAnual), "Metros Cubicos"],
      ["Consumo anual de energía", formatearNumero(totalEnergiaAnual), "kWh"],
      ["Promedio diario de agua", formatearNumero(promedioAguaReal, 2), "M/día"],
      ["Promedio diario de energía", formatearNumero(promedioEnergiaReal, 2), "kWh/día"],
      ["Meta anual de agua", formatearNumero(metaAgua), "Metros Cubicos"],
      ["Meta anual de energía", formatearNumero(metaEnergia), "kWh"],
    ],
    theme: "grid",
    styles: {
      fontSize: 9.5,
      cellPadding: 3.5,
      textColor: negroSuave,
      lineColor: grisClaro,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: rojoEnvia,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: rojoSuave,
    },
    bodyStyles: {
      halign: "left",
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "center" },
    },
  });

  /* ======================================================
     📄 RESUMEN MENSUAL
  ====================================================== */
  doc.addPage();
  dibujarEncabezadoPagina(
    "Resumen mensual ",
    "Comparativo general de agua y energía por mes"
  );

  autoTable(doc, {
    startY: 28,
    head: [["Mes", "Agua (L)", "Energía (kWh)"]],
    body: meses.map((mes, i) => [
      mes,
      formatearNumero(consumoAguaMensual[i]),
      formatearNumero(consumoEnergiaMensual[i]),
    ]),
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: negroSuave,
      lineColor: grisClaro,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: rojoEnvia,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  });

  /* ======================================================
     💧 DETALLE AGUA
  ====================================================== */
  doc.addPage();
  dibujarEncabezadoPagina(
    "Detalle mensual de agua",
    "Seguimiento de consumo y cumplimiento frente a la meta"
  );

  autoTable(doc, {
    startY: 28,
    head: [["Mes", "Consumo (L)", "Meta (L)", "Estado"]],
    body: meses.map((mes, i) => {
      const consumo = Number(consumoAguaMensual[i] || 0);
      const estado = obtenerEstado(consumo, metaAgua);

      return [
        mes,
        formatearNumero(consumo),
        formatearNumero(metaAgua),
        estado,
      ];
    }),
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: negroSuave,
      lineColor: grisClaro,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: azulAgua,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [246, 251, 255],
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "center" },
    },
    didParseCell: (data: CellHookData) => {
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.textColor = colorEstado(String(data.cell.raw));
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  /* ======================================================
     ⚡ DETALLE ENERGÍA
  ====================================================== */
  doc.addPage();
  dibujarEncabezadoPagina(
    "Detalle mensual de energía",
    "Seguimiento de consumo y cumplimiento frente a la meta"
  );

  autoTable(doc, {
    startY: 28,
    head: [["Mes", "Consumo (kWh)", "Meta (kWh)", "Estado"]],
    body: meses.map((mes, i) => {
      const consumo = Number(consumoEnergiaMensual[i] || 0);
      const estado = obtenerEstado(consumo, metaEnergia);

      return [
        mes,
        formatearNumero(consumo),
        formatearNumero(metaEnergia),
        estado,
      ];
    }),
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: negroSuave,
      lineColor: grisClaro,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: amarilloEnergia,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [255, 251, 243],
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "center" },
    },
    didParseCell: (data: CellHookData) => {
      if (data.section === "body" && data.column.index === 3) {
        data.cell.styles.textColor = colorEstado(String(data.cell.raw));
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  /* ======================================================
     📝 PÁGINA FINAL DE CONCLUSIONES
  ====================================================== */
  doc.addPage();
  dibujarEncabezadoPagina(
    "Conclusiones del informe",
    "Síntesis operativa para revisión corporativa"
  );

  const totalMesesFueraMetaAgua = consumoAguaMensual.filter(
    (v) => Number(v || 0) > metaAgua
  ).length;

  const totalMesesFueraMetaEnergia = consumoEnergiaMensual.filter(
    (v) => Number(v || 0) > metaEnergia
  ).length;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...rojoOscuro);
  doc.text("Hallazgos principales", 14, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...grisTexto);

  const conclusiones = [
    `• El consumo anual de agua registrado fue de ${formatearNumero(totalAguaAnual)} Metros Cubicos.`,
    `• El consumo anual de energía registrado fue de ${formatearNumero(totalEnergiaAnual)} kWh.`,
    `• En agua, ${totalMesesFueraMetaAgua} mes(es) superaron la meta establecida.`,
    `• En energía, ${totalMesesFueraMetaEnergia} mes(es) superaron la meta establecida.`,
    `• El promedio diario de agua fue de ${formatearNumero(promedioAguaReal, 2)} L/día.`,
    `• El promedio diario de energía fue de ${formatearNumero(promedioEnergiaReal, 2)} kWh/día.`,
    `• Se recomienda mantener seguimiento mensual y acciones correctivas sobre los periodos con desviaciones.`,
  ];

  let y = 45;
  conclusiones.forEach((item) => {
    const lineas = doc.splitTextToSize(item, 180);
    doc.text(lineas, 14, y);
    y += lineas.length * 6 + 4;
  });

  doc.setDrawColor(...rojoEnvia);
  doc.setLineWidth(0.6);
  doc.line(14, y + 4, 196, y + 4);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...grisTexto);
  doc.text(
    "Documento generado automáticamente por el sistema de control de consumo de Envia.",
    14,
    y + 12
  );

  /* ======================================================
     📌 PIE DE PÁGINA
  ====================================================== */
  dibujarPieGlobal();

  doc.save(`Informe_Corporativo_Envia_${anio}.pdf`);
}
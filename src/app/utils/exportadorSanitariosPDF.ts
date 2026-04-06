import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarSanitariosPDF = (registros: any[] = []) => {
  const doc = new jsPDF();

  /* =========================
     🎨 COLORES
  ========================= */
  const azul: [number, number, number] = [0, 150, 255];
  const gris: [number, number, number] = [100, 100, 100];

  /* =========================
     🧾 TÍTULO
  ========================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...azul);
  doc.text("REPORTE SANITARIO", 60, 15);

  doc.setFontSize(10);
  doc.setTextColor(...gris);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO")}`,
    60,
    22
  );

  /* =========================
     💧 LÍNEA
  ========================= */
  doc.setDrawColor(...azul);
  doc.setLineWidth(1);
  doc.line(14, 26, 196, 26);

  /* =========================
     🔥 COLUMNAS
  ========================= */
  const columnas = [
    "Fecha",
    "Responsable",
    "Área",
    "Sanitarios 🚽",
    "Orinales 🚹",
    "Duchas 🚿",
    "Lavamanos 🧼",
    "Llaves 🚰",
    "Total",
    "Obs",
  ];

  /* =========================
     🔥 FILAS (SEGURAS)
  ========================= */
  const filas = registros.map((r) => [
    r?.fecha
      ? new Date(r.fecha).toLocaleDateString("es-CO")
      : "-",

    r?.responsable || "-",
    r?.area || r?.area_id || "-",

    `${r?.sanitarios_c || 0}/${r?.sanitarios_nc || 0}`,
    `${r?.orinales_c || 0}/${r?.orinales_nc || 0}`,
    `${r?.duchas_c || 0}/${r?.duchas_nc || 0}`,
    `${r?.lavamanos_c || 0}/${r?.lavamanos_nc || 0}`,
    `${r?.llaves_c || 0}/${r?.llaves_nc || 0}`,

    r?.total || 0,
    r?.observacion || "",
  ]);

  /* =========================
     📊 TABLA
  ========================= */
  autoTable(doc, {
    head: [columnas],
    body: filas,
    startY: 32,

    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fillColor: azul,
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [240, 248, 255],
    },

    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
    },

    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(...gris);
      doc.text("Sistema de Monitoreo Ambiental 💧", 14, 290);
    },
  });

  /* =========================
     💾 DESCARGAR
  ========================= */
  doc.save("reporte_sanitarios_pro.pdf");
};
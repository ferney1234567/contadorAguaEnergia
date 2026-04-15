import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================
   🖼️ CARGAR LOGO
========================= */
const cargarImagen = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No context");

        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = reject;
    } catch (error) {
      reject(error);
    }
  });
};

/* =========================
   📄 FUNCIÓN PRINCIPAL
========================= */
export const exportarSanitariosPDF = async (registros: any[] = []) => {
  const doc = new jsPDF();

  const ROJO: [number, number, number] = [180, 0, 0];

  /* =========================
     🔴 HEADER
  ========================= */
  doc.setFillColor(ROJO[0], ROJO[1], ROJO[2]);
  doc.rect(0, 0, 210, 35, "F");

  /* =========================
     🖼️ LOGO
  ========================= */
  try {
    const logo = await cargarImagen("/img/logo.png");
    doc.addImage(logo, "PNG", 15, 5, 25, 25);
  } catch (error) {
    console.warn("Logo no cargado:", error);
  }

  /* =========================
     🧾 TITULOS
  ========================= */
  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ENVÍA S.A.S", 105, 15, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("REPORTE SANITARIO", 105, 25, { align: "center" });

  /* =========================
     📅 FECHA
  ========================= */
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);

  doc.text(
    `Fecha de generación: ${new Date().toLocaleDateString("es-CO")}`,
    14,
    45
  );

  /* =========================
     📊 DATOS SEGUROS
  ========================= */
  let totalGeneral = 0;

  const filas = (registros || []).map((r: any) => {
    const total = Number(r?.total || 0);
    totalGeneral += total;

    return [
      r?.fecha
        ? new Date(r.fecha).toLocaleDateString("es-CO")
        : "Sin fecha",

      r?.responsable || "N/A",
      r?.area || r?.area_id || "N/A",

      `${r?.sanitarios_c || 0}/${r?.sanitarios_nc || 0}`,
      `${r?.orinales_c || 0}/${r?.orinales_nc || 0}`,
      `${r?.duchas_c || 0}/${r?.duchas_nc || 0}`,
      `${r?.lavamanos_c || 0}/${r?.lavamanos_nc || 0}`,
      `${r?.llaves_c || 0}/${r?.llaves_nc || 0}`,

      total,
      r?.observacion || "",
    ];
  });

  /* =========================
     📋 TABLA
  ========================= */
  autoTable(doc, {
    startY: 55,

    head: [[
      "Fecha",
      "Responsable",
      "Área",
      "Sanitarios",
      "Orinales",
      "Duchas",
      "Lavamanos",
      "Llaves",
      "Total",
      "Observación",
    ]],

    body: filas,

    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fillColor: ROJO,
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
    },
  });

  /* =========================
     📍 POSICIÓN FINAL SEGURA
  ========================= */
  const finalY =
    (doc as any).lastAutoTable?.finalY ?? 100;

  /* =========================
     📊 RESUMEN
  ========================= */
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  doc.text(`Total registros: ${registros.length}`, 14, finalY + 15);

  /* =========================
     💰 CAJA TOTAL
  ========================= */
  doc.setFillColor(ROJO[0], ROJO[1], ROJO[2]);
  doc.roundedRect(130, finalY + 5, 60, 25, 5, 5, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFontSize(10);
  doc.text("TOTAL GENERAL", 160, finalY + 15, { align: "center" });

  doc.setFontSize(14);
  doc.text(String(totalGeneral), 160, finalY + 25, {
    align: "center",
  });

  /* =========================
     📉 LINEA
  ========================= */
  doc.setDrawColor(200);
  doc.line(14, finalY + 40, 196, finalY + 40);

  /* =========================
     🧾 FOOTER
  ========================= */
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  doc.text(
    "Documento generado para uso corporativo de ENVÍA S.A.S.",
    105,
    finalY + 50,
    { align: "center" }
  );

  doc.text(
    "Sistema interno de control y gestión ambiental.",
    105,
    finalY + 55,
    { align: "center" }
  );

  /* =========================
     💾 DESCARGA
  ========================= */
  doc.save("reporte_sanitarios_envia.pdf");
};
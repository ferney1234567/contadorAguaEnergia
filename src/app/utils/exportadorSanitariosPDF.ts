import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarSanitariosPDF = (registros: any[]) => {
  const doc = new jsPDF();

  /* =========================
     🎨 COLORES
  ========================= */
  const azul = [0, 150, 255];
  const verde = [16, 185, 129];
  const gris = [100, 100, 100];

  /* =========================
     🖼️ LOGO EMPRESA (CAMBIA ESTO)
  ========================= */
  const logo = "/img/logo.png"; // 🔥 pon tu logo aquí

  try {
    doc.addImage(logo, "PNG", 14, 8, 30, 15);
  } catch {
    console.log("No se pudo cargar el logo");
  }

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
     💧 LÍNEA DECORATIVA
  ========================= */
  doc.setDrawColor(...azul);
  doc.setLineWidth(1);
  doc.line(14, 26, 196, 26);

  /* =========================
     🖼️ ICONOS (CAMBIA ESTO)
  ========================= */
  const iconos = {
    sanitarios: "/img/sanitario.png",
    orinales: "/img/orinal.png",
    duchas: "/img/ducha.png",
    lavamanos: "/img/lavamanos.png",
    llaves: "/img/llave.png",
  };

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
     🔥 FILAS
  ========================= */
  const filas = registros.map((r) => [
    new Date(r.fecha).toLocaleDateString("es-CO"),
    r.responsable,
    r.area || r.area_id,

    `${r.sanitarios_c}/${r.sanitarios_nc}`,
    `${r.orinales_c}/${r.orinales_nc}`,
    `${r.duchas_c}/${r.duchas_nc}`,
    `${r.lavamanos_c}/${r.lavamanos_nc}`,
    `${r.llaves_c}/${r.llaves_nc}`,

    r.total,
    r.observacion || "",
  ]);

  /* =========================
     📊 TABLA BONITA
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
      fillColor: [240, 248, 255], // azul suave
    },

    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
    },

    didDrawPage: () => {
      /* =========================
         🔥 FOOTER
      ========================= */
      doc.setFontSize(8);
      doc.setTextColor(...gris);
      doc.text(
        "Sistema de Monitoreo Ambiental 💧",
        14,
        290
      );
    },
  });

  /* =========================
     💾 DESCARGAR
  ========================= */
  doc.save("reporte_sanitarios_pro.pdf");
};
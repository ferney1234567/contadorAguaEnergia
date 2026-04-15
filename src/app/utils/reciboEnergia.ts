import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// =========================
// 🖼️ CARGAR IMAGEN
// =========================
const cargarImagen = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = reject;
  });
};

// =========================
// ⚡ FUNCIÓN PRINCIPAL
// =========================
export const generarReciboEnergia = async (datosEnergia: any[]) => {
  const doc = new jsPDF();

  // HEADER
  doc.setFillColor(180, 0, 0);
  doc.rect(0, 0, 210, 35, "F");

  // LOGO
  try {
    const logoBase64 = await cargarImagen("/img/logo.png");
    doc.addImage(logoBase64, "PNG", 15, 5, 25, 25);
  } catch {}

  // TITULOS
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("ENVÍA S.A.S", 105, 15, { align: "center" });

  doc.setFontSize(11);
  doc.text("REPORTE DE CONSUMO DE ENERGÍA", 105, 25, { align: "center" });

  // FECHA
  doc.setTextColor(80);
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 45);

  // =========================
  // 🔥 CALCULOS
  // =========================
  let totalKwh = 0;
  let totalValor = 0;

  let totalPrincipalKwh = 0;
  let totalPrincipalValor = 0;

  let totalReceptoriasKwh = 0;
  let totalReceptoriasValor = 0;

  const filas: any[] = [];

  datosEnergia.forEach((d) => {
    const consumo = d.datos.reduce(
      (acc: number, m: any) => acc + Number(m.kWh || 0),
      0
    );

    const valor = d.datos.reduce(
      (acc: number, m: any) => acc + Number(m.valor || 0),
      0
    );

    totalKwh += consumo;
    totalValor += valor;

    if (d.nombre?.toUpperCase().includes("SEDE PPAL")) {
      totalPrincipalKwh += consumo;
      totalPrincipalValor += valor;
    }

    if (d.nombre?.toUpperCase().includes("RECEPTORIA")) {
      totalReceptoriasKwh += consumo;
      totalReceptoriasValor += valor;
    }

    filas.push([
      d.nombre,
      d.ubicacion,
      `${consumo.toFixed(2)} kWh`,
      `$ ${valor.toLocaleString("es-CO")}`
    ]);
  });

  // =========================
  // 📋 TABLA
  // =========================
  autoTable(doc, {
    startY: 55,
    head: [["Sede", "Ubicación", "Consumo", "Valor"]],
    body: filas,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [200, 0, 0],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;

  // =========================
  // 🔥 TOTALES (COMO AGUA)
  // =========================
  doc.setFontSize(11);
  doc.setTextColor(0);

  doc.text(`Consumo total: ${totalKwh.toFixed(2)} kWh`, 14, finalY + 15);

  doc.text(
    `Total sede principal: ${totalPrincipalKwh.toFixed(2)} kWh`,
    14,
    finalY + 22
  );

  doc.text(
    `Total receptorias: ${totalReceptoriasKwh.toFixed(2)} kWh`,
    14,
    finalY + 29
  );

  // =========================
  // 💰 CAJA TOTAL
  // =========================
  doc.setFillColor(200, 0, 0);
  doc.roundedRect(130, finalY + 10, 60, 25, 5, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("TOTAL A PAGAR", 160, finalY + 20, { align: "center" });

  doc.setFontSize(14);
  doc.text(
    `$ ${totalValor.toLocaleString("es-CO")}`,
    160,
    finalY + 30,
    { align: "center" }
  );

  // =========================
  // FOOTER
  // =========================
  doc.setFontSize(9);
  doc.setTextColor(100);

  doc.text(
    "Documento generado para uso corporativo de ENVÍA S.A.S.",
    105,
    finalY + 50,
    { align: "center" }
  );

  doc.text(
    "Control interno de consumo energético.",
    105,
    finalY + 55,
    { align: "center" }
  );

  // DESCARGA
  doc.save("reporte_energia_envia.pdf");
};
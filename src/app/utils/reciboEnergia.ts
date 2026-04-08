import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ FUNCIÓN PARA CARGAR IMAGEN DESDE PUBLIC
const cargarImagen = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // 🔥 importante

    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const base64 = canvas.toDataURL("image/png");
      resolve(base64);
    };

    img.onerror = reject;
  });
};

// ✅ TIPOS
type Medicion = {
  consumo: number;
  valor: number;
};

type Sede = {
  nombre: string;
  ubicacion: string;
  datos: Medicion[];
};

// ✅ FUNCIÓN PRINCIPAL
export const generarReciboEnergia = async (datosEnergia: Sede[]) => {

  const doc = new jsPDF();

  // =========================
  // 🎨 HEADER
  // =========================
  doc.setFillColor(180, 0, 0);
  doc.rect(0, 0, 210, 35, "F");

  // =========================
  // 🖼️ LOGO DESDE PUBLIC
  // =========================
  try {
    const logoBase64 = await cargarImagen("/img/logo.png");

    doc.addImage(logoBase64, "PNG", 15, 5, 25, 25);
  } catch (error) {
    console.log("Error cargando logo");
  }

  // =========================
  // 🧾 TITULOS
  // =========================
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("ENVÍA S.A.S", 105, 15, { align: "center" });

  doc.setFontSize(11);
  doc.text("RECIBO DE ENERGÍA", 105, 25, { align: "center" });

  // =========================
  // 📅 FECHA
  // =========================
  doc.setTextColor(80);
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 45);

  // =========================
  // 📊 CALCULOS
  // =========================
  let totalConsumo = 0;
  let totalValor = 0;

  const filas: any[] = [];

  datosEnergia.forEach((d) => {
    const consumo = d.datos.reduce((acc, m) => acc + (m.consumo || 0), 0);
    const valor = d.datos.reduce((acc, m) => acc + (m.valor || 0), 0);

    totalConsumo += consumo;
    totalValor += valor;

    filas.push([
      d.nombre,
      d.ubicacion,
      consumo.toFixed(2) + " kWh",
      `$ ${valor.toLocaleString()}`
    ]);
  });

  // =========================
  // 📋 TABLA
  // =========================
  autoTable(doc, {
    startY: 55,
    head: [["Sede", "Ubicación", "Consumo", "Valor"]],
    body: filas,
    headStyles: {
      fillColor: [200, 0, 0],
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;

  // =========================
  // ⚡ RESUMEN
  // =========================
  doc.setFontSize(11);
  doc.text(`Consumo total: ${totalConsumo.toFixed(2)} kWh`, 14, finalY + 15);

  // =========================
  // 💰 TOTAL
  // =========================
  doc.setFillColor(200, 0, 0);
  doc.roundedRect(130, finalY + 5, 60, 25, 5, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("TOTAL A PAGAR", 160, finalY + 15, { align: "center" });

  doc.setFontSize(14);
  doc.text(`$ ${totalValor.toLocaleString()}`, 160, finalY + 25, { align: "center" });

  // =========================
  // 📄 DESCARGAR
  // =========================
  doc.save("recibo_energia_envia.pdf");
};
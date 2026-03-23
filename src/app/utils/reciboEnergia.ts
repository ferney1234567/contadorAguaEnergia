import jsPDF from "jspdf";

// ✅ TIPOS
type Medicion = {
  consumo: number;
  valor: number;
};

type Sede = {
  datos: Medicion[];
};

// ✅ FUNCIÓN
export const generarReciboEnergia = (datosEnergia: Sede[]) => {

  const doc = new jsPDF();

  // 🎨 HEADER
  doc.setFillColor(10, 25, 70);
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("RECIBO DE ENERGÍA", 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.text("Envía S.A.S", 105, 26, { align: "center" });

  // 📅 FECHA
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 45);

  // 📊 CALCULOS
  let totalConsumo = 0;
  let totalValor = 0;

  datosEnergia.forEach((d) => {
    totalConsumo += d.datos.reduce((acc, m) => acc + (m.consumo || 0), 0);
    totalValor += d.datos.reduce((acc, m) => acc + (m.valor || 0), 0);
  });

  // 🧾 CONTENEDOR
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, 60, 182, 60, 5, 5, "F");

  // 🔹 TITULO
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("RESUMEN DEL CONSUMO", 20, 75);

  // ⚡ CONSUMO
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(`${totalConsumo.toFixed(2)} kWh`, 20, 90);

  // 💰 TOTAL
  doc.setFillColor(10, 25, 70);
  doc.roundedRect(120, 75, 70, 30, 5, 5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("TOTAL A PAGAR", 155, 85, { align: "center" });

  doc.setFontSize(16);
  doc.text(`$ ${totalValor.toLocaleString()}`, 155, 95, { align: "center" });

  // 📌 INFO EXTRA
  doc.setTextColor(80);
  doc.setFontSize(10);
  doc.text("Periodo facturado:", 20, 110);
  doc.text("Método de pago: Transferencia", 20, 118);

  // 📉 LINEA
  doc.setDrawColor(200);
  doc.line(14, 130, 196, 130);

  // 🧾 FOOTER
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Gracias por su pago ⚡", 105, 140, { align: "center" });

  // 📄 DESCARGA
  doc.save("recibo_energia_moderno.pdf");
};
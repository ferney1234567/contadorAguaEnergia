import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarReciboPDF = (datosEnergia: any[]) => {

  const doc = new jsPDF();

  // 🎨 HEADER
  doc.setFillColor(0, 150, 255);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("RECIBO DE AGUA", 105, 18, { align: "center" });

  // 📅 FECHA
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 40);

  // 📊 CALCULOS
  let totalM3 = 0;
  let totalValor = 0;

  const filas: any[] = [];

  datosEnergia.forEach((d) => {

    const consumo = d.datos.reduce((acc: number, m: any) => acc + (m.M3 || 0), 0);
    const valor = d.datos.reduce((acc: number, m: any) => acc + (m.valor || 0), 0);

    totalM3 += consumo;
    totalValor += valor;

    filas.push([
      d.nombre,
      d.ubicacion,
      consumo.toFixed(2),
      `$ ${valor.toLocaleString()}`
    ]);
  });

  // 📋 TABLA
  autoTable(doc, {
    startY: 50,
    head: [["Sede", "Ubicación", "Consumo (m³)", "Valor"]],
    body: filas,
    styles: {
      fontSize: 9
    },
    headStyles: {
      fillColor: [0, 150, 255],
      textColor: 255
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;

  // 💰 TOTALES
  doc.setFontSize(12);
  doc.text(`Consumo total: ${totalM3.toFixed(2)} m³`, 14, finalY + 10);
  doc.text(`Total a pagar: $ ${totalValor.toLocaleString()}`, 14, finalY + 20);

  // 💧 FOOTER
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Gracias por su pago 💧", 105, finalY + 35, { align: "center" });

  // 📄 DESCARGA
  doc.save("recibo_agua.pdf");
};
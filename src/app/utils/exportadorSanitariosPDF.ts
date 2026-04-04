import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarSanitariosPDF = (registros: any[]) => {
  const doc = new jsPDF();

  // 🧾 TÍTULO
  doc.setFontSize(16);
  doc.text("Reporte de Inspecciones Sanitarias", 14, 15);

  doc.setFontSize(10);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO")}`,
    14,
    22
  );

  // 🔥 COLUMNAS
  const columnas = [
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
  ];

  // 🔥 FILAS
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

  // 📊 TABLA
  autoTable(doc, {
    head: [columnas],
    body: filas,
    startY: 28,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [16, 185, 129], // verde elegante (sanitario)
    },
  });

  // 💾 DESCARGAR
  doc.save("reporte_sanitarios.pdf");
};
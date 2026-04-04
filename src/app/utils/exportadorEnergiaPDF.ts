import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarEnergiaPDF = (registros: any[]) => {
  const doc = new jsPDF();

  // 🧾 TÍTULO
  doc.setFontSize(16);
  doc.text("Reporte General de Energía", 14, 15);

  doc.setFontSize(10);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-CO")}`,
    14,
    22
  );

  // 🔥 CABECERAS
  const columnas = [
    "Fecha",
    "Responsable",
    "Área",
    "Bombillas",
    "Reflectores",
    "Lámparas",
    "Aires",
    "Total",
    "Observación",
  ];

  // 🔥 DATOS
  const filas = registros.map((r) => [
    new Date(r.fecha).toLocaleDateString("es-CO"),
    r.responsable,
    r.area || r.area_id,
    `${r.bombillas_c}/${r.bombillas_nc}`,
    `${r.reflectores_c}/${r.reflectores_nc}`,
    `${r.lamparas_c}/${r.lamparas_nc}`,
    `${r.aires_c}/${r.aires_nc}`,
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
      fillColor: [59, 130, 246], // azul moderno
    },
  });

  // 💾 DESCARGAR
  doc.save("reporte_energia.pdf");
};
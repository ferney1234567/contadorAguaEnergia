import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportarResiduosPDF = (registros: any[]) => {
  const doc = new jsPDF();

  // 🧾 TÍTULO
  doc.setFontSize(16);
  doc.text("Reporte de Gestión de Residuos", 14, 15);

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
    "Reciclables",
    "Ordinarios",
    "Peligrosos",
    "Presintos",
    "Total",
    "Observación",
  ];

  // 🔥 FILAS
  const filas = registros.map((r) => [
    new Date(r.fecha).toLocaleDateString("es-CO"),
    r.responsable,
    r.area || r.area_id,

    `${r.reciclables_c}/${r.reciclables_nc}`,
    `${r.ordinarios_c}/${r.ordinarios_nc}`,
    `${r.peligrosos_c}/${r.peligrosos_nc}`,
    `${r.presintos_c}/${r.presintos_nc}`,

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
      fillColor: [234, 88, 12], // 🔥 naranja reciclaje
    },
  });

  // 💾 DESCARGAR
  doc.save("reporte_residuos.pdf");
};
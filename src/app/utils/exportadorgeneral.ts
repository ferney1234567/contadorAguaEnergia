import * as XLSX from "xlsx-js-style";

/* ====================== ESTILOS ====================== */
const headerStyle = (bg: string) => ({
  font: { bold: true, color: { rgb: "FFFFFF" } },
  alignment: { horizontal: "center", vertical: "center" },
  fill: { fgColor: { rgb: bg } },
  border: {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  },
});

const cellStyle = {
  alignment: { horizontal: "center" },
  border: {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  },
};

const dashboardTitle = {
  font: { bold: true, sz: 14 },
  alignment: { horizontal: "center" },
};

/* ====================== INTERFACE ====================== */
interface ExportarDashboardParams {
  anio: number;
  meses: string[];
  lecturasAgua: Record<number, Record<number, { total2: number; total4: number }>>;
  lecturasEnergia: Record<number, Record<number, { total2: number; total4: number }>>;
  totalAguaAnual: number;
  totalEnergiaAnual: number;
  promedioAguaReal: number;
  promedioEnergiaReal: number;
  metaAgua: number;
  metaEnergia: number;
}

export function exportarDashboardExcel({
  anio,
  meses,
  lecturasAgua,
  lecturasEnergia,
  totalAguaAnual,
  totalEnergiaAnual,
  promedioAguaReal,
  promedioEnergiaReal,
  metaAgua,
  metaEnergia,
}: ExportarDashboardParams) {

  /* ====================== DASHBOARD ====================== */
  const hojaDashboard = [
    ["DASHBOARD DE CONSUMOS", "", ""],
    ["Año", anio, ""],
    [],
    ["Indicador", "Valor", "Unidad"],
    ["Consumo total de agua", totalAguaAnual, "Litros"],
    ["Consumo total de energía", totalEnergiaAnual, "kWh"],
    ["Promedio diario agua", promedioAguaReal, "L/día"],
    ["Promedio diario energía", promedioEnergiaReal, "kWh/día"],
    ["Meta anual agua", metaAgua, "Litros"],
    ["Meta anual energía", metaEnergia, "kWh"],
  ];

  const wsDashboard = XLSX.utils.aoa_to_sheet(hojaDashboard);
  wsDashboard["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

  wsDashboard["A1"].s = dashboardTitle;

  ["A4", "B4", "C4"].forEach(c => (wsDashboard[c].s = headerStyle("4F81BD")));

  for (let r = 4; r <= 9; r++) {
    ["A", "B", "C"].forEach(c => {
      wsDashboard[`${c}${r + 1}`].s = cellStyle;
    });
  }

  wsDashboard["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];

  /* ====================== AGUA ====================== */
  const hojaAgua: any[] = [
    ["Mes", "Día", "Bodega 2", "Bodega 4", "Total Día"],
  ];

  Object.entries(lecturasAgua).forEach(([mes, dias]) => {
    Object.entries(dias).forEach(([dia, d]: any) => {
      hojaAgua.push([
        meses[Number(mes)],
        dia,
        d.total2,
        d.total4,
        d.total2 + d.total4,
      ]);
    });
  });

  const wsAgua = XLSX.utils.aoa_to_sheet(hojaAgua);
  ["A1", "B1", "C1", "D1", "E1"].forEach(c => (wsAgua[c].s = headerStyle("1F4ED8")));

  for (let r = 2; r <= hojaAgua.length; r++) {
    ["A", "B", "C", "D", "E"].forEach(c => {
      wsAgua[`${c}${r}`].s = cellStyle;
    });
  }

  wsAgua["!cols"] = Array(5).fill({ wch: 18 });

  /* ====================== ENERGÍA ====================== */
  const hojaEnergia: any[] = [
    ["Mes", "Día", "Bodega 2", "Bodega 4", "Total Día"],
  ];

  Object.entries(lecturasEnergia).forEach(([mes, dias]) => {
    Object.entries(dias).forEach(([dia, d]: any) => {
      hojaEnergia.push([
        meses[Number(mes)],
        dia,
        d.total2,
        d.total4,
        d.total2 + d.total4,
      ]);
    });
  });

  const wsEnergia = XLSX.utils.aoa_to_sheet(hojaEnergia);
  ["A1", "B1", "C1", "D1", "E1"].forEach(c => (wsEnergia[c].s = headerStyle("F59E0B")));

  for (let r = 2; r <= hojaEnergia.length; r++) {
    ["A", "B", "C", "D", "E"].forEach(c => {
      wsEnergia[`${c}${r}`].s = cellStyle;
    });
  }

  wsEnergia["!cols"] = Array(5).fill({ wch: 18 });

  /* ====================== CREAR EXCEL ====================== */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsDashboard, "Dashboard");
  XLSX.utils.book_append_sheet(wb, wsAgua, "Agua");
  XLSX.utils.book_append_sheet(wb, wsEnergia, "Energía");

  XLSX.writeFile(wb, `Dashboard_Consumos_${anio}.xlsx`);
}

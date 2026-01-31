import * as XLSX from "xlsx-js-style";

/* =======================
   📘 TIPOS
======================= */
interface LecturaDia {
  bodega2: string;
  bodega4: string;
  total2: number;
  total4: number;
}

type LecturasPorAnio = Record<
  number,
  Record<number, Record<number, LecturaDia>>
>;

interface ExportarParams {
  lecturas: LecturasPorAnio;
  anio: number;
  metaMensual: number;
  fechaExportacion: string;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/* =======================
   🎨 ESTILOS AMARILLOS
======================= */
const borderAll = {
  top: { style: "thin", color: { rgb: "E5E7EB" } },
  bottom: { style: "thin", color: { rgb: "E5E7EB" } },
  left: { style: "thin", color: { rgb: "E5E7EB" } },
  right: { style: "thin", color: { rgb: "E5E7EB" } },
};

const titleStyle = {
  font: { bold: true, sz: 18, color: { rgb: "92400E" } },
  fill: { fgColor: { rgb: "FEF3C7" } },
  alignment: { horizontal: "center", vertical: "center" },
  border: borderAll,
};

const headerStyle = {
  font: { bold: true, color: { rgb: "78350F" } },
  fill: { fgColor: { rgb: "FCD34D" } },
  alignment: { horizontal: "center", vertical: "center" },
  border: borderAll,
};

const cellStyle = {
  alignment: { horizontal: "center", vertical: "center" },
  border: borderAll,
  numFmt: "0.00",
};

/* =======================
   📤 EXPORTADOR ENERGÍA
======================= */
export function exportarConsumoEnergiaExcel({
  lecturas,
  anio,
  metaMensual,
  fechaExportacion,
}: ExportarParams) {

  const wb = XLSX.utils.book_new();

  /* =====================================================
      🟨 HOJA 1 – RESUMEN GENERAL ANUAL
  ===================================================== */
  const resumen: any[][] = [
    ["REPORTE GENERAL DE CONSUMO DE ENERGÍA"],
    [`Año ${anio}`],
    [`Meta mensual (kWh): ${metaMensual}`],
    [],
    [
      "Mes",
      "Consumo Bodega 2 (kWh)",
      "Consumo Bodega 4 (kWh)",
      "Total Mes (kWh)",
      "Meta",
      "Diferencia",
      "% Cumplimiento",
    ],
  ];

  MESES.forEach((mesNombre, i) => {
    const dias = lecturas?.[anio]?.[i];
    if (!dias) return;

    let totalB2 = 0;
    let totalB4 = 0;

    Object.values(dias).forEach((d) => {
      totalB2 += d.total2;
      totalB4 += d.total4;
    });

    const totalMes = totalB2 + totalB4;
    const diff = metaMensual - totalMes;
    const pct = metaMensual > 0 ? totalMes / metaMensual : 0;

    resumen.push([
      mesNombre,
      totalB2,
      totalB4,
      totalMes,
      metaMensual,
      diff,
      pct,
    ]);
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);

  wsResumen["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
  ];

  wsResumen["!cols"] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
  ];

  const rangeR = XLSX.utils.decode_range(wsResumen["!ref"]!);

  for (let R = rangeR.s.r; R <= rangeR.e.r; R++) {
    for (let C = rangeR.s.c; C <= rangeR.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!wsResumen[addr]) continue;

      if (R === 0) {
        wsResumen[addr].s = titleStyle;
        continue;
      }

      if (R === 4) {
        wsResumen[addr].s = headerStyle;
        continue;
      }

      if (C === 6 && R > 4) {
        const v = wsResumen[addr].v;
        wsResumen[addr].s = {
          ...cellStyle,
          numFmt: "0%",
          font: { bold: true },
          fill: { fgColor: { rgb: v >= 1 ? "DCFCE7" : "FEE2E2" } },
        };
        continue;
      }

      wsResumen[addr].s = {
        ...cellStyle,
        fill: { fgColor: { rgb: R % 2 === 0 ? "FFFBEB" : "FFFFFF" } },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Anual");

  /* =====================================================
      🟨 HOJAS MENSUALES – DETALLE COMPLETO
  ===================================================== */
  MESES.forEach((mesNombre, i) => {
    const dias = lecturas?.[anio]?.[i];
    if (!dias) return;

    const filas: any[][] = [
      [`CONSUMO DE ENERGÍA – ${mesNombre} ${anio}`],
      [],
      ["Día", "Bodega 2 (kWh)", "Bodega 4 (kWh)", "Total Día (kWh)"],
    ];

    let totalMes = 0;

    Object.entries(dias).forEach(([dia, d]) => {
      const totalDia = d.total2 + d.total4;
      totalMes += totalDia;
      filas.push([Number(dia), d.total2, d.total4, totalDia]);
    });

    filas.push(["TOTAL MES", "", "", totalMes]);

    const ws = XLSX.utils.aoa_to_sheet(filas);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    ];

    ws["!cols"] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 },
    ];

    const range = XLSX.utils.decode_range(ws["!ref"]!);

    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;

        if (R === 0) {
          ws[addr].s = titleStyle;
          continue;
        }

        if (R === 2) {
          ws[addr].s = headerStyle;
          continue;
        }

        if (R === range.e.r) {
          ws[addr].s = {
            ...cellStyle,
            font: { bold: true },
            fill: { fgColor: { rgb: "FEF3C7" } },
          };
          continue;
        }

        ws[addr].s = cellStyle;
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, mesNombre);
  });

  XLSX.writeFile(
    wb,
    `Consumo_Energia_${anio}_${fechaExportacion}.xlsx`
  );
}

import * as XLSX from "xlsx-js-style";

/* =========================
   TIPOS
========================= */
interface LecturaDia {
  bodega2: string;
  bodega4: string;
  total2: number;
  total4: number;
}

type LecturasPorAnio = Record<number, Record<number, Record<number, LecturaDia>>>;

interface ExportarParams {
  lecturas: LecturasPorAnio;
  anio: number;
  metaMensual: number;
  fechaExportacion: string;
}

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

/* =========================
   🎨 ESTILOS PREMIUM
========================= */
const border = {
  top: { style: "thin", color: { rgb: "CBD5E1" } },
  bottom: { style: "thin", color: { rgb: "CBD5E1" } },
  left: { style: "thin", color: { rgb: "CBD5E1" } },
  right: { style: "thin", color: { rgb: "CBD5E1" } },
};

const title = {
  font: { bold: true, sz: 22, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "1E3A8A" } },
  alignment: { horizontal: "center", vertical: "center" },
  border,
};

const header = {
  font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "2563EB" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border,
};

const cell = {
  font: { sz: 13 },
  alignment: { horizontal: "center", vertical: "center" },
  border,
  numFmt: "0.00",
};

const cellAlt = {
  ...cell,
  fill: { fgColor: { rgb: "F8FAFC" } },
};

const totalRow = {
  font: { bold: true, sz: 14, color: { rgb: "0F172A" } },
  alignment: { horizontal: "center", vertical: "center" },
  border,
  fill: { fgColor: { rgb: "DBEAFE" } },
  numFmt: "0.00",
};

const kpiLabel = {
  font: { bold: true, sz: 13, color: { rgb: "0F172A" } },
  alignment: { horizontal: "left", vertical: "center" },
  border,
  fill: { fgColor: { rgb: "EEF2FF" } },
};

const kpiValue = {
  font: { bold: true, sz: 13, color: { rgb: "0F172A" } },
  alignment: { horizontal: "center", vertical: "center" },
  border,
  fill: { fgColor: { rgb: "EEF2FF" } },
  numFmt: "0.00",
};

const pctCellOk = {
  ...kpiValue,
  numFmt: "0%",
  fill: { fgColor: { rgb: "DCFCE7" } },
};

const pctCellBad = {
  ...kpiValue,
  numFmt: "0%",
  fill: { fgColor: { rgb: "FEE2E2" } },
};

/* =========================
   HELPERS
========================= */
const diasDelMes = (anio: number, mes0: number) =>
  new Date(anio, mes0 + 1, 0).getDate();

function aplicarBordesYEstiloTabla(
  ws: XLSX.WorkSheet,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  styleEven: any,
  styleOdd: any,
  headerRowIndex?: number,
  headerStyle?: any
) {
  for (let R = startRow; R <= endRow; R++) {
    for (let C = startCol; C <= endCol; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });

      // Crear celda si no existe (para “encerrar” todo)
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };

      if (headerRowIndex !== undefined && R === headerRowIndex && headerStyle) {
        ws[addr].s = headerStyle;
      } else {
        ws[addr].s = R % 2 ? styleOdd : styleEven;
      }
    }
  }
}

/* =========================
   📤 EXPORTADOR
========================= */
export function exportarConsumoAguaExcel({
  lecturas,
  anio,
  metaMensual,
  fechaExportacion,
}: ExportarParams) {

  const wb = XLSX.utils.book_new();

  /* =====================================================
     🟦 HOJA 1 – RESUMEN GENERAL (con bordes completos)
  ===================================================== */
  const resumen: any[][] = [
    ["RESUMEN GENERAL DE CONSUMO DE AGUA"],
    [],
    ["Mes","Bodega 2","Bodega 4","Total Mes","Meta","Diferencia","% Cumplimiento"]
  ];

  MESES.forEach((mes, i) => {
    const dias = lecturas?.[anio]?.[i];
    if (!dias) return;

    let b2 = 0, b4 = 0;
    Object.values(dias).forEach(d => {
      b2 += d.total2;
      b4 += d.total4;
    });

    const total = b2 + b4;
    const diff = metaMensual - total;
    const pct = metaMensual > 0 ? total / metaMensual : 0;

    resumen.push([mes, b2, b4, total, metaMensual, diff, pct]);
  });

  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);

  wsResumen["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

  wsResumen["!cols"] = [
    { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 22 }
  ];

  wsResumen["!rows"] = [
    { hpt: 42 }, { hpt: 16 }, { hpt: 30 },
    ...Array(Math.max(0, resumen.length - 3)).fill({ hpt: 24 })
  ];

  // Estilos por celda (incluye %)
  const rRange = XLSX.utils.decode_range(wsResumen["!ref"]!);
  for (let R = rRange.s.r; R <= rRange.e.r; R++) {
    for (let C = rRange.s.c; C <= rRange.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      const celd = wsResumen[addr];
      if (!celd) continue;

      if (R === 0) celd.s = title;
      else if (R === 2) celd.s = header;
      else if (R >= 3 && C === 6) {
        celd.s = {
          ...cell,
          numFmt: "0%",
          fill: { fgColor: { rgb: Number(celd.v) >= 1 ? "DCFCE7" : "FEE2E2" } },
        };
      } else if (R >= 3) {
        celd.s = R % 2 ? cell : cellAlt;
      }
    }
  }

  // Encerrar todo el bloque de la tabla (filas 2..fin, cols 0..6)
  aplicarBordesYEstiloTabla(wsResumen, 2, rRange.e.r, 0, 6, cellAlt, cell, 2, header);

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  /* =====================================================
     🟩 HOJAS MENSUALES (con KPIs: B2, B4, Total, Meta, Dif, %)
         + incluye todos los días del mes (domingos/festivos también)
  ===================================================== */
  MESES.forEach((mesNombre, i) => {
    const diasLect = lecturas?.[anio]?.[i] ?? {};
    const ultimoDia = diasDelMes(anio, i);

    // Tabla diaria: incluye 1..ultimoDia aunque no haya lectura
    const rows: any[][] = [
      [`CONSUMO DIARIO DE AGUA – ${mesNombre.toUpperCase()} ${anio}`],
      [],
      ["Fecha", "Total Bodega 2", "Total Bodega 4", "Total Día"],
    ];

    let sumaB2 = 0;
    let sumaB4 = 0;

    for (let d = 1; d <= ultimoDia; d++) {
      const v = diasLect[d];
      const t2 = v ? Number(v.total2 || 0) : 0;
      const t4 = v ? Number(v.total4 || 0) : 0;
      const totalDia = t2 + t4;

      sumaB2 += t2;
      sumaB4 += t4;

      const fecha = `${anio}-${String(i + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      rows.push([fecha, t2, t4, totalDia]);
    }

    const totalMes = sumaB2 + sumaB4;
    const diff = metaMensual - totalMes;
    const pct = metaMensual > 0 ? totalMes / metaMensual : 0;

    // Totales y KPIs (en celdas, “encerrados”)
    rows.push(["TOTAL BODEGA 2", "", "", sumaB2]);
    rows.push(["TOTAL BODEGA 4", "", "", sumaB4]);
    rows.push(["TOTAL MES", "", "", totalMes]);
    rows.push(["META MENSUAL", "", "", metaMensual]);
    rows.push(["DIFERENCIA (Meta - Total)", "", "", diff]);
    rows.push(["% CUMPLIMIENTO", "", "", pct]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Merge del título
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    // Tamaños bonitos
    ws["!cols"] = [
      { wch: 24 }, // Fecha / etiquetas
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];

    ws["!rows"] = [
      { hpt: 40 }, // título
      { hpt: 14 },
      { hpt: 28 }, // header tabla
      ...Array(ultimoDia).fill({ hpt: 22 }),
      { hpt: 26 }, { hpt: 26 }, { hpt: 26 }, { hpt: 26 }, { hpt: 26 }, { hpt: 26 }
    ];

    // Aplicar estilos
    const rg = XLSX.utils.decode_range(ws["!ref"]!);

    for (let R = rg.s.r; R <= rg.e.r; R++) {
      for (let C = rg.s.c; C <= rg.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const celd = ws[addr];
        if (!celd) continue;

        // Título
        if (R === 0) {
          celd.s = title;
          continue;
        }

        // Header tabla (fila 2)
        if (R === 2) {
          celd.s = header;
          continue;
        }

        // Bloque KPI (últimas 6 filas)
        const kpiStart = 3 + ultimoDia; // donde arrancan los totales
        if (R >= kpiStart) {
          // columna A etiqueta
          if (C === 0) celd.s = kpiLabel;
          // valor final columna D
          else if (C === 3) {
            if (R === kpiStart + 5) {
              // % cumplimiento
              celd.s = pct >= 1 ? pctCellOk : pctCellBad;
            } else {
              celd.s = kpiValue;
            }
          } else {
            celd.s = kpiValue; // celdas vacías del KPI
          }
          continue;
        }

        // Filas de datos: alternadas + bordes
        celd.s = R % 2 ? cell : cellAlt;
      }
    }

    // Encerrar toda la tabla diaria (fila 2 .. fila 2+ultimoDia, col 0..3)
    aplicarBordesYEstiloTabla(ws, 2, 2 + ultimoDia, 0, 3, cellAlt, cell, 2, header);

    // Encerrar KPIs (kpiStart..kpiStart+5, col 0..3)
    const kpiStartRow = 3 + ultimoDia;
    aplicarBordesYEstiloTabla(ws, kpiStartRow, kpiStartRow + 5, 0, 3, kpiValue, kpiValue);

    XLSX.utils.book_append_sheet(wb, ws, mesNombre);
  });

  XLSX.writeFile(
    wb,
    `Reporte_Consumo_Agua_${anio}_${fechaExportacion}.xlsx`
  );
}

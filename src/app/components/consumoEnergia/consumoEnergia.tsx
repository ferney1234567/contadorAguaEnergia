"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Download,
  Droplets,
  Calendar,
  Filter,
  CalendarDays,
  Info,
  Zap,
  Tag,
  Hash,
} from "lucide-react";
import { obtenerFestivosColombia } from "../../utils/festivosColombia";



interface LecturaDia {
  bodega2: string;
  bodega4: string;
  total2: number;
  total4: number;
}

interface Props {
  modoNoche: boolean;
  lecturas: Record<number, Record<number, LecturaDia>>;
  setLecturas: React.Dispatch<
    React.SetStateAction<Record<number, Record<number, LecturaDia>>>
  >;
}
export default function ConsumoEnergia({
  modoNoche,
  lecturas = {} as any,
  setLecturas,
}: Props) {


  /* ================= FECHA ================= */
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  /* ================= ESTADOS ================= */

  const [mesSeleccionado, setMesSeleccionado] = useState<number | "todos">(
    mesActual
  );

  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [filtroDia, setFiltroDia] = useState("");
  const [filtroTipoDia, setFiltroTipoDia] = useState<
    "todos" | "domingos" | "festivos" | "habiles"
  >("todos");



  /* ================= ESTILOS ================= */
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-[#ffffff] text-black",
    tarjeta: "bg-white border border-gray-200 shadow-sm",
    tarjetaDark: "bg-[#1a1a1a] border border-[#333]",
    tabla: modoNoche
      ? "bg-[#1a1a1a] border-gray-600 text-white"
      : "bg-white border-gray-300 text-black",
  };

  const tarjetaClase = modoNoche
    ? "bg-[#1a1a1a] border border-[#333] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
    : "bg-white border border-gray-200 text-black shadow-sm";

  /* ================= MESES ================= */
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  /* ================= FESTIVOS ================= */
 const festivos = obtenerFestivosColombia(anioSeleccionado);

  const buscadorClase = modoNoche
    ? "bg-[#1a1a1a] border border-[#333] text-white"
    : "bg-white border border-gray-200 text-black";

  const inputClase = modoNoche
    ? "bg-[#2a2a2a] border border-[#444] text-white placeholder-gray-400"
    : "bg-gray-100 border border-gray-300 text-black";

  const tablaBase = modoNoche
    ? "bg-[#1f1f1f] border-[#3a3a3a] text-gray-100"
    : "bg-white border-gray-300 text-gray-800";

  const celdaBase = modoNoche
    ? "bg-[#2a2a2a] border-[#3a3a3a]"
    : "bg-gray-50 border-gray-300";

  const celdaVacia = modoNoche ? "bg-[#252525]" : "bg-gray-100";

  const totalDias =
    typeof mesSeleccionado === "number"
      ? new Date(anioSeleccionado, mesSeleccionado + 1, 0).getDate()
      : 31;

  const fechaColombia = new Date().toLocaleDateString("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const mesesARenderizar =
    mesSeleccionado === "todos" ? meses.map((_, i) => i) : [mesSeleccionado];

  const obtenerDiasDelMes = (mes: number) => {
    const totalDiasMes = new Date(anioSeleccionado, mes + 1, 0).getDate();

    return Array.from({ length: totalDiasMes }, (_, i) => {
      const dia = i + 1;
      const fecha = new Date(anioSeleccionado, mes, dia);

      const tipo: "D" | "F" | "NA" =
        fecha.getDay() === 0
          ? "D"
          : festivos.includes(formatearFechaLocal(fecha))
          ? "F"
          : "NA";

      return { dia, tipo };
    });
  };

  const obtenerDiaHabilAnterior = (
    mes: number,
    diaActual: number,
    lecturasMes: Record<number, LecturaDia>
  ) => {
    const diasMes = obtenerDiasDelMes(mes);

    for (let d = diaActual - 1; d >= 1; d--) {
      const info = diasMes.find((x) => x.dia === d);

      if (info?.tipo === "NA" && lecturasMes[d]) {
        return lecturasMes[d];
      }
    }

    return null;
  };

  const formatearFechaLocal = (fecha: Date) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const obtenerDiasFiltrados = (mes: number) => {
    const diasMes = obtenerDiasDelMes(mes);

    return diasMes.filter(({ dia, tipo }) => {
      if (filtroDia && Number(filtroDia) !== dia) return false;
      if (filtroTipoDia === "domingos" && tipo !== "D") return false;
      if (filtroTipoDia === "festivos" && tipo !== "F") return false;
      if (filtroTipoDia === "habiles" && tipo !== "NA") return false;
      return true;
    });
  };

  /* ================= LÓGICA ================= */
  const limpiarNumero = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  const calcularTotal = (actual: number, anterior: number) =>
  actual - anterior;


  const handleChange = (
    mes: number,
    dia: number,
    campo: "bodega2" | "bodega4",
    valor: string
  ) => {
    const limpio = limpiarNumero(valor);

    const diasMes = obtenerDiasDelMes(mes);
    const diaInfo = diasMes.find((d) => d.dia === dia);

    if (diaInfo?.tipo === "D" || diaInfo?.tipo === "F") {
      return; // ⛔ bloquea domingos y festivos
    }

    setLecturas((prev) => {
  const mesData = prev[mes] || {};

  const actual = mesData[dia] || {
    bodega2: "",
    bodega4: "",
    total2: 0,
    total4: 0,
  };

  const anterior = obtenerDiaHabilAnterior(mes, dia, mesData);

      

      return {
        ...prev,
        [mes]: {
          ...mesData,
          [dia]: {
            ...actual,
            [campo]: limpio,
           total2:
          campo === "bodega2" && anterior?.bodega2
            ? Number(limpio) - Number(anterior.bodega2)
            : actual.total2,

        total4:
          campo === "bodega4" && anterior?.bodega4
            ? Number(limpio) - Number(anterior.bodega4)
            : actual.total4,
          },
        },
      };

    
    });
  };

 const totalMes = (mes: number) => {
  const lecturasMes = (lecturas as any)?.[mes] ?? {};
  return obtenerDiasDelMes(mes)
    .reduce((acc, { dia }) => {
      const d = lecturasMes?.[dia];
      return d ? acc + d.total2 + d.total4 : acc;
    }, 0)
    .toFixed(2);
};

const totalDia = (mes: number, dia: number) => {
  const d = (lecturas as any)?.[mes]?.[dia];
  if (!d) return "";
  const total = d.total2 + d.total4;
  return total > 0 ? total.toFixed(2) : "";
};


 

 /* ================= EXPORTAR CON DISEÑO MODERNO ================= */
const exportarExcel = () => {
  const filas: any[][] = [];

  const mesesAExportar =
    mesSeleccionado === "todos"
      ? meses.map((_, i) => i)
      : [mesSeleccionado];

  let totalGeneral = 0;

  /* ===== ENCABEZADO PRINCIPAL ===== */
  filas.push(["REPORTE DE CONSUMO DE AGUA"]);
  filas.push([`Año: ${anioSeleccionado}`]);
  filas.push([`Fecha de exportación: ${fechaColombia}`]);
  filas.push([]); // separador

  mesesAExportar.forEach((mes, index) => {
    const dias = obtenerDiasFiltrados(mes);
    if (dias.length === 0) return;

    // Título del mes
    filas.push([`MES: ${meses[mes].toUpperCase()}`]);
    
    // Encabezados de la tabla
    filas.push([
      "Día",
      "Tipo",
      "Bodega 2 (Lectura)",
      "Bodega 4 (Lectura)",
      "Consumo B2 (m³)",
      "Consumo B4 (m³)",
      "Total Día (m³)",
    ]);

    let totalMesExcel = 0;
    let totalB2Mes = 0;
    let totalB4Mes = 0;

    // Datos de cada día
    dias.forEach(({ dia, tipo }) => {
      const d = lecturas[mes]?.[dia] ?? {
        bodega2: "",
        bodega4: "",
        total2: 0,
        total4: 0,
      };

      const totalDiaExcel = d.total2 + d.total4;
      totalMesExcel += totalDiaExcel;
      totalB2Mes += d.total2;
      totalB4Mes += d.total4;

      filas.push([
        dia,
        tipo,
        d.bodega2,
        d.bodega4,
        d.total2.toFixed(2),
        d.total4.toFixed(2),
        totalDiaExcel.toFixed(2),
      ]);
    });

    // Subtotales del mes
    filas.push([
      "",
      "",
      "TOTAL MES:",
      "",
      totalB2Mes.toFixed(2),
      totalB4Mes.toFixed(2),
      totalMesExcel.toFixed(2),
    ]);
    
    // Separador entre meses
    if (index < mesesAExportar.length - 1) {
      filas.push([]);
    }

    totalGeneral += totalMesExcel;
  });

  /* ===== RESUMEN FINAL ===== */
  filas.push([]);
  filas.push(["RESUMEN GENERAL"]);
  filas.push([
    "Período:",
    mesSeleccionado === "todos" ? "Año completo" : meses[mesSeleccionado],
  ]);
  filas.push([
    "Total Consumido (m³):",
    totalGeneral.toFixed(2),
  ]);

  const ws = XLSX.utils.aoa_to_sheet(filas);

  /* ===== APLICAR ESTILOS ===== */
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  
  // Estilos para celdas
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      const cellValue = ws[cellAddress].v;
      
      // Encabezado principal (fila 0)
      if (R === 0) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2E5090" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
      
      // Subtítulos (filas 1-2)
      else if (R === 1 || R === 2) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: "D9E1F2" } },
          alignment: { horizontal: "left" },
        };
      }
      
      // Títulos de mes (contiene "MES:")
      else if (typeof cellValue === "string" && cellValue.includes("MES:")) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center" },
        };
      }
      
      // Encabezados de tabla (contiene "Día", "Tipo", etc.)
      else if (
        typeof cellValue === "string" &&
        (cellValue === "Día" || cellValue === "Tipo" || cellValue.includes("Bodega") || cellValue.includes("Total") || cellValue.includes("Consumo"))
      ) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "5B9BD5" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
      
      // Filas de total de mes
      else if (typeof cellValue === "string" && cellValue === "TOTAL MES:") {
        for (let c = C; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r: R, c });
          if (ws[addr]) {
            ws[addr].s = {
              font: { bold: true, sz: 11 },
              fill: { fgColor: { rgb: "E7E6E6" } },
              alignment: { horizontal: c === C + 2 ? "left" : "right" },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
              },
            };
          }
        }
      }
      
      // Resumen general
      else if (typeof cellValue === "string" && cellValue === "RESUMEN GENERAL") {
        ws[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "70AD47" } },
          alignment: { horizontal: "center" },
        };
      }
      
      // Datos numéricos (consumos)
      else if (typeof cellValue === "number" || (typeof cellValue === "string" && !isNaN(parseFloat(cellValue)))) {
        ws[cellAddress].s = {
          alignment: { horizontal: "right" },
          numFmt: "0.00",
        };
      }
    }
  }

  /* ===== ANCHOS DE COLUMNA OPTIMIZADOS ===== */
  ws["!cols"] = [
    { wch: 10 },  // Día
    { wch: 10 },  // Tipo
    { wch: 20 },  // Bodega 2 Lectura
    { wch: 20 },  // Bodega 4 Lectura
    { wch: 18 },  // Consumo B2
    { wch: 18 },  // Consumo B4
    { wch: 18 },  // Total Día
  ];

  /* ===== COMBINAR CELDAS ===== */
  if (!ws["!merges"]) ws["!merges"] = [];
  
  // Combinar título principal
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });
  
  // Buscar y combinar títulos de mes
  for (let R = 0; R <= range.e.r; R++) {
    const cellValue = ws[XLSX.utils.encode_cell({ r: R, c: 0 })]?.v;
    if (typeof cellValue === "string" && cellValue.includes("MES:")) {
      ws["!merges"].push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
    }
    if (typeof cellValue === "string" && cellValue === "RESUMEN GENERAL") {
      ws["!merges"].push({ s: { r: R, c: 0 }, e: { r: R, c: 6 } });
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Consumo Agua");

  XLSX.writeFile(
    wb,
    `Consumo_Agua_${anioSeleccionado}_${fechaColombia.replace(/\//g, "-")}.xlsx`
  );
};
 

  /* ================= RENDER ================= */
  return (
    <div className={`w-full min-h-screen p-6 ${colores.fondo}`}>
      <div className="w-full max-w-[1400px] mx-auto space-y-8">
{/* ======================= 4 CONTENEDORES ======================= */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

  {/* Meta mensual */}
  <div className={`p-6 rounded-xl ${tarjetaClase}`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-semibold opacity-80">
        Meta mensual de energía
      </h4>
      <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
        <Zap size={20} />
      </div>
    </div>

    <p className="text-3xl font-bold text-yellow-500 tracking-tight">
      1200 kWh
    </p>

    <p className="text-xs mt-1 opacity-60">
      Consumo objetivo del mes
    </p>
  </div>

  {/* Mes + fecha */}
  <div className={`p-6 rounded-xl ${tarjetaClase}`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-semibold opacity-80">
        Mes en seguimiento
      </h4>
      <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
        <CalendarDays size={20} />
      </div>
    </div>

    <p className="text-xl font-bold text-amber-500">
  {mesSeleccionado === "todos"
    ? "Todos los meses"
    : meses[mesSeleccionado]}{" "}
  {anioSeleccionado}
</p>


    <p className="text-sm opacity-60 mt-1 capitalize">
      {fechaColombia}
    </p>
  </div>

  {/* Clasificación de días (DISEÑO ORIGINAL) */}
  <div className={`p-6 rounded-xl ${tarjetaClase}`}>
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-semibold opacity-80">Clasificación de días</h4>
      <div className="p-2 rounded-full bg-gray-100 text-gray-500">
        <Info size={20} />
      </div>
    </div>

    <div className="text-sm space-y-2">
      <div className="flex gap-2 items-center">
        <span className="w-3 h-3 bg-purple-500 rounded-full" />
        Domingo (D)
      </div>

      <div className="flex gap-2 items-center">
        <span className="w-3 h-3 bg-red-500 rounded-full" />
        Festivo (F)
      </div>

      <div className="flex gap-2 items-center">
        <span
          className={`w-3 h-3 rounded-full ${
            modoNoche ? "bg-gray-500" : "bg-gray-300"
          }`}
        />
        Hábil (NA)
      </div>
    </div>
  </div>

  {/* Exportar */}
  <div className={`p-6 rounded-xl ${tarjetaClase}`}>
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-semibold opacity-80">
        Exportar consumo
      </h4>
      <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
        <Download size={20} />
      </div>
    </div>

    <button
      onClick={exportarExcel}
      className="
        w-full py-3 rounded-lg
        bg-gradient-to-r from-yellow-500 to-amber-500
        hover:from-yellow-600 hover:to-amber-600
        text-white font-semibold
        flex items-center justify-center gap-2
        transition-all
        shadow-md
      "
    >
      <Download size={18} />
      Exportar energía
    </button>
  </div>

</div>



       {/* ======================= BUSCADOR AVANZADO ======================= */}
<div className={`p-6 rounded-xl ${buscadorClase}`}>

  {/* TÍTULO */}
  <div className="flex items-start gap-3 mb-5">
    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
      <Filter size={18} />
    </div>
    <div>
      <h3 className="font-semibold">Buscador avanzado</h3>
      <p className="text-sm opacity-70">
        Filtra por mes, año, día o tipo de día
      </p>
    </div>
  </div>

  {/* CAMPOS */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

    {/* MES */}
    <div className="flex flex-col text-sm">
      <label className="mb-1 font-medium flex items-center gap-2">
        <Calendar size={14} className="text-emerald-500" />
        Mes
      </label>

      <div className="relative">
        <select
          className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
          value={mesSeleccionado}
          onChange={(e) =>
            setMesSeleccionado(
              e.target.value === "todos"
                ? "todos"
                : Number(e.target.value)
            )
          }
        >
          <option value="todos">Todos los meses</option>
          {meses.map((mes, i) => (
            <option key={i} value={i}>
              {mes}
            </option>
          ))}
        </select>

        <CalendarDays
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>

    {/* AÑO */}
    <div className="flex flex-col text-sm">
      <label className="mb-1 font-medium flex items-center gap-2">
        <Calendar size={14} className="text-emerald-500" />
        Año
      </label>

      <div className="relative">
        <select
          className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
          value={anioSeleccionado}
          onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
        >
          {[2024, 2025, 2026].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <Calendar
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>

    {/* DÍA */}
    <div className="flex flex-col text-sm">
      <label className="mb-1 font-medium flex items-center gap-2">
        <Hash size={14} className="text-emerald-500" />
        Día (opcional)
      </label>

      <div className="relative">
        <input
          type="number"
          min={1}
          max={31}
          placeholder="Ej: 15"
          className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
          value={filtroDia}
          onChange={(e) => setFiltroDia(e.target.value)}
        />

        <CalendarDays
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>

    {/* TIPO DE DÍA */}
    <div className="flex flex-col text-sm">
      <label className="mb-1 font-medium flex items-center gap-2">
        <Tag size={14} className="text-emerald-500" />
        Tipo de día
      </label>

      <div className="relative">
        <select
          className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
          value={filtroTipoDia}
          onChange={(e) => setFiltroTipoDia(e.target.value as any)}
        >
          <option value="todos">Todos</option>
          <option value="domingos">Domingos</option>
          <option value="festivos">Festivos</option>
          <option value="habiles">Hábiles</option>
        </select>

        <Filter
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>

  </div>
</div>


     {/* ======================= PRIMERA TABLA (RESUMEN + CALENDARIO) ======================= */}
{mesesARenderizar.map((mes) => {
  const diasMes = obtenerDiasDelMes(mes);

  const diasFiltradosMes = diasMes.filter(({ dia, tipo }) => {
    if (filtroDia && Number(filtroDia) !== dia) return false;
    if (filtroTipoDia === "domingos" && tipo !== "D") return false;
    if (filtroTipoDia === "festivos" && tipo !== "F") return false;
    if (filtroTipoDia === "habiles" && tipo !== "NA") return false;
    return true;
  });

  return (
    <div key={mes} className="space-y-6 mt-12">
      <div
        className={`
          rounded-xl border overflow-hidden font-sans
          ${modoNoche ? "border-gray-700 bg-[#0d0d0d]" : "border-gray-300 bg-white"}
        `}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>

              {/* ===== TOTAL DEL MES ===== */}
              <tr>
                <td
                  colSpan={diasMes.length}
                  className={`
                    text-center font-semibold tracking-wide
                    text-sm md:text-base p-3
                    border-b
                    ${
                      modoNoche
                        ? "bg-[#141414] border-gray-700 text-emerald-400"
                        : "bg-emerald-50 border-gray-300 text-emerald-700"
                    }
                  `}
                >
                  {meses[mes]} {anioSeleccionado} · Total consumido:{" "}
                  <span className="font-bold">{totalMes(mes)} m³</span>
                </td>
              </tr>

              {/* ===== FILA DÍAS ===== */}
              <tr>
                {diasMes.map(({ dia, tipo }) => {
                  const color =
                    tipo === "D"
                      ? modoNoche
                        ? "bg-[#1a1a1a] text-gray-300"
                        : "bg-violet-100 text-violet-800"
                      : tipo === "F"
                      ? modoNoche
                        ? "bg-[#1f1f1f] text-gray-300"
                        : "bg-rose-100 text-rose-800"
                      : modoNoche
                      ? "bg-[#121212] text-gray-200"
                      : "bg-gray-100 text-gray-800";

                  return (
                    <td
                      key={dia}
                      className={`
                        text-center text-xs font-semibold
                        p-2 border
                        ${modoNoche ? "border-gray-700" : "border-gray-300"}
                        ${color}
                      `}
                    >
                      {dia}
                    </td>
                  );
                })}
              </tr>

              {/* ===== FILA CONSUMO POR DÍA ===== */}
              <tr>
                {diasMes.map(({ dia, tipo }) => {
                  const color =
                    tipo === "D"
                      ? modoNoche
                        ? "bg-[#161616] text-gray-300"
                        : "bg-violet-100 text-violet-900"
                      : tipo === "F"
                      ? modoNoche
                        ? "bg-[#1b1b1b] text-gray-300"
                        : "bg-rose-100 text-rose-900"
                      : modoNoche
                      ? "bg-[#0b0b0b] text-gray-200"
                      : "bg-white text-gray-800";

                  return (
                    <td
                      key={dia}
                      className={`
                        h-8 text-center text-xs font-medium
                        border
                        ${modoNoche ? "border-gray-700" : "border-gray-300"}
                        ${color}
                      `}
                    >
                      {totalDia(mes, dia) || "—"}
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    

            {/* ======================= SEGUNDA TABLA (IGUAL A LA TUYA) ======================= */}
<div
  className={`
    overflow-x-auto rounded-xl
    border
    ${modoNoche
      ? "border-[#2a2a2a] bg-[#0d0d0d]"
      : "border-gray-300 bg-white"}
    font-sans
  `}
>
  <table className="w-full text-sm border-collapse">

    {/* ===== HEADER ===== */}
    <thead
      className={
        modoNoche
          ? "bg-[#141414] text-gray-200"
          : "bg-gray-100 text-gray-800"
      }
    >
      <tr>
        {[
          "Día",
          "Tipo",
          "Bodega 2",
          "Bodega 4",
          "Total Bodega 2",
          "Total Bodega 4",
        ].map((h) => (
          <th
            key={h}
            className={`
              p-3 text-center font-semibold
              border
              ${modoNoche ? "border-gray-700" : "border-gray-300"}
            `}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>

    {/* ===== BODY ===== */}
    <tbody>
      {diasFiltradosMes.map(({ dia, tipo }) => {
        const esBloqueado = tipo === "D" || tipo === "F";

        const d = lecturas[mes]?.[dia] ?? {
          bodega2: "",
          bodega4: "",
          total2: 0,
          total4: 0,
        };

        return (
          <tr
  key={dia}
  className={
    tipo === "F"
      ? modoNoche
        ? "bg-[#3a1f2b] hover:bg-[#4a2736]"   // 🌙 rosado oscuro noche
        : "bg-rose-100 hover:bg-rose-200"   // ☀️ rosado claro día
      : modoNoche
      ? "odd:bg-[#0f0f0f] even:bg-[#151515] hover:bg-[#1f1f1f]"
      : "odd:bg-white even:bg-gray-50 hover:bg-gray-100"
  }
          >
            <td
              className={`border p-2 text-center ${
                modoNoche
                  ? "border-gray-700 text-gray-200"
                  : "border-gray-300 text-gray-800"
              }`}
            >
              {dia}
            </td>

            <td
              className={`border p-2 text-center font-semibold ${
                modoNoche
                  ? "border-gray-700 text-gray-200"
                  : "border-gray-300 text-gray-800"
              }`}
            >
              {tipo}
            </td>

            {/* ===== BODEGA 2 ===== */}
            <td
              className={`border p-2 ${
                modoNoche ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <input
                value={d.bodega2}
                disabled={esBloqueado}
                onChange={(e) =>
                  handleChange(mes, dia, "bodega2", e.target.value)
                }
                className={`
                  w-full p-1 text-center rounded border
                  ${
                    esBloqueado
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                      : modoNoche
                      ? "bg-[#0b0b0b] text-gray-200 border-gray-600"
                      : "bg-white text-gray-800 border-gray-300"
                  }
                  focus:ring-2 focus:ring-emerald-500 outline-none
                `}
              />
            </td>

            {/* ===== BODEGA 4 ===== */}
            <td
              className={`border p-2 ${
                modoNoche ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <input
                value={d.bodega4}
                disabled={esBloqueado}
                onChange={(e) =>
                  handleChange(mes, dia, "bodega4", e.target.value)
                }
                className={`
                  w-full p-1 text-center rounded border
                  ${
                    esBloqueado
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                      : modoNoche
                      ? "bg-[#0b0b0b] text-gray-200 border-gray-600"
                      : "bg-white text-gray-800 border-gray-300"
                  }
                  focus:ring-2 focus:ring-emerald-500 outline-none
                `}
              />
            </td>

            {/* ===== TOTALES ===== */}
            <td
              className={`border p-2 text-center font-semibold ${
                modoNoche
                  ? "border-gray-700 text-emerald-400"
                  : "border-gray-300 text-emerald-700"
              }`}
            >
              {d.total2}
            </td>

            <td
              className={`border p-2 text-center font-semibold ${
                modoNoche
                  ? "border-gray-700 text-emerald-400"
                  : "border-gray-300 text-emerald-700"
              }`}
            >
              {d.total4}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

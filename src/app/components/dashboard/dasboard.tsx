"use client";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";
import * as XLSX from "xlsx";


import {
  FaWater,
  FaBolt,
  FaChartLine,
  FaClipboardList,
  FaTint,
  FaLightbulb,
} from "react-icons/fa";

import { FC, useState } from "react";
import ConsumoAgua from "../consumoAgua/consumoAgua";
import ConsumoEnergia from "../consumoEnergia/consumoEnergia";


ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Props {
  modoNoche: boolean;
  
}


const DashboardInicio: FC<Props> = ({ modoNoche }) => {

  /* ==============================
     MESES
  ============================== */
  const meses = [
    "Ene","Feb","Mar","Abr","May","Jun",
    "Jul","Ago","Sep","Oct","Nov","Dic"
  ];

  /* ==============================
     DATOS POR AÑO
     → Puedes conectar con tu API luego
  ============================== */
  const datosAnuales: any = {
    2023: {
      consumoAgua: [820,830,780,900,910,920,880,875,860,890,910,950],
      consumoEnergia: [290,300,310,320,335,340,330,320,300,295,310,320],
      aguaTotal: 11500,
      energiaTotal: 4200,
      promedioAgua: 780,
      promedioEnergia: 110,
    },
    2024: {
      consumoAgua: [880,840,860,920,950,970,930,900,880,910,930,960],
      consumoEnergia: [300,310,315,330,340,350,340,325,310,305,315,330],
      aguaTotal: 12200,
      energiaTotal: 4500,
      promedioAgua: 820,
      promedioEnergia: 120,
    },
    2025: {
      consumoAgua: [900,850,880,920,950,970,930,910,880,900,940,960],
      consumoEnergia: [310,305,320,330,345,350,340,325,315,300,310,330],
      aguaTotal: 12520,
      energiaTotal: 3980,
      promedioAgua: 850,
      promedioEnergia: 128,
    }
  };

  /* ==============================
     ESTADO DEL AÑO SELECCIONADO
  ============================== */
  const [anio, setAnio] = useState(2025);
const metaAgua = 13000;      // L
const metaEnergia = 4200;   // kWh

const metaMensualAgua = metaAgua / 12;
const metaMensualEnergia = metaEnergia / 12;
const [lecturasAgua, setLecturasAgua] = useState({});
const [lecturasEnergia, setLecturasEnergia] = useState({});


  const consumoAgua = datosAnuales[anio].consumoAgua;
  
  const consumoEnergia = datosAnuales[anio].consumoEnergia;

  /* ==============================
     PALETA
  ============================== */
  const cardBg = modoNoche ? "bg-[#1e1e1e]" : "bg-white";
  const cardBorder = modoNoche ? "border-[#3a3a3a]" : "border-gray-200";
  const textColor = modoNoche ? "text-white" : "text-black";
  const textSoft = modoNoche ? "text-gray-300" : "text-gray-600";

  const colores = {
    agua: "#0ea5e9",
    aguaGradient: "rgba(14,165,233,0.25)",
    energia: "#f59e0b",
    energiaGradient: "rgba(245,158,11,0.25)",
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-white text-black"
  };

  /* ==============================
     OPCIONES DE GRÁFICAS
  ============================== */
  const opcionesArea = {
    responsive: true,
    plugins: {
      legend: { labels: { color: textColor } },
      tooltip: {
        backgroundColor: modoNoche ? "#1e1e1e" : "#ffffff",
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: modoNoche ? "#3a3a3a" : "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: { ticks: { color: textSoft }, grid: { display: false }},
      y: { ticks: { color: textSoft }, grid: { color: modoNoche ? "#2a2a2a" : "#e5e7eb" }},
    }
  };

  const opcionesBarras = {
    responsive: true,
    plugins: {
      legend: { labels: { color: textColor }},
      tooltip: {
        backgroundColor: modoNoche ? "#1e1e1e" : "#ffffff",
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: modoNoche ? "#3a3a3a" : "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: { ticks: { color: textSoft }, grid: { display: false }},
      y: { ticks: { color: textSoft }, grid: { color: modoNoche ? "#2a2a2a" : "#e5e7eb" }},
    },
  };

  /* ==============================
     DATOS DE LAS GRÁFICAS
  ============================== */
  const dataAgua = {
    labels: meses,
    datasets: [{
      label: "Consumo Agua (L)",
      data: consumoAgua,
      backgroundColor: colores.agua,
      borderRadius: 10,
    }],
  };

  const dataEnergia = {
    labels: meses,
    datasets: [{
      label: "Consumo Energía (kWh)",
      data: consumoEnergia,
      backgroundColor: colores.energia,
      borderRadius: 10,
    }],
  };

  const dataAreaAgua = {
    labels: meses,
    datasets: [{
      label: "Agua total (L)",
      data: consumoAgua,
      borderColor: colores.agua,
      backgroundColor: colores.aguaGradient,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: colores.agua
    }]
  };

  const dataAreaEnergia = {
    labels: meses,
    datasets: [{
      label: "Energía total (kWh)",
      data: consumoEnergia,
      borderColor: colores.energia,
      backgroundColor: colores.energiaGradient,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: colores.energia
    }]
  };

  const dataMetaAgua = {
  labels: ["Agua"],
  datasets: [
    {
      label: "Meta",
      data: [metaAgua],
      backgroundColor: modoNoche ? "#1e293b" : "#e5e7eb",
      barThickness: 20,
      borderRadius: 10,
    },
    {
      label: "Consumo real",
      data: [datosAnuales[anio].aguaTotal],
      backgroundColor: colores.agua,
      barThickness: 12,
      borderRadius: 10,
    },
  ],
};




const dataDiferenciaAguaMensual = {
  labels: meses,
  datasets: [
    {
      label: "Meta mensual",
      data: Array(12).fill(metaMensualAgua),
      backgroundColor: modoNoche ? "#334155" : "#e5e7eb", // gris neutro
      borderRadius: 6,
      barThickness: 14,
    },
    {
      label: "Consumo real",
      data: consumoAgua,
      backgroundColor: consumoAgua.map((v: number) =>
  v <= metaMensualAgua
    ? "#38bdf8"
    : "#ef4444"
),
      borderRadius: 6,
      barThickness: 14,
    },
  ],
};


const dataDiferenciaEnergiaMensual = {
  labels: meses,
  datasets: [
    {
      label: "Meta mensual",
      data: Array(12).fill(metaMensualEnergia),
      backgroundColor: modoNoche ? "#334155" : "#e5e7eb", // gris neutro
      borderRadius: 6,
      barThickness: 14,
    },
    {
      label: "Consumo real",
      data: consumoEnergia,
    backgroundColor: consumoEnergia.map((v: number) =>
  v <= metaMensualEnergia
          ? "#facc15"   // amarillo (cumple)
          : "#f97316"   // naranja fuerte (se pasa)
      ),
      borderRadius: 6,
      barThickness: 14,
    },
  ],
};

const exportarDashboardExcel = () => {
  /* ======================
     HOJA 1: DASHBOARD
  ====================== */
  const hojaDashboard = [
    ["Año", anio],
    [],
    ["Indicador", "Valor", "Unidad"],
    ["Consumo total de agua", datosAnuales[anio].aguaTotal, "Litros"],
    ["Consumo total de energía", datosAnuales[anio].energiaTotal, "kWh"],
    ["Promedio diario agua", datosAnuales[anio].promedioAgua, "L/día"],
    ["Promedio diario energía", datosAnuales[anio].promedioEnergia, "kWh/día"],
    ["Meta anual agua", metaAgua, "Litros"],
    ["Meta anual energía", metaEnergia, "kWh"],
  ];

  /* ======================
     HOJA 2: AGUA
  ====================== */
const hojaAgua = [
  ["Mes", "Día", "Total Bodega 2", "Total Bodega 4", "Total Día"],
];

Object.entries(lecturasAgua).forEach(([mes, dias]: any) => {
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


  /* ======================
     HOJA 3: ENERGÍA
  ====================== */
 const hojaEnergia = [
  ["Mes", "Día", "Consumo", "Total Día"],
];

Object.entries(lecturasEnergia).forEach(([mes, dias]: any) => {
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


  /* ======================
     CREAR EXCEL
  ====================== */
  const wb = XLSX.utils.book_new();

  const wsDashboard = XLSX.utils.aoa_to_sheet(hojaDashboard);
  const wsAgua = XLSX.utils.aoa_to_sheet(hojaAgua);
  const wsEnergia = XLSX.utils.aoa_to_sheet(hojaEnergia);

  XLSX.utils.book_append_sheet(wb, wsDashboard, "Dashboard");
  XLSX.utils.book_append_sheet(wb, wsAgua, "Agua");
  XLSX.utils.book_append_sheet(wb, wsEnergia, "Energía");

  XLSX.writeFile(wb, `Dashboard_Consumos_${anio}.xlsx`);
  
};





  /* ==============================
     RENDER
  ============================== */
  return (
    <div className={`w-full min-h-screen p-6 ${colores.fondo}`}>

     {/* === TOOLBAR SUPERIOR === */}
<div
  className={`
    w-full flex flex-col md:flex-row
    md:items-center md:justify-between
    gap-4 mb-8 p-4 rounded-xl
    border
    ${modoNoche
      ? "bg-[#0d0d0d] border-gray-700"
      : "bg-gray-50 border-gray-200"}
  `}
>
  {/* === SELECTOR DE AÑO === */}
  <div className="flex items-center gap-3">
    <span
      className={`
        text-sm font-medium
        ${modoNoche ? "text-gray-300" : "text-gray-700"}
      `}
    >
      Año en análisis
    </span>

    <select
      value={anio}
      onChange={(e) => setAnio(parseInt(e.target.value))}
      className={`
        px-4 py-2 rounded-lg border text-sm font-semibold cursor-pointer
        ${modoNoche
          ? "bg-[#151515] border-gray-600 text-white"
          : "bg-white border-gray-300 text-black"}
        focus:ring-2 focus:ring-emerald-500 outline-none
      `}
    >
      {Object.keys(datosAnuales).map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  </div>

  {/* === ACCIONES === */}
  <div className="flex items-center gap-3">
    <button
      onClick={exportarDashboardExcel}
      className="
        px-5 py-2.5 rounded-lg text-sm font-semibold
        bg-emerald-600 hover:bg-emerald-700
        text-white
        shadow-md
        flex items-center gap-2
        transition
      "
    >
      📊 Exportar a Excel
    </button>
  </div>
</div>


      {/* TARJETAS SUPERIORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {/* AGUA */}
        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder} min-h-[180px]`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-bold text-lg ${textColor}`}>Consumo Anual Agua</h3>
            <div className={`p-3 rounded-full ${modoNoche ? "bg-blue-900/40" : "bg-blue-100"}`}>
              <FaWater className="text-blue-400 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-400">
            {datosAnuales[anio].aguaTotal.toLocaleString()} L
          </p>
          <span className={`text-sm ${textSoft}`}>Total del año</span>
        </div>

        {/* ENERGÍA */}
        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder} min-h-[180px]`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-bold text-lg ${textColor}`}>Consumo Anual Energia</h3>
            <div className={`p-3 rounded-full ${modoNoche ? "bg-yellow-900/40" : "bg-yellow-100"}`}>
              <FaBolt className="text-yellow-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {datosAnuales[anio].energiaTotal.toLocaleString()} kWh
          </p>
          <span className={`text-sm ${textSoft}`}>Total del año</span>
        </div>

        {/* PROMEDIO AGUA */}
        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder} min-h-[180px]`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-bold text-lg ${textColor}`}>Promedio Diario Agua</h3>
            <div className={`p-3 rounded-full ${modoNoche ? "bg-green-900/40" : "bg-green-100"}`}>
              <FaChartLine className="text-green-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-500">
            {datosAnuales[anio].promedioAgua}
          </p>
          <span className={`text-sm ${textSoft}`}>L / día</span>
        </div>

        {/* PROMEDIO ENERGÍA */}
        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder} min-h-[180px]`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-bold text-lg ${textColor}`}>Promedio Diario Energía</h3>
            <div className={`p-3 rounded-full ${modoNoche ? "bg-red-900/40" : "bg-red-100"}`}>
              <FaClipboardList className="text-red-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-500">
            {datosAnuales[anio].promedioEnergia}
          </p>
          <span className={`text-sm ${textSoft}`}>kWh / día</span>
        </div>
      </div>

      {/* BARRAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
            <FaTint className="text-blue-500" /> Consumo mensual de Agua
          </h3>
          <Bar data={dataAgua} options={opcionesBarras} />
        </div>

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
            <FaLightbulb className="text-yellow-500" /> Consumo mensual de Energía
          </h3>
          <Bar data={dataEnergia} options={opcionesBarras} />
        </div>
      </div>

      {/* ÁREAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
            <FaWater className="text-blue-500" /> Total Meta de Agua
          </h3>
          <Line data={dataAreaAgua} options={opcionesArea} />
        </div>

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
            <FaBolt className="text-yellow-500" /> Total Meta de Energía
          </h3>
          <Line data={dataAreaEnergia} options={opcionesArea} />
        </div>
      </div>

     


{/* === DIFERENCIA VS META · MENSUAL === */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 mt-10">

  {/* ================= AGUA ================= */}
  <div
    className={`
      p-4 sm:p-6 lg:p-8
      rounded-xl shadow-lg border
      ${cardBg} ${cardBorder}
    `}
  >
    <h4
      className={`
        text-sm sm:text-base font-semibold
        mb-4 sm:mb-6
        flex items-center gap-2
        ${textSoft}
      `}
    >
      <FaWater className="text-blue-500 text-base sm:text-lg" />
      Diferencia vs Meta · Agua (Mensual)
    </h4>

    <div className="h-[260px] sm:h-[300px] lg:h-[360px]">
      <Bar
        data={dataDiferenciaAguaMensual}
        options={{
          ...opcionesBarras,
          maintainAspectRatio: false,
        }}
      />
    </div>
  </div>

  {/* ================= ENERGÍA ================= */}
  <div
    className={`
      p-4 sm:p-6 lg:p-8
      rounded-xl shadow-lg border
      ${cardBg} ${cardBorder}
    `}
  >
    <h4
      className={`
        text-sm sm:text-base font-semibold
        mb-4 sm:mb-6
        flex items-center gap-2
        ${textSoft}
      `}
    >
      <FaBolt className="text-yellow-500 text-base sm:text-lg" />
      Diferencia vs Meta · Energía (Mensual)
    </h4>

    <div className="h-[260px] sm:h-[300px] lg:h-[360px]">
      <Bar
        data={dataDiferenciaEnergiaMensual}
        options={{
          ...opcionesBarras,
          maintainAspectRatio: false,
        }}
      />
    </div>
  </div>



</div>


    </div>
    
    
  );

};


export default DashboardInicio;

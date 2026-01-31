"use client";

import {Chart as ChartJS,ArcElement,BarElement,CategoryScale,LinearScale,PointElement,LineElement,Tooltip,Legend} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { FC, useState, useEffect } from "react";
import { exportarDashboardExcel } from "../../utils/exportadorgeneral";
import {FaWater,FaBolt,FaChartLine,FaClipboardList,FaTint,FaLightbulb,} from "react-icons/fa";
import { exportarDashboardPDF } from "../../utils/exportadorDashboardPDF";

ChartJS.register(ArcElement,BarElement,CategoryScale,LinearScale,PointElement,LineElement,Tooltip,Legend);

interface Props {
  modoNoche: boolean;
}

const calcularConsumoMensual = (lecturas: any) => {
  const meses = Array(12).fill(0);

  Object.entries(lecturas).forEach(([mes, dias]: any) => {
    Object.values(dias).forEach((d: any) => {
      meses[Number(mes)] += (d.total2 || 0) + (d.total4 || 0);
    });
  });

  return meses.map(v => Number(v.toFixed(2)));
};

const totalAnual = (lecturas: any) =>
  Object.values(lecturas).reduce((acc: number, dias: any) => {
    return (
      acc +
      Object.values(dias).reduce(
        (s: number, d: any) => s + d.total2 + d.total4,
        0
      )
    );
  }, 0);

  
const promedioDiario = (lecturas: any) => {
  let total = 0;
  let dias = 0;

  Object.values(lecturas).forEach((mes: any) => {
    Object.values(mes).forEach((d: any) => {
      const t = d.total2 + d.total4;
      if (t > 0) {
        total += t;
        dias++;
      }
    });
  });

  return dias ? Number((total / dias).toFixed(2)) : 0;
};

const DashboardInicio: FC<Props> = ({ modoNoche }) => {

  /* ==============================
     MESES
  ============================== */
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [lecturasAgua, setLecturasAgua] = useState({});
  const [lecturasEnergia, setLecturasEnergia] = useState({});
  // 🔌 ENERGÍA (DESDE BD)
  const consumoEnergiaMensual = calcularConsumoMensual(lecturasEnergia);
  const totalEnergiaAnual = totalAnual(lecturasEnergia);
  const promedioEnergiaReal = promedioDiario(lecturasEnergia);
  // 🔌 AGUA (si luego haces lo mismo)
  const consumoAguaMensual = calcularConsumoMensual(lecturasAgua);
  const totalAguaAnual = totalAnual(lecturasAgua);
  const promedioAguaReal = promedioDiario(lecturasAgua);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);

  const [metaAgua, setMetaAgua] = useState(0);
  const [metaEnergia, setMetaEnergia] = useState(0);
  const [metaMensualAgua, setMetaMensualAgua] = useState(0);
  const [metaMensualEnergia, setMetaMensualEnergia] = useState(0);
  const [metasAguaMensual, setMetasAguaMensual] = useState<number[]>(Array(12).fill(0));
  const [metasEnergiaMensual, setMetasEnergiaMensual] = useState<number[]>(Array(12).fill(0));
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
      x: { ticks: { color: textSoft }, grid: { display: false } },
      y: { ticks: { color: textSoft }, grid: { color: modoNoche ? "#2a2a2a" : "#e5e7eb" } },
    }
  };

  const opcionesBarras = {
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
      x: { ticks: { color: textSoft }, grid: { display: false } },
      y: { ticks: { color: textSoft }, grid: { color: modoNoche ? "#2a2a2a" : "#e5e7eb" } },
    },
  };

  /* ==============================
     DATOS DE LAS GRÁFICAS
  ============================== */
  const dataAgua = {
    labels: meses,
    datasets: [{
      label: "Consumo Agua (L)",
      data: consumoAguaMensual,
      backgroundColor: colores.agua,
      borderRadius: 10,
    }],
  };

  const dataEnergia = {
    labels: meses,
    datasets: [{
      label: "Consumo Energía (kWh)",
      data: consumoEnergiaMensual,
      backgroundColor: colores.energia,
      borderRadius: 10,
    }],
  };

  const dataAreaAgua = {
    labels: meses,
    datasets: [{
      label: "Agua total (L)",
      data: consumoAguaMensual,
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
      data: consumoEnergiaMensual,
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

        data: [totalAguaAnual],
        backgroundColor: colores.agua,
        barThickness: 12,
        borderRadius: 10,
      },
    ],
  };

  useEffect(() => {
    const cargarEnergia = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/energia");
        const data = await res.json();

        const estructurado: any = {};
        const aniosSet = new Set<number>();

        data.forEach((item: any) => {
          const fecha = new Date(item.fecha + "T00:00:00");
          const year = fecha.getFullYear();
          aniosSet.add(year);

          if (year !== anio) return;

          const mes = fecha.getMonth();
          const dia = fecha.getDate();

          if (!estructurado[mes]) estructurado[mes] = {};
          estructurado[mes][dia] = {
            total2: item.total_bodega1,
            total4: item.total_bodega2,
          };
        });

        setLecturasEnergia(estructurado);
        setAniosDisponibles((prev) =>
          Array.from(new Set([...prev, ...Array.from(aniosSet)])).sort()
        );
      } catch (error) {
        console.error("Error cargando energía", error);
      }
    };

    cargarEnergia();
  }, [anio]);

  useEffect(() => {
    const cargarMetas = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/metas/${anio}`);
        const data = await res.json();

        const agua = Array(12).fill(0);
        const energia = Array(12).fill(0);

        // 🔵 AGUA
        if (data?.agua?.meta_mensual) {
          agua.fill(Number(data.agua.meta_mensual));
        }

        // 🟡 ENERGÍA
        if (data?.energia?.meta_mensual) {
          energia.fill(Number(data.energia.meta_mensual));
        }

        setMetasAguaMensual(agua);
        setMetasEnergiaMensual(energia);

        setMetaAgua(data?.agua?.meta_mensual ?? 0);
        setMetaEnergia(data?.energia?.meta_mensual ?? 0);

      } catch (error) {
        console.error("Error cargando metas", error);
        setMetasAguaMensual(Array(12).fill(0));
        setMetasEnergiaMensual(Array(12).fill(0));
      }
    };

    cargarMetas();
  }, [anio]);




  useEffect(() => {
    const cargarAgua = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/agua");
        const data = await res.json();

        const estructurado: any = {};
        const aniosSet = new Set<number>();

        data.forEach((item: any) => {
          const fecha = new Date(item.fecha + "T00:00:00");
          const year = fecha.getFullYear();

          aniosSet.add(year);

          if (year !== anio) return;

          const mes = fecha.getMonth();
          const dia = fecha.getDate();

          if (!estructurado[mes]) estructurado[mes] = {};

          estructurado[mes][dia] = {
            total2: item.total_bodega1,
            total4: item.total_bodega2,
          };
        });

        setAniosDisponibles((prev) =>
          Array.from(new Set([...prev, ...Array.from(aniosSet)])).sort()
        );

        setLecturasAgua(estructurado);
      } catch (error) {
        console.error("Error cargando agua", error);
      }
    };

    cargarAgua();
  }, [anio]);




  const dataDiferenciaAguaMensual = {
    labels: meses,
    datasets: [
      {
        label: "Meta mensual",
        data: metasAguaMensual,
        backgroundColor: "#e5e7eb",
        borderRadius: 6,
        barThickness: 14,
      },
      {
        label: "Consumo real",
        data: consumoAguaMensual,
        backgroundColor: consumoAguaMensual.map((v, i) =>
          v <= metasAguaMensual[i] ? "#38bdf8" : "#ef4444"
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
        label: "Meta mensual (kWh)",
        data: metasEnergiaMensual,
        backgroundColor: modoNoche ? "#334155" : "#e5e7eb",
        borderRadius: 6,
        barThickness: 14,
      },
      {
        label: "Consumo real (kWh)",
        data: consumoEnergiaMensual,
        backgroundColor: consumoEnergiaMensual.map((v, i) =>
          metasEnergiaMensual[i] === 0
            ? "#94a3b8" // sin meta
            : v <= metasEnergiaMensual[i]
              ? "#facc15" // dentro de meta
              : "#f97316" // excedido
        ),
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };


  const handleExportarExcel = () => {
    exportarDashboardExcel({
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
    });
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
    border backdrop-blur-md
    ${modoNoche
      ? "bg-white/10 border-white/20 text-white"
      : "bg-gray-50 border-gray-200 text-black"}
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
                ? "bg-[#151515] border-gray-100 text-white"
                : "bg-white border-gray-300 text-black"}
        focus:ring-2 focus:ring-emerald-500 outline-none
      `}
          >

            {aniosDisponibles.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* === ACCIONES === */}
        <div className="flex items-center gap-3">
        <button
  onClick={() =>
    exportarDashboardPDF({
      anio,
      meses,
      consumoAguaMensual,
      consumoEnergiaMensual,
      totalAguaAnual,
      totalEnergiaAnual,
      promedioAguaReal,
      promedioEnergiaReal,
      metaAgua,
      metaEnergia,
    })
  }
  className="px-5 py-2.5 rounded-lg text-sm font-semibold
    bg-red-600 hover:bg-red-700
    text-white shadow-md flex items-center gap-2"
>
  📄 Exportar PDF
</button>


          <button
            onClick={handleExportarExcel}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold
             bg-emerald-600 hover:bg-emerald-700
             text-white shadow-md flex items-center gap-2"
          >
            📊 Exportar a Excel
          </button>
           {/* PDF */}

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
            {totalAguaAnual.toLocaleString()}
            L
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
            {totalEnergiaAnual.toLocaleString()}
            kWh
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
            {promedioAguaReal}

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
            {promedioEnergiaReal}

          </p>
          <span className={`text-sm ${textSoft}`}>kWh / día</span>
        </div>
      </div>

      {/* BARRAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
         <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
  <FaTint className="text-blue-500" />
  Consumo mensual de Agua
  <span className="ml-2 text-sm font-semibold text-blue-400">
    (Meta: {metaAgua || 0} L)
  </span>
</h3>

          <Bar data={dataAgua} options={opcionesBarras} />
        </div>

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
         <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
  <FaLightbulb className="text-yellow-500" />
  Consumo mensual de Energía
  <span className="ml-2 text-sm font-semibold text-yellow-400">
    (Meta: {metaEnergia || 0} kWh)
  </span>
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

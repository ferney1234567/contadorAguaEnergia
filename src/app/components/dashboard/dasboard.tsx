"use client";

import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { FC, useState, useEffect } from "react";
import { exportarDashboardExcel } from "../../utils/exportadorgeneral";
import { FaWater, FaBolt, FaChartLine, FaClipboardList, FaTint, FaLightbulb, } from "react-icons/fa";
import { exportarDashboardPDF } from "../../utils/exportadorDashboardPDF";
import { Doughnut } from "react-chartjs-2";
import { FileText, Printer } from "lucide-react";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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

const obtenerColorAguaPorRango = (valor: number) => {
  if (valor <= 54) return "#0000CC"; // azul
  if (valor <= 59) return "#3E6102 "; // verde
  if (valor <= 64) return "#facc15"; // amarillo
  return "#ef4444"; // rojo
};

const obtenerColorEnergiaPorRango = (valor: number) => {
  if (valor <= 1514) return "#0000CC"; // 🔵 Azul
  if (valor <= 1683) return "#3E6102 "; // 🟢 Verde
  if (valor <= 1852) return "#facc15"; // 🟡 Amarillo
  return "#ef4444"; // 🔴 Rojo
};


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
  const [comparativoEnergia, setComparativoEnergia] = useState<number[]>(Array(12).fill(0));
  const [comparativoAgua, setComparativoAgua] = useState<number[]>(Array(12).fill(0));
  const [resmasMensual, setResmasMensual] = useState<number[]>(Array(12).fill(0));
  const [tonnerMensual, setTonnerMensual] = useState<number[]>(Array(12).fill(0));
  const totalResmas = resmasMensual.reduce((a, b) => a + b, 0);
  const totalTonner = tonnerMensual.reduce((a, b) => a + b, 0);
  const [valoresAgua, setValoresAgua] = useState<number[]>(Array(12).fill(0));
  const [valoresEnergia, setValoresEnergia] = useState<number[]>(Array(12).fill(0));

  const anioActual = new Date().getFullYear();
  const totalAguaComparativo = comparativoAgua.reduce((a, b) => a + b, 0)
  const totalEnergiaComparativo = comparativoEnergia.reduce((a, b) => a + b, 0)

  /* ==============================
     PALETA
  ============================== */
  const cardBg = modoNoche ? "bg-[#1e1e1e]" : "bg-white";
  const cardBorder = modoNoche ? "border-[#3a3a3a]" : "border-gray-200";
  const textColor = modoNoche ? "#ffffff" : "#111827"; // blanco / negro
  const textSoft = modoNoche ? "#d1d5db" : "#4b5563"; // gris claro / gris oscuro


  const colores = {
    agua: "#0000CC ",
    aguaGradient: "rgba(14,165,233,0.25)",
    energia: "#f59e0b",
    energiaGradient: "rgba(245,158,11,0.25)",
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-white text-black"
  };

  const coloresMeses = [
    "#0000CC ", // Ene
    "#0ea5e9", // Feb
    "#22c55e", // Mar
    "#84cc16", // Abr
    "#eab308", // May
    "#f59e0b", // Jun
    "#f97316", // Jul
    "#ef4444", // Ago
    "#ec4899", // Sep
    "#a855f7", // Oct
    "#6366f1", // Nov
    "#14b8a6"  // Dic
  ];

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
    datasets: [
      {
        label: "Consumo Agua (L)",
        data: consumoAguaMensual,
        backgroundColor: consumoAguaMensual.map((valor) => {
          if (valor <= 54) {
            return "#0000CC "; // 🔵 Azul (bien)
          }

          if (valor <= 59) {
            return "#005200 "; // 🟢 Verde (normal)
          }

          if (valor <= 64) {
            return "#facc15"; // 🟡 Amarillo (alerta)
          }

          return "#C40000"; // 🔴 Rojo (alto consumo)
        }),
        borderRadius: 10,
      },
    ],
  };

  const dataEnergia = {
    labels: meses,
    datasets: [
      {
        label: "Consumo Energía (kWh)",
        data: consumoEnergiaMensual,
        backgroundColor: consumoEnergiaMensual.map((valor) => {
          if (valor <= 1514) {
            return "#0000CC "; // 🔵 Azul (óptimo)
          }

          if (valor <= 1683) {
            return "#005200 "; // 🟢 Verde (normal)
          }

          if (valor <= 1852) {
            return "#facc15"; // 🟡 Amarillo (alerta)
          }

          return "#C40000"; // 🔴 Rojo (crítico)
        }),
        borderRadius: 10,
      },
    ],
  };

  const dataAreaAgua = {
    labels: meses,
    datasets: [
      // 🔵 CONSUMO REAL
      {
        label: "Consumo Agua (L)",
        data: consumoAguaMensual,
        borderColor: colores.agua,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

          // 🔥 usa el último valor (mes actual o último con datos)
          const ultimoValor = consumoAguaMensual.findLast(v => v > 0) || 0;

          let color = "#0000CC "; // default azul

          if (ultimoValor <= 54) color = "#3b82f6"; // azul
          else if (ultimoValor <= 59) color = "#005200"; // verde
          else if (ultimoValor <= 64) color = "#efb810"; // amarillo
          else color = "#C40000"; // rojo

          gradient.addColorStop(0, color + "80"); // arriba fuerte
          gradient.addColorStop(1, color + "05"); // abajo suave

          return gradient;
        },
        tension: 0.4,
        fill: true,

        pointRadius: 5,
        pointHoverRadius: 7,

        // 🔥 COLORES POR RANGO
        pointBackgroundColor: consumoAguaMensual.map((v) => {
          if (v <= 54) {
            return "#0000CC "; // 🔵 Azul
          }

          if (v <= 59) {
            return "#005200"; // 🟢 Verde
          }

          if (v <= 64) {
            return "#facc15"; // 🟡 Amarillo
          }

          return "#C40000"; // 🔴 Rojo
        }),

        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },

      // ⚫ META
      {
        label: "Meta Agua",
        data: metasAguaMensual,
        borderColor: "#64748b",
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 3,
        pointBackgroundColor: "#64748b",
        fill: false,
      },
    ],
  };

  const dataAreaEnergia = {
    labels: meses,
    datasets: [
      // ⚡ CONSUMO REAL
      {
        label: "Consumo Energía (kWh)",
        data: consumoEnergiaMensual,
        borderColor: colores.energia,

        // 🔥 GRADIENTE DINÁMICO
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

          const ultimoValor = consumoEnergiaMensual.findLast(v => v > 0) || 0;

          let color = "#0000CC ";

          if (ultimoValor <= 1514) color = "#3b82f6"; // 🔵 Azul
          else if (ultimoValor <= 1683) color = "#005200"; // 🟢 Verde
          else if (ultimoValor <= 1852) color = "#facc15"; // 🟡 Amarillo
          else color = "#C40000"; // 🔴 Rojo

          gradient.addColorStop(0, color + "80");
          gradient.addColorStop(1, color + "05");

          return gradient;
        },

        tension: 0.4,
        fill: true,

        pointRadius: 5,
        pointHoverRadius: 7,

        // 🔥 PUNTOS POR RANGO
        pointBackgroundColor: consumoEnergiaMensual.map((v) => {
          if (v <= 1514) return "#3b82f6"; // 🔵 Azul
          if (v <= 1683) return "#005200"; // 🟢 Verde
          if (v <= 1852) return "#facc15"; // 🟡 Amarillo
          return "#C40000"; // 🔴 Rojo
        }),

        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },

      // ⚫ META
      {
        label: "Meta Energía",
        data: metasEnergiaMensual,
        borderColor: "#64748b",
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 3,
        pointBackgroundColor: "#64748b",
        fill: false,
      },
    ],
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
    const cargarComparativoEnergia = async () => {
      try {
        const res = await fetch("/api/comparativoEnergia/");
        const data = await res.json();

        const mesesEnergia = new Array(12).fill(0);
        const valoresEnergiaTemp = new Array(12).fill(0);

        data.forEach((item: any) => {
          if (Number(item.anio) === Number(anio)) {
            const mesIndex = Number(item.mes) - 1;

            if (mesIndex >= 0 && mesIndex < 12) {
              mesesEnergia[mesIndex] += Number(item.kw_consumidos || 0);
              valoresEnergiaTemp[mesIndex] += Number(item.valor_consumo_energia || 0);
            }
          }
        });

        setComparativoEnergia(mesesEnergia);
        setValoresEnergia(valoresEnergiaTemp);
      } catch (error) {
        console.error("Error cargando comparativo energia", error);
      }
    };

    cargarComparativoEnergia();
  }, [anio]);


  useEffect(() => {
    const cargarComparativoAgua = async () => {
      try {
        const res = await fetch("/api/comparativoAgua/");
        const data = await res.json();

        const mesesAgua = new Array(12).fill(0);
        const valoresAguaTemp = new Array(12).fill(0);

        data.forEach((item: any) => {
          if (Number(item.anio) === Number(anio)) {
            const mesIndex = Number(item.mes) - 1;

            if (mesIndex >= 0 && mesIndex < 12) {
              mesesAgua[mesIndex] += Number(item.m3_consumidos || 0);
              valoresAguaTemp[mesIndex] += Number(item.valor_consumo_agua || 0);
            }
          }
        });

        setComparativoAgua(mesesAgua);
        setValoresAgua(valoresAguaTemp);
      } catch (error) {
        console.error("Error cargando comparativo agua", error);
      }
    };

    cargarComparativoAgua();
  }, [anio]);

  useEffect(() => {
    const cargarEnergia = async () => {
      try {
        const res = await fetch("/api/energia", { cache: "no-store" });
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
    const cargarMetasMensuales = async () => {
      const agua = [];
      const energia = [];

      for (let mes = 1; mes <= 12; mes++) {
        // 💧 Agua
        const resAgua = await fetch(
          `/api/metas?tipo=agua&anio=${anio}&mes=${mes}`, { cache: "no-store" }
        );
        const dataAgua = await resAgua.json();
        agua.push(dataAgua?.meta ?? 0);

        // ⚡ Energía
        const resEnergia = await fetch(
          `/api/metas?tipo=energia&anio=${anio}&mes=${mes}`, { cache: "no-store" }
        );
        const dataEnergia = await resEnergia.json();
        energia.push(dataEnergia?.meta ?? 0);
      }

      setMetasAguaMensual(agua);
      setMetasEnergiaMensual(energia);

      // 👉 meta actual = mes actual
      const mesActual = new Date().getMonth();
      setMetaAgua(agua[mesActual] ?? 0);
      setMetaEnergia(energia[mesActual] ?? 0);
    };

    cargarMetasMensuales();
  }, [anio]);





  useEffect(() => {
    const cargarAgua = async () => {
      try {
        const res = await fetch("/api/agua", { cache: "no-store" });
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


  useEffect(() => {
    const cargarResmas = async () => {
      try {
        const res = await fetch("/api/resmas");
        const data = await res.json();

        const meses = Array(12).fill(0);

        data.forEach((item: any) => {
          if (Number(item.anio) === Number(anio)) {
            const mesIndex = Number(item.mes) - 1;
            meses[mesIndex] += Number(item.cantidad || 0);
          }
        });

        setResmasMensual(meses);
      } catch (error) {
        console.error("Error resmas", error);
      }
    };

    const cargarTonner = async () => {
      try {
        const res = await fetch("/api/tonners");
        const data = await res.json();

        const meses = Array(12).fill(0);

        data.forEach((item: any) => {
          const fecha = new Date(item.fecha);
          if (fecha.getFullYear() === anio) {
            const mesIndex = fecha.getMonth();
            meses[mesIndex] += Number(item.cantidad || 0);
          }
        });

        setTonnerMensual(meses);
      } catch (error) {
        console.error("Error tonner", error);
      }
    };

    cargarResmas();
    cargarTonner();
  }, [anio]);


  const dataResmas = {
    labels: meses,
    datasets: [
      {
        label: "Consumo de papel (resmas)",
        data: resmasMensual,

        borderColor: "#22c55e",
        borderWidth: 3,

        fill: true,
        tension: 0.5,

        // 🔥 GRADIENTE
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return;

          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(34,197,94,0.6)");
          gradient.addColorStop(1, "rgba(34,197,94,0.05)");

          return gradient;
        },

        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,

        // 🔥 SOMBRA
        segment: {
          borderColor: (ctx: any) => {
            return ctx.p0.parsed.y > ctx.p1.parsed.y
              ? "#16a34a"
              : "#22c55e";
          }
        }
      },
    ],
  };

  const dataTonner = {
    labels: meses,
    datasets: [
      {
        label: "Uso de tonner",
        data: tonnerMensual,

        borderRadius: 12,
        borderSkipped: false,

        // 🔥 COLORES DINÁMICOS
        backgroundColor: tonnerMensual.map((v) => {
          if (v <= 10) return "#3b82f6";
          if (v <= 20) return "#22c55e";
          if (v <= 30) return "#facc15";
          return "#ef4444";
        }),

        borderColor: "#1d4ed8",
        borderWidth: 2,

        hoverBackgroundColor: "#60a5fa",
      },
    ],
  };
  const opcionesRadar = {
    responsive: true,
    scales: {
      r: {
        ticks: {
          color: modoNoche ? "#ccc" : "#444",
        },
        grid: {
          color: modoNoche ? "#333" : "#ddd",
        },
      },
    },
    plugins: {
      legend: {
        labels: { color: modoNoche ? "#fff" : "#000" },
      },
    },
  };




  const dataDiferenciaAguaMensual = {
    labels: meses,
    datasets: [
      {
        label: "Meta mensual",
        data: metasAguaMensual,
        backgroundColor: modoNoche ? "#334155" : "#e5e7eb",
        borderRadius: 6,
        barThickness: 14,
      },
      {
        label: "Consumo real",
        data: consumoAguaMensual,
        backgroundColor: consumoAguaMensual.map((v) => {
          if (v <= 54) {
            return "#0000CC"; // 🔵 Azul
          }

          if (v <= 59) {
            return "#005200"; // 🟢 Verde
          }

          if (v <= 64) {
            return "#facc15"; // 🟡 Amarillo
          }

          return "#C40000"; // 🔴 Rojo
        }),
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
        backgroundColor: consumoEnergiaMensual.map((v) => {
          if (v <= 1514) {
            return "#0000CC"; // 🔵 Azul (óptimo)
          }

          if (v <= 1683) {
            return "#005200"; // 🟢 Verde (normal)
          }

          if (v <= 1852) {
            return "#facc15"; // 🟡 Amarillo (alerta)
          }

          return "#C40000"; // 🔴 Rojo (alto consumo)
        }),
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


            {Array.from({ length: 10 }, (_, i) => anioActual - 2 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* === ACCIONES === */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open("https://drive.google.com/drive/u/0/folders/1JJ3SAsGBkipUVOdvQMjJ4n3RxaMXIS5q", "_blank")}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold
  bg-blue-600 hover:bg-blue-700
  text-white shadow-md flex items-center gap-2"
          >
            
            ☁️ Ir a Drive
          </button>
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
              <FaChartLine className="text-blue-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-700">
            {promedioAguaReal}

          </p>
          <span className={`text-sm ${textSoft}`}>L / día</span>
        </div>

        {/* PROMEDIO ENERGÍA */}
        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder} min-h-[180px]`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-bold text-lg ${textColor}`}>Promedio Diario Energía</h3>
            <div className={`p-3 rounded-full ${modoNoche ? "bg-red-900/40" : "bg-red-100"}`}>
              <FaClipboardList className="text-orange-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-500">
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

          {/* 🔥 LEYENDA SEMÁFORO */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold">

            <div className="flex items-center gap-2">
              <div className="w-10 h-3 rounded bg-[#0000CC]"></div>
              <span className={textColor}>Óptimo (0 - 54)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-3 rounded bg-[#3E6102]"></div>
              <span className={textColor}>Normal (55 - 59)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-3 rounded bg-[#facc15]"></div>
              <span className={textColor}>Alerta (60 - 64)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-3 rounded bg-[#ef4444]"></div>
              <span className={textColor}>Crítico (65+)</span>
            </div>

          </div>

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

          {/* 🔥 LEYENDA SEMÁFORO ENERGÍA */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold">

            <div className="flex items-center gap-2">
              <div className="w-12 h-3 rounded-full bg-[#0000CC]"></div>
              <span className={textColor}>Óptimo (0-1514)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-3 rounded-full bg-[#3E6102]"></div>
              <span className={textColor}>Normal (1515-1683)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-3 rounded-full bg-[#facc15]"></div>
              <span className={textColor}>Alerta (1684-1852)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-12 h-3 rounded-full bg-[#ef4444]"></div>
              <span className={textColor}>Crítico (1853+)</span>
            </div>

          </div>

          {/* 📊 GRÁFICA */}
          <Bar data={dataEnergia} options={opcionesBarras} />

        </div>
      </div>


      {/* ÁREAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
            <FaWater className="text-blue-500" /> Total Meta de Agua
            <span className="ml-2 text-sm font-semibold text-blue-400">
              (Meta: {metaAgua || 0} L)
            </span>
          </h3>
          <Line data={dataAreaAgua} options={opcionesArea} />
        </div>

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${textColor}`}>
            <FaBolt className="text-yellow-500" /> Total Meta de Energía
            <span className="ml-2 text-sm font-semibold text-yellow-400">
              (Meta: {metaEnergia || 0} kWh)
            </span>
          </h3>
          <Line data={dataAreaEnergia} options={opcionesArea} />
        </div>
      </div>





      {/* === DIFERENCIA VS META · MENSUAL === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 mt-10">

        {/* AGUA */}
        <div className={`p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h4 className={`text-sm sm:text-base font-semibold mb-4 sm:mb-6 flex items-center gap-2 ${textSoft}`}>
            <FaWater className="text-blue-500 text-base sm:text-lg" />
            Diferencia vs Meta · Agua (Mensual)
          </h4>

          <div className="h-[320px] lg:h-[380px]">
            <Bar
              data={dataDiferenciaAguaMensual}
              options={{ ...opcionesBarras, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* ENERGÍA */}
        <div className={`p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>
          <h4 className={`text-sm sm:text-base font-semibold mb-4 sm:mb-6 flex items-center gap-2 ${textSoft}`}>
            <FaBolt className="text-yellow-500 text-base sm:text-lg" />
            Diferencia vs Meta · Energía (Mensual)
          </h4>

          <div className="h-[320px] lg:h-[380px]">
            <Bar
              data={dataDiferenciaEnergiaMensual}
              options={{ ...opcionesBarras, maintainAspectRatio: false }}
            />
          </div>
        </div>

      </div>

      {/* ================= COMPARATIVO ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

        {/* ================= AGUA ================= */}

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>

          <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${textColor}`}>
            <FaTint className="text-blue-500" />
            Comparativo de Agua por Mes PDS
          </h3>

          {/* LEYENDA DE MESES */}
          <div className="grid grid-cols-6 gap-3 mb-6">

            {meses.map((mes, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">

                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: coloresMeses[i] }}
                />

                <span style={{ color: textColor }}>
                  {mes}
                </span>

              </div>
            ))}

          </div>

          {/* GRAFICA */}

          <div className="flex justify-center items-center h-[320px]">

            <div className="relative w-[320px] h-[320px]">

              <Doughnut
                data={{
                  labels: meses,
                  datasets: [
                    {
                      label: "Consumo Agua",
                      data: comparativoAgua.map(v => v || 0.0001),
                      backgroundColor: coloresMeses,
                      borderWidth: 3,
                      borderColor: "#ffffff",
                      hoverOffset: 15
                    }
                  ]
                }}

                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "55%",
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => {
                          const i = context.dataIndex;

                          return [
                            `Mes: ${context.label}`,
                            `Consumo: ${comparativoAgua[i]} m³`,
                            `Valor: $${valoresAgua[i].toLocaleString()}`
                          ];
                        }
                      }
                    }
                  }
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-blue-500">
                  {totalAguaComparativo.toLocaleString()} m³
                </span>

                <span className="text-sm font-semibold text-gray-400">
                  ${valoresAgua.reduce((a, b) => a + b, 0).toLocaleString()}
                </span>

                <span className="text-[11px] text-gray-500">
                  Total consumo / total a pagar
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ================= ENERGIA ================= */}

        <div className={`p-6 rounded-xl shadow-lg border ${cardBg} ${cardBorder}`}>

          <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${textColor}`}>
            <FaLightbulb className="text-yellow-500" />
            Comparativo de Energía por Mes PDS
          </h3>

          {/* LEYENDA MESES */}

          <div className="grid grid-cols-6 gap-3 mb-6">

            {meses.map((mes, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold">

                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: coloresMeses[i] }}
                />

                <span style={{ color: textColor }}>
                  {mes}
                </span>

              </div>
            ))}

          </div>

          {/* GRAFICA */}

          <div className="flex justify-center items-center h-[320px]">

            <div className="relative w-[320px] h-[320px]">

              <Doughnut
                data={{
                  labels: meses,
                  datasets: [
                    {
                      label: "Consumo Energía",
                      data: comparativoEnergia.map(v => v || 0.0001),
                      backgroundColor: coloresMeses,
                      borderWidth: 3,
                      borderColor: "#ffffff",
                      hoverOffset: 15
                    }
                  ]
                }}

                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "55%",
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => {
                          const i = context.dataIndex;

                          return [
                            `Mes: ${context.label}`,
                            `Consumo: ${comparativoEnergia[i]} kWh`,
                            `Valor: $${valoresEnergia[i].toLocaleString()}`
                          ];
                        }
                      }
                    }
                  }
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-yellow-500">
                  {totalEnergiaComparativo.toLocaleString()} kWh
                </span>

                <span className="text-sm font-semibold text-gray-400">
                  ${valoresEnergia.reduce((a, b) => a + b, 0).toLocaleString()}
                </span>

                <span className="text-[11px] text-gray-500">
                  Total consumo / total a pagar
                </span>
              </div>

            </div>

          </div>



        </div>



      </div>

      {/* ================= RESMAS Y TONNER ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">

        {/* RESMAS */}
        <div className={`p-6 rounded-2xl shadow-md border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${cardBg} ${cardBorder}`}>

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-green-500/10 shadow-[0_0_12px_rgba(34,197,94,0.4)]">
              <FileText size={20} className="text-green-500" />
            </div>

            <div>
              <h3 className={`font-semibold text-lg tracking-wide ${textColor}`}>
                Consumo de Resmas
              </h3>
              <p className="text-xs opacity-60">
                Control anual de uso de papel
              </p>
            </div>
          </div>

          {/* TOTAL */}
          <div className="mb-6 text-center">
            <p className="text-4xl font-bold text-green-500 tracking-tight">
              {totalResmas.toLocaleString()}
            </p>
            <span className={`text-sm ${textSoft}`}>
              Total anual
            </span>
          </div>

          {/* GRAFICA */}
          <div className="mt-4">
            <Line data={dataResmas} options={opcionesArea} />
          </div>

        </div>


        {/* TONNER */}
        <div className={`p-6 rounded-2xl shadow-md border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${cardBg} ${cardBorder}`}>

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
              <Printer size={20} className="text-blue-500" />
            </div>

            <div>
              <h3 className={`font-semibold text-lg tracking-wide ${textColor}`}>
                Consumo de Tonner
              </h3>
              <p className="text-xs opacity-60">
                Control de impresiones
              </p>
            </div>
          </div>

          {/* TOTAL */}
          <div className="mb-6 text-center">
            <p className="text-4xl font-bold text-blue-500 tracking-tight">
              {totalTonner.toLocaleString()}
            </p>
            <span className={`text-sm ${textSoft}`}>
              Total anual
            </span>
          </div>

          {/* GRAFICA */}
          <div className="mt-4">
            <Bar data={dataTonner} options={opcionesBarras} />
          </div>

        </div>

      </div>

    </div>








  );

};


export default DashboardInicio;
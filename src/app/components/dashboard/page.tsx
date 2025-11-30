"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  FaWater,
  FaBolt,
  FaChartLine,
  FaClipboardList,
  FaTint,
  FaLightbulb,
} from "react-icons/fa";
import { FC } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  modoNoche: boolean;
}

const DashboardInicio: FC<Props> = ({ modoNoche }) => {
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const consumoAgua = [
    900, 850, 880, 920, 950, 970, 930, 910, 880, 900, 940, 960,
  ];
  const consumoEnergia = [
    310, 305, 320, 330, 345, 350, 340, 325, 315, 300, 310, 330,
  ];

  // 🎨 PALETA DE COLORES BIEN DEFINIDA
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-[#ffffff] text-black",
    tarjeta: modoNoche ? "#1e1e1e" : "#ffffff",
    borde: modoNoche ? "#333" : "#e5e7eb",
    texto: modoNoche ? "#ffffff" : "#1f2937",
    textoSec: modoNoche ? "#d1d5db" : "#6b7280",

    agua: "#0ea5e9",
    energia: "#f59e0b",
    peligro: "#dc2626",
    exito: "#10b981",
  };

  const opcionesGrafica = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: colores.texto,
        },
      },
      tooltip: {
        backgroundColor: colores.tarjeta,
        titleColor: colores.texto,
        bodyColor: colores.texto,
        borderColor: colores.borde,
        borderWidth: 1,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        ticks: {
          color: colores.textoSec,
        },
        grid: {
          color: modoNoche ? "#1f2937" : "#e5e7eb",
        },
      },
      y: {
        ticks: {
          color: colores.textoSec,
        },
        grid: {
          color: modoNoche ? "#1f2937" : "#e5e7eb",
        },
      },
    },
  };

  const dataAgua = {
    labels: meses,
    datasets: [
      {
        label: "Consumo Agua (L)",
        data: consumoAgua,
        backgroundColor: colores.agua,
        borderRadius: 10,
      },
    ],
  };

  const dataEnergia = {
    labels: meses,
    datasets: [
      {
        label: "Consumo Energía (kWh)",
        data: consumoEnergia,
        backgroundColor: colores.energia,
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className={`w-full h-full p-6 ${colores.fondo}`}>
      {/* TARJETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Agua */}
        <div
          className="p-6 rounded-xl shadow-lg border transition hover:scale-105"
          style={{ background: colores.tarjeta, borderColor: colores.borde }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Agua</h3>
            <div className="p-3 rounded-full bg-blue-100">
              <FaWater className="text-blue-600 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">12.520 L</p>
          <span className="text-sm opacity-70">Este mes</span>
        </div>

        {/* Energía */}
        <div
          className="p-6 rounded-xl shadow-lg border transition hover:scale-105"
          style={{ background: colores.tarjeta, borderColor: colores.borde }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Energía</h3>
            <div className="p-3 rounded-full bg-yellow-100">
              <FaBolt className="text-yellow-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-500">3.980 kWh</p>
          <span className="text-sm opacity-70">Este mes</span>
        </div>

        {/* Promedio */}
        <div
          className="p-6 rounded-xl shadow-lg border transition hover:scale-105"
          style={{ background: colores.tarjeta, borderColor: colores.borde }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Promedio Diario</h3>
            <div className="p-3 rounded-full bg-green-100">
              <FaChartLine className="text-green-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-500">850</p>
          <span className="text-sm opacity-70">L / kWh promedio</span>
        </div>

        {/* Lecturas */}
        <div
          className="p-6 rounded-xl shadow-lg border transition hover:scale-105"
          style={{ background: colores.tarjeta, borderColor: colores.borde }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Lecturas Totales</h3>
            <div className="p-3 rounded-full bg-red-100">
              <FaClipboardList className="text-red-500 text-xl" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-500">128</p>
          <span className="text-sm opacity-70">Registradas</span>
        </div>
      </div>

      {/* GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agua */}
        <div
          className="p-6 rounded-xl shadow-lg border"
          style={{ background: colores.tarjeta, borderColor: colores.borde }}
        >
          <div className="flex gap-3 items-center mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <FaTint className="text-blue-600" />
            </div>
            <h3 className="font-bold text-lg">Consumo de Agua</h3>
          </div>
          <Bar data={dataAgua} options={opcionesGrafica} />
        </div>

        {/* Energía */}
        <div
          className="p-6 rounded-xl shadow-lg border"
          style={{ background: colores.tarjeta, borderColor: colores.borde }}
        >
          <div className="flex gap-3 items-center mb-4">
            <div className="p-2 rounded-lg bg-yellow-100">
              <FaLightbulb className="text-yellow-500" />
            </div>
            <h3 className="font-bold text-lg">Consumo de Energía</h3>
          </div>
          <Bar data={dataEnergia} options={opcionesGrafica} />
        </div>
      </div>
    </div>
  );
};

export default DashboardInicio;

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
  FaLightbulb 
} from "react-icons/fa";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardInicio({ modoNoche }) {
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  const consumoAgua = [900, 850, 880, 920, 950, 970, 930, 910, 880, 900, 940, 960];
  const consumoEnergia = [310, 305, 320, 330, 345, 350, 340, 325, 315, 300, 310, 330];

  // Colores modernos
 const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-white text-black",
    tarjeta: modoNoche ? "bg-[#1e1e1e]" : "bg-[#f5f5f5]",
    borde: modoNoche ? "border-[#333]" : "border-[#ddd]",
  };

  const opcionesGrafica = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: colores.texto,
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: colores.tarjeta,
        titleColor: colores.texto,
        bodyColor: colores.texto,
        borderColor: modoNoche ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: {
          color: colores.textoSecundario,
          font: { size: 11 }
        },
        grid: {
          color: modoNoche ? '#1e293b' : '#f1f5f9',
        }
      },
      y: {
        ticks: {
          color: colores.textoSecundario,
          font: { size: 11 }
        },
        grid: {
          color: modoNoche ? '#1e293b' : '#f1f5f9',
        }
      },
    },
  };

  const dataAgua = {
    labels: meses,
    datasets: [
      {
        label: "Consumo Agua (L)",
        data: consumoAgua,
        backgroundColor: modoNoche 
          ? 'rgba(6, 182, 212, 0.7)'
          : 'linear-gradient(180deg, rgba(6, 182, 212, 0.8) 0%, rgba(8, 145, 178, 0.9) 100%)',
        borderRadius: 12,
        borderWidth: 0,
        borderSkipped: false,
      },
    ],
  };

  const dataEnergia = {
    labels: meses,
    datasets: [
      {
        label: "Consumo Energía (kWh)",
        data: consumoEnergia,
        backgroundColor: modoNoche
          ? 'rgba(245, 158, 11, 0.7)'
          : 'linear-gradient(180deg, rgba(245, 158, 11, 0.8) 0%, rgba(217, 119, 6, 0.9) 100%)',
        borderRadius: 12,
        borderWidth: 0,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div
      className={`
        w-full h-full transition-all duration-300 
        overflow-y-auto pb-10 px-4
      `}
      style={{ backgroundColor: colores.fondo }}
    >
      {/* TARJETAS MEJORADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Tarjeta Agua */}
        <div 
          className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{
            backgroundColor: colores.tarjeta,
            color: colores.texto,
            borderColor: modoNoche ? '#334155' : '#f1f5f9'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Agua</h3>
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: modoNoche ? '#0c4a6e20' : '#e0f2fe' }}
            >
              <FaWater className="text-xl" style={{ color: colores.agua }} />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: colores.agua }}>12.520 L</p>
          <span className="text-sm opacity-70">Este mes</span>
        </div>

        {/* Tarjeta Energía */}
        <div 
          className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{
            backgroundColor: colores.tarjeta,
            color: colores.texto,
            borderColor: modoNoche ? '#334155' : '#f1f5f9'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Energía</h3>
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: modoNoche ? '#713f1220' : '#fef3c7' }}
            >
              <FaBolt className="text-xl" style={{ color: colores.energia }} />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: colores.energia }}>3.980 kWh</p>
          <span className="text-sm opacity-70">Este mes</span>
        </div>

        {/* Tarjeta Promedio */}
        <div 
          className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{
            backgroundColor: colores.tarjeta,
            color: colores.texto,
            borderColor: modoNoche ? '#334155' : '#f1f5f9'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Promedio Diario</h3>
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: modoNoche ? '#04785720' : '#d1fae5' }}
            >
              <FaChartLine className="text-xl" style={{ color: colores.exito }} />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: colores.exito }}>850</p>
          <span className="text-sm opacity-70">L / kWh promedio</span>
        </div>

        {/* Tarjeta Lecturas */}
        <div 
          className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl"
          style={{
            backgroundColor: colores.tarjeta,
            color: colores.texto,
            borderColor: modoNoche ? '#334155' : '#f1f5f9'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Lecturas Totales</h3>
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: modoNoche ? '#dc262620' : '#fee2e2' }}
            >
              <FaClipboardList className="text-xl" style={{ color: colores.peligro }} />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: colores.peligro }}>128</p>
          <span className="text-sm opacity-70">Registradas</span>
        </div>
      </div>

      {/* GRÁFICAS MEJORADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfica Agua */}
        <div 
          className="p-6 rounded-2xl shadow-lg border transition-all duration-300"
          style={{
            backgroundColor: colores.tarjeta,
            color: colores.texto,
            borderColor: modoNoche ? '#334155' : '#f1f5f9'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: modoNoche ? '#0c4a6e20' : '#e0f2fe' }}
            >
              <FaTint style={{ color: colores.agua }} />
            </div>
            <h3 className="text-xl font-bold">Consumo de Agua (Mensual)</h3>
          </div>
          <Bar data={dataAgua} options={opcionesGrafica} />
        </div>

        {/* Gráfica Energía */}
        <div 
          className="p-6 rounded-2xl shadow-lg border transition-all duration-300"
          style={{
            backgroundColor: colores.tarjeta,
            color: colores.texto,
            borderColor: modoNoche ? '#334155' : '#f1f5f9'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: modoNoche ? '#713f1220' : '#fef3c7' }}
            >
              <FaLightbulb style={{ color: colores.energia }} />
            </div>
            <h3 className="text-xl font-bold">Consumo de Energía (Mensual)</h3>
          </div>
          <Bar data={dataEnergia} options={opcionesGrafica} />
        </div>
      </div>
    </div>
  );
}
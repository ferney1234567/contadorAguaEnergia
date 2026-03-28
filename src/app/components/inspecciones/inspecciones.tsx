"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Droplet,
  Zap,
  Recycle
} from "lucide-react";

import TablaReciclaje from "./TablaReciclaje";
import TablaAgua from "./TablaAgua";
import TablaEnergia from "./TablaEnergia";

interface Props {
  modoNoche: boolean;
}

type Registro = {
  area: string;
  valor1: number;
  valor2: number;
  valor3: number;
};

export default function Inspecciones({ modoNoche }: Props) {

  const [vista, setVista] = useState<"reciclaje" | "agua" | "energia">("reciclaje");

  const [dataReciclaje] = useState<Registro[]>([
    { area: "Bodega 1", valor1: 0, valor2: 0, valor3: 0 },
    { area: "Recepción", valor1: 0, valor2: 0, valor3: 0 },
  ]);

  const [dataAgua] = useState<Registro[]>([
    { area: "Bodega 1", valor1: 0, valor2: 0, valor3: 0 },
  ]);

  const [dataEnergia] = useState<Registro[]>([
    { area: "Bodega 1", valor1: 0, valor2: 0, valor3: 0 },
  ]);

  const estilos = {
    fondo: modoNoche
      ? "bg-[#121212] text-white"
      : "bg-[#ffffff] text-gray-800",

    contenedor: modoNoche
      ? "bg-[#1a1a1a] border border-[#2f2f2f]"
      : "bg-white border border-gray-200",

    seccion: modoNoche
      ? "bg-[#222] border border-[#333]"
      : "bg-white border border-gray-200",

    seccionActiva: "ring-2 ring-blue-500 scale-[1.01]",

    tablaWrapper: modoNoche
      ? "border border-[#3a3a3a] rounded-xl overflow-hidden"
      : "border border-gray-300 rounded-xl overflow-hidden",
  };

  return (
    <div className={`w-full min-h-screen p-6 ${estilos.fondo}`}>

      <div className="max-w-[1300px] mx-auto space-y-6">

      
        {/* 🔥 SECCIONES GRANDES (NO BOTONES) */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* RECICLAJE */}
          <div
            onClick={() => setVista("reciclaje")}
            className={`cursor-pointer p-5 rounded-2xl transition-all duration-200
            ${estilos.seccion}
            ${vista === "reciclaje" ? estilos.seccionActiva : ""}
            hover:shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Recycle className="text-green-500" />
              <h2 className="font-semibold text-lg">Reciclaje</h2>
            </div>
            <p className="text-sm opacity-60">
              Control de residuos y clasificación
            </p>
          </div>

          {/* AGUA */}
          <div
            onClick={() => setVista("agua")}
            className={`cursor-pointer p-5 rounded-2xl transition-all duration-200
            ${estilos.seccion}
            ${vista === "agua" ? estilos.seccionActiva : ""}
            hover:shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Droplet className="text-blue-500" />
              <h2 className="font-semibold text-lg">Agua</h2>
            </div>
            <p className="text-sm opacity-60">
              Inspección de consumo y puntos hidráulicos
            </p>
          </div>

          {/* ENERGÍA */}
          <div
            onClick={() => setVista("energia")}
            className={`cursor-pointer p-5 rounded-2xl transition-all duration-200
            ${estilos.seccion}
            ${vista === "energia" ? estilos.seccionActiva : ""}
            hover:shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-yellow-500" />
              <h2 className="font-semibold text-lg">Energía</h2>
            </div>
            <p className="text-sm opacity-60">
              Evaluación de sistemas eléctricos
            </p>
          </div>

        </div>

        {/* 🔥 CONTENEDOR PRINCIPAL */}
        <div className={`rounded-2xl p-6 shadow-lg ${estilos.contenedor}`}>

          {/* HEADER INTERNO */}
          <div className="mb-6 flex justify-between items-center">

            <h3 className="text-lg font-semibold">
              {vista === "reciclaje" && "Gestión de residuos"}
              {vista === "agua" && "Inspección de agua"}
              {vista === "energia" && "Inspección energética"}
            </h3>

            <span className="text-xs opacity-50">
              Sistema de monitoreo ambiental
            </span>

          </div>

          {/* TABLAS */}
          <div className={estilos.tablaWrapper}>

            {vista === "reciclaje" && (
              <TablaReciclaje data={dataReciclaje} modoNoche={modoNoche} />
            )}

            {vista === "agua" && (
              <TablaAgua data={dataAgua} modoNoche={modoNoche} />
            )}

            {vista === "energia" && (
              <TablaEnergia data={dataEnergia} modoNoche={modoNoche} />
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
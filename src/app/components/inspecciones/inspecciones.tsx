"use client";

import { useEffect, useState } from "react";
import {
  Droplet,
  Zap,
  Recycle,
} from "lucide-react";

import TablaReciclaje from "./TablaReciclaje";
import TablaAgua from "./TablaAgua";
import TablaEnergia from "./TablaEnergia";

interface Props {
  modoNoche: boolean;
}

export default function Inspecciones({ modoNoche }: Props) {

  const [vista, setVista] = useState<"reciclaje" | "agua" | "energia">("reciclaje");

  const [dataReciclaje, setDataReciclaje] = useState<any[]>([]);
  const [dataAgua, setDataAgua] = useState<any[]>([]);
  const [dataEnergia, setDataEnergia] = useState<any[]>([]);

  const estilos = {
    fondo: modoNoche
      ? "bg-[#0f0f0f] text-white"
      : "bg-[#ffffff] text-gray-800",

    tabs: modoNoche
      ? "bg-[#181818] border border-[#2a2a2a]"
      : "bg-white border border-gray-200",

    activa: "border-b-2 border-blue-500 text-blue-500 font-semibold",

    tabla: modoNoche
      ? "bg-[#141414] border border-[#2a2a2a]"
      : "bg-white border border-gray-200"
  };

  return (
    <div className={`w-full min-h-screen p-4 md:p-6 ${estilos.fondo}`}>

      <div className="max-w-7xl mx-auto space-y-4">

        {/* 🔥 TABS MÁS LARGOS */}
        <div className={`rounded-xl flex w-full ${estilos.tabs}`}>

          {/* RECICLAJE */}
          <button
            onClick={() => setVista("reciclaje")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition
            ${vista === "reciclaje"
                ? estilos.activa
                : "opacity-70 hover:opacity-100"
              }`}
          >
            <Recycle className="w-4 h-4" />
            Reciclaje
          </button>

          {/* AGUA */}
          <button
            onClick={() => setVista("agua")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition
            ${vista === "agua"
                ? estilos.activa
                : "opacity-70 hover:opacity-100"
              }`}
          >
            <Droplet className="w-4 h-4" />
            Agua
          </button>

          {/* ENERGÍA */}
          <button
            onClick={() => setVista("energia")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition
            ${vista === "energia"
                ? estilos.activa
                : "opacity-70 hover:opacity-100"
              }`}
          >
            <Zap className="w-4 h-4" />
            Energía
          </button>

        </div>

        {/* 🔥 CONTENIDO */}
        <div className={`rounded-xl overflow-hidden ${estilos.tabla}`}>

          {vista === "reciclaje" && (
            <TablaReciclaje
              dataBackend={dataReciclaje}
              modoNoche={modoNoche}
            />
          )}

          {vista === "agua" && (
            <TablaAgua
              data={dataAgua}
              modoNoche={modoNoche}
            />
          )}

          {vista === "energia" && (
            <TablaEnergia
              data={dataEnergia}
              modoNoche={modoNoche}
            />
          )}

        </div>

      </div>
    </div>
  );
}
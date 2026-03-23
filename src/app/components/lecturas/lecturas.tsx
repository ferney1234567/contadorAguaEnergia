"use client";

import { useState } from "react";
import { Save, Droplets, Zap } from "lucide-react";
import Swal from "sweetalert2";

interface Props {
  modoNoche: boolean;
}

export default function Lecturas({ modoNoche }: Props) {
  const [lectura, setLectura] = useState("");
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState("");

  const colores = {
    fondo: modoNoche
      ? "bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a]"
      : "bg-gradient-to-br from-[#ececec] to-[#f7f7f7]",

    celular: modoNoche
      ? "bg-[#181818] border border-gray-700"
      : "bg-white border border-gray-300",

    input: modoNoche
      ? "bg-[#242424] text-white border border-gray-600 focus:border-gray-500"
      : "bg-white text-black border border-gray-300 focus:border-gray-400",

    rojo: "bg-[#E30613] hover:bg-[#b8040f] text-white",
  };

  const handleLecturaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setLectura(value);
  };

  const guardarLectura = async () => {
    if (!bodegaSeleccionada || !lectura) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Selecciona la bodega e ingresa la lectura.",
        confirmButtonColor: "#E30613",
      });
      return;
    }

    const tipo = bodegaSeleccionada.includes("agua") ? "agua" : "energia";

    const hoy = new Date();
    const fechaLocal =
      hoy.getFullYear() +
      "-" +
      String(hoy.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(hoy.getDate()).padStart(2, "0");

    try {
      Swal.fire({
        title: "Guardando lectura...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const resp = await fetch("/api/lecturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodega: bodegaSeleccionada,
          lectura: Number(lectura),
          tipo,
          fecha: fechaLocal,
        }),
      });

      if (!resp.ok) throw new Error();

      Swal.fire({
        icon: "success",
        title: "Lectura guardada",
        confirmButtonColor: "#16a34a",
      });

      setLectura("");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        confirmButtonColor: "#E30613",
      });
    }
  };

  const esAgua = bodegaSeleccionada.includes("agua");

  return (
    <div
      className={`w-full h-[calc(100vh-90px)] flex items-start justify-center pt-6 px-4 ${colores.fondo}`}
    >
      {/* CONTENEDOR */}
     <div
  className={`w-full max-w-[390px] min-h-[500px] rounded-[28px] shadow-xl flex flex-col ${colores.celular}`}
>
        {/* NOTCH */}
        <div className="h-5 flex justify-center items-center mt-2">
          <div className="w-20 h-1.5 bg-gray-400 rounded-full opacity-40"></div>
        </div>

        {/* CONTENIDO */}
        <div className="px-5 py-5 flex flex-col gap-3">

          {/* TITULO */}
          <h1 className="text-lg font-bold text-center">
            Registro de Lectura
          </h1>

          {/* SELECT */}
          <div>
            <label className="text-xs font-semibold">
              Seleccionar Bodega
            </label>

            <select
              value={bodegaSeleccionada}
              onChange={(e) => setBodegaSeleccionada(e.target.value)}
              className={`w-full mt-1 p-2.5 rounded-lg outline-none ${colores.input}`}
            >
              <option value="">-- Seleccionar --</option>
              <option value="bodega_2_agua">💧 Agua - Bodega 2</option>
              <option value="bodega_4_agua">💧 Agua - Bodega 4</option>
              <option value="bodega_1_energia">⚡ Energía - Bodega 1</option>
              <option value="bodega_3_energia">⚡ Energía - Bodega 3</option>
            </select>
          </div>

          {/* ICONO */}
          <div className="flex justify-center py-1">
            {esAgua ? (
              <Droplets size={30} className="text-blue-500" />
            ) : (
              <Zap size={30} className="text-yellow-500" />
            )}
          </div>

          {/* INPUT */}
          <div className="flex flex-col gap-1">
            <input
              type="tel"
              placeholder="000000"
              value={lectura}
              onChange={handleLecturaInput}
              className={`w-full text-center text-3xl font-mono p-2.5 rounded-lg outline-none tracking-widest ${colores.input}`}
            />

            <p className="text-center text-[11px] opacity-60">
              Solo números permitidos
            </p>
          </div>

          {/* BOTON */}
          <button
            onClick={guardarLectura}
            disabled={!bodegaSeleccionada || !lectura}
            className={`mt-2 py-2.5 rounded-lg shadow-md text-sm flex justify-center items-center gap-2 ${colores.rojo} disabled:opacity-50`}
          >
            <Save size={18} />
            Guardar
          </button>

        </div>
      </div>
    </div>
  );
}
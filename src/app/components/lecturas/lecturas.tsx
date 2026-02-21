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
      ? "bg-[#2a2a2a] text-white border border-gray-600"
      : "bg-white text-black border border-gray-300",

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

    const tipo = bodegaSeleccionada.includes("agua")
      ? "agua"
      : "energia";

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
        text: "Por favor espera",
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
        text: `La lectura del ${fechaLocal} fue registrada correctamente.`,
        confirmButtonColor: "#16a34a",
      });

      setLectura("");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "No se pudo registrar la lectura.",
        confirmButtonColor: "#E30613",
      });
    }
  };

  const esAgua = bodegaSeleccionada.includes("agua");

  return (
    <div className={`w-full min-h-screen flex items-center justify-center p-6 ${colores.fondo}`}>
      
      {/* 📱 CONTENEDOR CELULAR */}
      <div
        className={`w-[380px] h-[750px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col ${colores.celular}`}
      >
        {/* Barra superior tipo notch */}
        <div className="h-6 flex justify-center items-center mt-3">
          <div className="w-24 h-2 bg-gray-500 rounded-full opacity-50"></div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-6 flex flex-col">

          <h1 className="text-2xl font-extrabold text-center mb-6">
            Registro de Lectura
          </h1>

          {/* SELECT */}
          <div className="mb-6">
            <label className="text-sm font-semibold">
              Seleccionar Bodega
            </label>

            <select
              value={bodegaSeleccionada}
              onChange={(e) => setBodegaSeleccionada(e.target.value)}
              className={`w-full mt-2 p-3 rounded-xl ${colores.input}`}
            >
              <option value="">-- Seleccionar --</option>
              <option value="bodega_2_agua">💧 Agua - Bodega 2</option>
              <option value="bodega_4_agua">💧 Agua - Bodega 4</option>
              <option value="bodega_1_energia">⚡ Energía - Bodega 1</option>
              <option value="bodega_3_energia">⚡ Energía - Bodega 3</option>
            </select>
          </div>

          {/* TARJETA */}
          <div className="flex-1 flex flex-col justify-center">

            <div className="text-center mb-6">
              {esAgua ? (
                <Droplets size={48} className="mx-auto text-blue-500" />
              ) : (
                <Zap size={48} className="mx-auto text-yellow-500" />
              )}
            </div>

            <input
              type="tel"
              placeholder="000000"
              value={lectura}
              onChange={handleLecturaInput}
              className={`w-full text-center text-5xl font-mono p-4 rounded-2xl outline-none ${colores.input}`}
            />

            <p className="text-center text-xs mt-3 opacity-60">
              Solo números permitidos
            </p>
          </div>

          {/* BOTÓN */}
          <button
            onClick={guardarLectura}
            disabled={!bodegaSeleccionada || !lectura}
            className={`mt-6 py-4 rounded-2xl shadow-lg text-lg flex justify-center items-center gap-3 ${colores.rojo} disabled:opacity-50`}
          >
            <Save size={22} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Pencil, SlidersHorizontal, Save, X } from "lucide-react";

interface Props {
  modoNoche: boolean;
}

export default function Lecturas({ modoNoche }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [streamActivo, setStreamActivo] = useState(false);
  const [lectura, setLectura] = useState("0023456");
  const [modoManual, setModoManual] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // 🎨 COLORES DINÁMICOS — MODO DÍA / MODO NOCHE
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-[#F5F5F5] text-black",
    tarjeta: modoNoche ? "bg-[#1f1f1f]" : "bg-white",
    botones: modoNoche ? "bg-[#2a2a2a] text-white" : "bg-white text-black",
    rojo: "bg-[#E30613] hover:bg-[#c10510] text-white",
    panelFiltros: modoNoche ? "bg-[#2a2a2a] text-white" : "bg-white text-black",
    input: modoNoche ? "bg-[#333] text-white" : "bg-white text-black",
  };

  // ========== ACTIVAR CÁMARA ==========
  const iniciarCamara = async () => {
    try {
      setModoManual(false);
      setMostrarFiltros(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStreamActivo(true);
    } catch (err) {
      console.error("Error cámara:", err);
      alert("No se pudo acceder a la cámara.");
    }
  };

  // ========== DETENER CÁMARA ==========
  const detenerCamara = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
    setStreamActivo(false);
  };

  // Auto apagar cámara si abres manual o filtros
  useEffect(() => {
    if (modoManual || mostrarFiltros) detenerCamara();
  }, [modoManual, mostrarFiltros]);

  return (
    <div className={`w-full min-h-screen p-5 flex flex-col items-center ${colores.fondo}`}>

      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold mb-5">Lecturas</h1>

      {/* CUADRO LECTURA */}
      <div className={`${colores.tarjeta} w-full max-w-sm p-4 rounded-xl shadow-lg`}>
        {modoManual ? (
          <input
            type="text"
            value={lectura}
            onChange={(e) => setLectura(e.target.value)}
            className={`w-full text-center text-3xl font-mono outline-none ${colores.input}`}
          />
        ) : (
          <p className="text-center font-mono text-3xl tracking-wider">{lectura}</p>
        )}
      </div>

      {/* CÁMARA */}
      {!modoManual && !mostrarFiltros && (
        <div className="w-full max-w-sm mt-6 flex justify-center">
          <div className="relative w-full h-52 md:h-64 bg-black rounded-xl overflow-hidden shadow-lg">
            {!streamActivo && (
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-70">
                <p className="text-lg font-bold">Cámara apagada</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* PANEL DE FILTROS */}
      {mostrarFiltros && (
        <div className={`w-full max-w-sm mt-6 p-4 rounded-xl shadow-lg ${colores.panelFiltros}`}>
          <h3 className="font-bold text-lg mb-4">Filtros</h3>

          <label className="block mb-4">
            Brillo
            <input type="range" min="0" max="200" defaultValue="100" className="w-full" />
          </label>

          <label className="block mb-4">
            Contraste
            <input type="range" min="0" max="200" defaultValue="100" className="w-full" />
          </label>

          <button
            onClick={() => setMostrarFiltros(false)}
            className="w-full mt-2 p-3 rounded-lg bg-gray-400 hover:bg-gray-500 flex items-center justify-center"
          >
            <X size={20} className="mr-2" /> Cerrar
          </button>
        </div>
      )}

      {/* BOTONES */}
      <div className="flex gap-4 mt-6 w-full max-w-sm justify-center">

        {/* ESCANEAR */}
        <button
          onClick={iniciarCamara}
          className={`${colores.botones} w-24 px-4 py-3 rounded-xl shadow-lg flex flex-col items-center`}
        >
          <Camera size={24} className="mb-1 text-red-500" />
          <span className="text-sm font-semibold">Escanear</span>
        </button>

        {/* MANUAL */}
        <button
          onClick={() => { setModoManual(true); setMostrarFiltros(false); }}
          className={`${colores.botones} w-24 px-4 py-3 rounded-xl shadow-lg flex flex-col items-center`}
        >
          <Pencil size={24} className="mb-1 text-red-500" />
          <span className="text-sm font-semibold">Manual</span>
        </button>

        {/* FILTROS */}
        <button
          onClick={() => { setMostrarFiltros(true); setModoManual(false); }}
          className={`${colores.botones} w-24 px-4 py-3 rounded-xl shadow-lg flex flex-col items-center`}
        >
          <SlidersHorizontal size={24} className="mb-1 text-red-500" />
          <span className="text-sm font-semibold">Filtros</span>
        </button>
      </div>

      {/* BOTÓN GUARDAR */}
      <button
        className={`mt-10 w-full max-w-sm py-4 rounded-xl flex items-center justify-center text-xl shadow-lg ${colores.rojo}`}
      >
        <Save size={26} className="mr-2" />
        Guardar Lectura
      </button>

      {/* CERRAR CÁMARA */}
      {streamActivo && (
        <button onClick={detenerCamara} className="mt-4 text-red-500 underline text-center">
          Apagar cámara
        </button>
      )}
    </div>
  );
}

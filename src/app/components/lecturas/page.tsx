"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Pencil, SlidersHorizontal, Save, X } from "lucide-react";

export default function Lecturas() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [streamActivo, setStreamActivo] = useState(false);
  const [lectura, setLectura] = useState("0023456");
  const [modoManual, setModoManual] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const colores = {
    fondo: "bg-[#F5F5F5] text-black",
    tarjeta: "bg-white",
    botones: "bg-white text-black",
    rojo: "bg-[#E30613] hover:bg-[#c10510] text-white",
  };

  // Activar cámara trasera
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

  // Detener cámara
  const detenerCamara = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
    setStreamActivo(false);
  };

  // Apagar cámara al abrir manual o filtros
  useEffect(() => {
    if (modoManual || mostrarFiltros) detenerCamara();
  }, [modoManual, mostrarFiltros]);

  return (
    <div className={`w-full min-h-screen p-5 flex flex-col items-center ${colores.fondo}`}>

      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold mb-5">Lecturas</h1>

      {/* CUADRO DE LECTURA */}
      <div className={`${colores.tarjeta} w-full max-w-sm p-4 rounded-xl shadow-lg`}>
        {modoManual ? (
          <input
            type="text"
            value={lectura}
            onChange={(e) => setLectura(e.target.value)}
            className="w-full bg-transparent text-center text-3xl font-mono outline-none"
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
        <div className="w-full max-w-sm mt-6 p-4 rounded-xl shadow-lg bg-white text-black">
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
            className="w-full mt-2 p-3 rounded-lg bg-gray-300 hover:bg-gray-400 flex items-center justify-center"
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
          <Camera size={24} className="mb-1" />
          <span className="text-sm font-semibold">Escanear</span>
        </button>

        {/* MANUAL */}
        <button
          onClick={() => { setModoManual(true); setMostrarFiltros(false); }}
          className={`${colores.botones} w-24 px-4 py-3 rounded-xl shadow-lg flex flex-col items-center`}
        >
          <Pencil size={24} className="mb-1" />
          <span className="text-sm font-semibold">Manual</span>
        </button>

        {/* FILTROS */}
        <button
          onClick={() => { setMostrarFiltros(true); setModoManual(false); }}
          className={`${colores.botones} w-24 px-4 py-3 rounded-xl shadow-lg flex flex-col items-center`}
        >
          <SlidersHorizontal size={24} className="mb-1" />
          <span className="text-sm font-semibold">Filtros</span>
        </button>
      </div>

      {/* BOTÓN ROJO GUARDAR */}
      <button
        className={`mt-10 w-full max-w-sm py-4 rounded-xl flex items-center justify-center text-xl shadow-lg ${colores.rojo}`}
      >
        <Save size={26} className="mr-2" />
        Guardar Lectura
      </button>

      {/* CERRAR CÁMARA */}
      {streamActivo && (
        <button
          onClick={detenerCamara}
          className="mt-4 text-red-500 underline text-center"
        >
          Apagar cámara
        </button>
      )}

    </div>
  );
}

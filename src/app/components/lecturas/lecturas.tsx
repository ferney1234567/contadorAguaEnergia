"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Pencil,
  SlidersHorizontal,
  Save,
  X,
  Zap,
} from "lucide-react";

interface Props {
  modoNoche: boolean;
}

// ⭐ EXTENSIÓN NECESARIA PARA PERMITIR FLASH ⭐
interface TorchCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

export default function Lecturas({ modoNoche }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [lectura, setLectura] = useState("");
  const [streamActivo, setStreamActivo] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [flashActivo, setFlashActivo] = useState(false);

  // 🎨 COLORES
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-[#F4F4F4] text-black",
    tarjeta:
      modoNoche
        ? "bg-[#1f1f1f] border border-white"
        : "bg-white border border-white",
    panelFiltros:
      modoNoche
        ? "bg-[#2a2a2a] text-white border border-white"
        : "bg-white text-black border border-white",
    input: modoNoche ? "bg-[#333] text-white" : "bg-white text-black",
    botones:
      modoNoche
        ? "bg-[#2a2a2a] border border-white"
        : "bg-white border border-white",
    rojo: "bg-[#E30613] hover:bg-[#b8040f] text-white",
  };

  // 🎥 INICIAR CÁMARA
  const iniciarCamara = async () => {
    try {
      setModoManual(false);
      setMostrarFiltros(false);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          // 🔥 Tipado corregido sin errores ESLint
     advanced: flashActivo ? ([{ torch: true }] as unknown as MediaTrackConstraintSet[]) : [],

        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreamActivo(true);
    } catch {
      alert("⚠️ Tu dispositivo no soporta cámara o flash.");
    }
  };

  // 🔦 FLASH FUNCIONAL
  const toggleFlash = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    const caps = track.getCapabilities?.() as TorchCapabilities;

    if (!caps?.torch) {
      alert("⚠️ Tu dispositivo NO soporta flash.");
      return;
    }

    const nuevoEstado = !flashActivo;
    setFlashActivo(nuevoEstado);

    await track.applyConstraints({
     advanced: [{ torch: nuevoEstado } as unknown as MediaTrackConstraintSet],

    });
  };

  // 🛑 DETENER CÁMARA
  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setStreamActivo(false);
  };

  // 🎚 FILTROS EN TIEMPO REAL
  const aplicarFiltros = () => {
    if (!videoRef.current) return;

    const brillo = (document.getElementById("brillo") as HTMLInputElement)?.value;
    const contraste = (document.getElementById("contraste") as HTMLInputElement)?.value;
    const saturacion = (document.getElementById("saturacion") as HTMLInputElement)?.value;

    videoRef.current.style.filter = `
      brightness(${brillo}%)
      contrast(${contraste}%)
      saturate(${saturacion}%)
    `;
  };

  // Apaga cámara al entrar en modo manual o filtros
  useEffect(() => {
    if (modoManual || mostrarFiltros) detenerCamara();
  }, [modoManual, mostrarFiltros]);

  // SOLO PERMITIR NÚMEROS
  const handleLecturaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setLectura(value);
  };

  return (
    <div className={`w-full min-h-screen p-5 flex flex-col items-center ${colores.fondo}`}>

      <h1 className="text-3xl font-extrabold mb-5">Lecturas</h1>

      {/* CUADRO LECTURA */}
      <div className={`${colores.tarjeta} w-full max-w-sm p-4 rounded-xl shadow-lg`}>
        {modoManual ? (
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Lectura…"
            value={lectura}
            onChange={handleLecturaInput}
            className={`w-full text-center text-3xl font-mono outline-none p-2 rounded-xl ${colores.input}`}
          />
        ) : (
          <p className="text-center text-3xl font-mono">{lectura || "—"}</p>
        )}
      </div>

      {/* CÁMARA */}
      {!modoManual && !mostrarFiltros && (
        <div className="w-full max-w-sm mt-5">
          <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-lg border border-white">
            {!streamActivo && (
              <div className="absolute inset-0 flex items-center justify-center text-white opacity-60">
                <p>Cámara apagada</p>
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

          {streamActivo && (
            <button
              onClick={toggleFlash}
              className="w-full mt-3 p-3 rounded-xl bg-yellow-500 text-white flex justify-center gap-2 border border-white"
            >
              <Zap size={22} />
              Flash {flashActivo ? "ON" : "OFF"}
            </button>
          )}
        </div>
      )}

      {/* FILTROS */}
      {mostrarFiltros && (
        <div className={`${colores.panelFiltros} w-full max-w-sm mt-5 p-5 rounded-xl shadow-xl`}>
          <h3 className="text-lg font-bold mb-4">Filtros</h3>

          <label className="block mb-4">
            Brillo
            <input id="brillo" type="range" min="50" max="200" defaultValue="100"
              onChange={aplicarFiltros} className="w-full accent-red-500" />
          </label>

          <label className="block mb-4">
            Contraste
            <input id="contraste" type="range" min="50" max="200" defaultValue="100"
              onChange={aplicarFiltros} className="w-full accent-red-500" />
          </label>

          <label className="block mb-4">
            Saturación
            <input id="saturacion" type="range" min="50" max="200" defaultValue="100"
              onChange={aplicarFiltros} className="w-full accent-red-500" />
          </label>

          <button
            onClick={() => setMostrarFiltros(false)}
            className="w-full mt-3 p-3 rounded-xl bg-gray-500 text-white flex justify-center gap-2 border border-white"
          >
            <X size={20} />
            Cerrar
          </button>
        </div>
      )}

      {/* BOTONES */}
      <div className="flex gap-4 mt-6 w-full max-w-sm justify-center">
        <button onClick={iniciarCamara}
          className={`${colores.botones} w-24 py-3 rounded-xl shadow-lg flex flex-col items-center`}>
          <Camera size={26} className="text-red-600" />
          <span className="text-sm font-bold">Escanear</span>
        </button>

        <button onClick={() => setModoManual(true)}
          className={`${colores.botones} w-24 py-3 rounded-xl shadow-lg flex flex-col items-center`}>
          <Pencil size={26} className="text-red-600" />
          <span className="text-sm font-bold">Manual</span>
        </button>

        <button onClick={() => setMostrarFiltros(true)}
          className={`${colores.botones} w-24 py-3 rounded-xl shadow-lg flex flex-col items-center`}>
          <SlidersHorizontal size={26} className="text-red-600" />
          <span className="text-sm font-bold">Filtros</span>
        </button>
      </div>

      {/* GUARDAR */}
      <button className={`mt-10 w-full max-w-sm py-4 rounded-xl shadow-lg text-xl flex justify-center items-center gap-3 ${colores.rojo}`}>
        <Save size={28} />
        Guardar Lectura
      </button>

      {/* DETENER CÁMARA */}
      {streamActivo && (
        <button onClick={detenerCamara} className="mt-4 text-red-600 underline">
          Apagar cámara
        </button>
      )}
    </div>
  );
}

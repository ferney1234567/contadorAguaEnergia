"use client";

import { useEffect, useRef, useState } from "react";
import {Camera,Pencil,SlidersHorizontal,Save,X,Zap,Droplets,Flame} from "lucide-react";
import Swal from "sweetalert2";


interface Props {
  modoNoche: boolean;
}

interface TorchCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

export default function Lecturas({ modoNoche }: Props) {
  const [cargandoOCR, setCargandoOCR] = useState(false);
const [confianza, setConfianza] = useState<number | null>(null);
const [errorOCR, setErrorOCR] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [lectura, setLectura] = useState("");
  const [streamActivo, setStreamActivo] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [flashActivo, setFlashActivo] = useState(false);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState("");
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-[#F4F4F4] text-black",
    tarjeta: modoNoche ? "bg-[#1f1f1f] border border-white"
                       : "bg-white border border-white",
    panelFiltros: modoNoche ? "bg-[#2a2a2a] text-white border border-white"
                            : "bg-white text-black border border-white",
    input: modoNoche ? "bg-[#333] text-white"
                     : "bg-white text-black",
    botones: modoNoche ? "bg-[#2a2a2a] border border-white"
                       : "bg-white border border-white",
    rojo: "bg-[#E30613] hover:bg-[#b8040f] text-white",
  };

  // =======================
  //     CONTROL CÁMARA
  // =======================

  const iniciarCamara = async () => {
    if (!bodegaSeleccionada) {
      alert("⚠️ Primero selecciona la bodega.");
      return;
    }

    try {
      setModoManual(false);
      setMostrarFiltros(false);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          advanced: flashActivo
            ? ([{ torch: true }] as unknown as MediaTrackConstraintSet[])
            : [],
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

  const capturarFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob | null>((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg")
    );
  };

  const escanearContador = async () => {
  if (!bodegaSeleccionada) {
    alert("⚠️ Selecciona la bodega antes de escanear.");
    return;
  }

  if (!streamActivo) {
    alert("Enciende la cámara primero.");
    return;
  }

  const foto = await capturarFrame();
  if (!foto) {
    alert("No se pudo capturar la imagen");
    return;
  }

  const form = new FormData();
  form.append("file", foto);

  try {
    setCargandoOCR(true);
    setErrorOCR(null);
    setLectura("");

    const resp = await fetch("/api/ocr/leer_contador", 
      {
        method: "POST",
        body: form,
      }
    );

    if (!resp.ok) throw new Error("Error OCR");

    const data = await resp.json();

    if (!data.lectura) {
      setErrorOCR("No se detectaron números");
      return;
    }

    setLectura(data.lectura);
    setConfianza(data.confianza ?? null);

  } catch {
    setErrorOCR("No se pudo procesar la imagen");
  } finally {
    setCargandoOCR(false);
  }
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

  // ✅ FECHA LOCAL REAL (sin UTC)
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
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const resp = await fetch("/api/lecturas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    setConfianza(null);
    setErrorOCR(null);

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al guardar",
      text: "No se pudo registrar la lectura. Intenta nuevamente.",
      confirmButtonColor: "#E30613",
    });
  }
};




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

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setStreamActivo(false);
  };

  useEffect(() => {
    if (modoManual || mostrarFiltros) detenerCamara();
  }, [modoManual, mostrarFiltros]);

  const handleLecturaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setLectura(value);
  };

  // ======================================================
  //                    RENDER UI
  // ======================================================

 return (
  <div
    className={`w-full min-h-screen p-5 flex flex-col items-center ${colores.fondo}`}
  >
    <h1 className="text-3xl font-extrabold mb-5">Registrar Lectura</h1>

    {/* ⭐⭐⭐ SELECTOR DE BODEGA ⭐⭐⭐ */}
    <div className="w-full max-w-sm mb-5">
      <label className="font-bold text-sm">Seleccionar Bodega</label>

      <select
        value={bodegaSeleccionada}
        onChange={(e) => setBodegaSeleccionada(e.target.value)}
        className={`w-full mt-1 p-3 rounded-xl border text-sm font-semibold ${colores.input}`}
      >
        <option value="">-- Seleccionar --</option>
        <option value="bodega_2_agua">💧 Agua - Bodega 2</option>
        <option value="bodega_4_agua">💧 Agua - Bodega 4</option>
        <option value="bodega_1_energia">⚡ Energía - Bodega 1</option>
        <option value="bodega_3_energia">⚡ Energía - Bodega 3</option>
      </select>
    </div>

    {/* ================== LECTURA ================== */}
    <div
      className={`${colores.tarjeta} w-full max-w-sm p-4 rounded-xl shadow-lg text-center`}
    >
      {modoManual ? (
        <input
          type="tel"
          placeholder="Lectura…"
          value={lectura}
          onChange={handleLecturaInput}
          className={`w-full text-center text-3xl font-mono outline-none p-2 rounded-xl ${colores.input}`}
        />
      ) : (
        <p className="text-3xl font-mono">{lectura || "—"}</p>
      )}

      {/* ESTADOS OCR */}
      {cargandoOCR && (
        <p className="mt-2 text-sm text-yellow-400">
          🔍 Analizando imagen…
        </p>
      )}

      {confianza !== null && (
        <p className="mt-1 text-xs text-green-400">
          Confianza OCR: {(confianza * 100).toFixed(1)}%
        </p>
      )}

      {errorOCR && (
        <p className="mt-2 text-sm text-red-400">❌ {errorOCR}</p>
      )}
    </div>

    {/* ================== CÁMARA ================== */}
    {!modoManual && !mostrarFiltros && (
      <div className="w-full max-w-sm mt-5">
        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg border border-white bg-black">
          {!streamActivo && (
            <div className="absolute inset-0 flex items-center justify-center text-white opacity-70">
              Cámara apagada
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* 🎯 OVERLAY GUÍA */}
          {streamActivo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-1/3 border-2 border-dashed border-green-400 rounded-lg opacity-80" />
            </div>
          )}
        </div>

        {streamActivo && (
          <button
            onClick={toggleFlash}
            className="w-full mt-3 p-3 rounded-xl bg-yellow-500 text-white flex justify-center gap-2"
          >
            <Zap size={22} />
            Flash {flashActivo ? "ON" : "OFF"}
          </button>
        )}
      </div>
    )}

    {/* ================== BOTONES ================== */}
    <div className="flex gap-4 mt-6 w-full max-w-sm justify-center">
      <button
        onClick={iniciarCamara}
        className={`${colores.botones} w-24 py-3 rounded-xl shadow-lg flex flex-col items-center`}
      >
        <Camera size={26} className="text-red-600" />
        <span className="text-sm font-bold">Escanear</span>
      </button>

      <button
        onClick={escanearContador}
        disabled={cargandoOCR}
        className="bg-green-600 text-white w-24 py-3 rounded-xl shadow-lg flex flex-col items-center disabled:opacity-50"
      >
        <Camera size={26} />
        <span className="text-sm font-bold">Tomar</span>
      </button>

      <button
        onClick={() => setModoManual(true)}
        className={`${colores.botones} w-24 py-3 rounded-xl shadow-lg flex flex-col items-center`}
      >
        <Pencil size={26} className="text-red-600" />
        <span className="text-sm font-bold">Manual</span>
      </button>
    </div>

    {/* ================== GUARDAR ================== */}
    <button
      onClick={guardarLectura}
      disabled={!bodegaSeleccionada || !lectura}
      className={`mt-10 w-full max-w-sm py-4 rounded-xl shadow-lg text-xl
        flex justify-center items-center gap-3
        ${colores.rojo}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <Save size={28} />
      Guardar Lectura
    </button>

    {streamActivo && (
      <button
        onClick={detenerCamara}
        className="mt-4 text-red-500 underline"
      >
        Apagar cámara
      </button>
    )}
  </div>
);


}

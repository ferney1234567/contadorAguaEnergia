"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {User,MapPin,Bath,Droplet,ShowerHead,Toilet,Pipette,} from "lucide-react";

type ValoresType = {
  [campo: number]: {
    c?: string;
    nc?: string;
  };
};

interface Props {
  dataBackend: any[];
  setInspecciones: React.Dispatch<React.SetStateAction<any[]>>;
  mostrarModal: boolean;
  setMostrarModal: React.Dispatch<React.SetStateAction<boolean>>;
  modoNoche: boolean;
}

export default function MovilSanitario({
  dataBackend = [],
  setInspecciones,
  mostrarModal,
  setMostrarModal,
  modoNoche,
}: Props) {

  const [responsable, setResponsable] = useState(() => {
    return localStorage.getItem("responsable") || "";
  });

  const [areaId, setAreaId] = useState("");
  const [busquedaArea, setBusquedaArea] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);

  const [valores, setValores] = useState<ValoresType>({});
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const areasFiltradas = dataBackend.filter((a: any) =>
    a.nombre.toLowerCase().includes(busquedaArea.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem("responsable", responsable);
  }, [responsable]);

  useEffect(() => {
    const cerrar = () => setMostrarLista(false);
    window.addEventListener("click", cerrar);
    return () => window.removeEventListener("click", cerrar);
  }, []);

  useEffect(() => {
    const areaExacta = dataBackend.find(
      (a: any) =>
        a.nombre.toLowerCase().trim() === busquedaArea.toLowerCase().trim()
    );
    if (areaExacta) setAreaId(areaExacta.id);
  }, [busquedaArea, dataBackend]);

  const handleChange = (campo: number, tipo: "c" | "nc", value: string) => {
    const limpio = value.replace(/\D/g, "");

    setValores((prev) => ({
      ...prev,
      [campo]: {
        ...prev[campo],
        [tipo]: limpio,
      },
    }));
  };

  const guardar = async () => {
    if (!areaId || !responsable) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Faltan datos",
        timer: 1200,
        showConfirmButton: false,
      });
      return;
    }

    const body = {
      fecha: new Date().toISOString().split("T")[0],
      responsable,
      area_id: Number(areaId),

      sanitarios_c: Number(valores?.[1]?.c || 0),
      sanitarios_nc: Number(valores?.[1]?.nc || 0),

      orinales_c: Number(valores?.[2]?.c || 0),
      orinales_nc: Number(valores?.[2]?.nc || 0),

      duchas_c: Number(valores?.[3]?.c || 0),
      duchas_nc: Number(valores?.[3]?.nc || 0),

      lavamanos_c: Number(valores?.[4]?.c || 0),
      lavamanos_nc: Number(valores?.[4]?.nc || 0),

      llaves_c: Number(valores?.[5]?.c || 0),
      llaves_nc: Number(valores?.[5]?.nc || 0),

      observacion,
    };

    try {
      await fetch("/api/inspecciones-sanitarias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const res = await fetch("/api/inspecciones-sanitarias");
      const data = await res.json();
      setInspecciones(data);

      setValores({});
      setObservacion("");
      setAreaId("");
      setBusquedaArea("");

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Guardado correctamente",
        timer: 1200,
        showConfirmButton: false,
      });

    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
      });
    }
  };

  return (
    <>
    {mostrarModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-3">

    <div
      className={`w-full max-w-md rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] border transition-all
      ${
        modoNoche
          ? "bg-[#0f0f0f] border-[#2a2a2a] text-white"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >

      {/* 🔴 HEADER */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-5 py-4 flex items-center gap-3">
        <img src="/img/envia3.png" className="w-8 h-8 rounded-full shadow-md" />

        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            Inspección sanitaria
          </span>
          <span className="text-[11px] opacity-80">
            Registro de condiciones
          </span>
        </div>

        <button
          onClick={() => setMostrarModal(false)}
          className="ml-auto text-lg hover:scale-110 transition"
        >
          ✕
        </button>
      </div>

      <div className="p-5 space-y-4">

        {/* RESPONSABLE */}
        <div
          className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition
          ${
            modoNoche
              ? "bg-[#181818] border-[#2e2e2e]"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <User className="text-red-500" size={18} />
          <input
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            placeholder="Responsable"
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        {/* AREA */}
        <div
          className={`relative flex items-center gap-3 px-3 py-3 rounded-xl border transition
          ${
            modoNoche
              ? "bg-[#181818] border-[#2e2e2e]"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <MapPin className="text-blue-500" size={18} />

          <input
            value={busquedaArea}
            onChange={(e) => {
              setBusquedaArea(e.target.value);
              setMostrarLista(true);
            }}
            placeholder="Buscar o seleccionar área..."
            className="w-full bg-transparent outline-none text-sm"
          />

          {/* LISTA */}
          {mostrarLista && (
            <div
              className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-lg max-h-40 overflow-auto z-50 border
              ${
                modoNoche
                  ? "bg-[#1a1a1a] border-[#2e2e2e]"
                  : "bg-white border-gray-200"
              }`}
            >
              {areasFiltradas.length > 0 ? (
                areasFiltradas.map((a: any) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setAreaId(a.id);
                      setBusquedaArea(a.nombre);
                      setMostrarLista(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer transition
                    ${
                      modoNoche
                        ? "hover:bg-[#2a2a2a]"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {a.nombre}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm opacity-60">
                  Sin resultados
                </div>
              )}
            </div>
          )}
        </div>

        {/* CAMPOS */}
        {[
          { key: 1, label: "Sanitarios", icon: <Toilet className="text-blue-500" size={18} /> },
          { key: 2, label: "Orinales", icon: <Droplet className="text-cyan-500" size={18} /> },
          { key: 3, label: "Duchas", icon: <ShowerHead className="text-indigo-500" size={18} /> },
          { key: 4, label: "Lavamanos", icon: <Bath className="text-pink-500" size={18} /> },
          { key: 5, label: "Llaves", icon: <Droplet className="text-blue-400" size={18} /> },
        ].map((c) => (
          <div
            key={c.key}
            className={`rounded-xl p-3 border transition
            ${
              modoNoche
                ? "bg-[#181818] border-[#2e2e2e]"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              {c.icon}
              <span className="text-sm font-semibold">{c.label}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="✔ Cumple"
                value={valores?.[c.key]?.c || ""}
                onChange={(e) => handleChange(c.key, "c", e.target.value)}
                className={`p-2 rounded-lg border text-center text-sm transition
                ${
                  modoNoche
                    ? "bg-[#0f0f0f] border-[#2e2e2e] focus:border-green-500"
                    : "bg-white border-gray-200 focus:border-green-500"
                }`}
              />

              <input
                placeholder="✖ No cumple"
                value={valores?.[c.key]?.nc || ""}
                onChange={(e) => handleChange(c.key, "nc", e.target.value)}
                className={`p-2 rounded-lg border text-center text-sm transition
                ${
                  modoNoche
                    ? "bg-[#0f0f0f] border-[#2e2e2e] focus:border-red-500"
                    : "bg-white border-gray-200 focus:border-red-500"
                }`}
              />
            </div>
          </div>
        ))}

        {/* OBS */}
        <textarea
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          placeholder="Observaciones..."
          className={`w-full p-3 rounded-xl border text-sm transition
          ${
            modoNoche
              ? "bg-[#181818] border-[#2e2e2e] focus:border-blue-500"
              : "bg-gray-50 border-gray-200 focus:border-blue-500"
          }`}
        />

        {/* BOTONES */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={guardar}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-2 rounded-xl font-semibold shadow-md transition"
          >
            Guardar
          </button>

          <button
            onClick={() => setMostrarModal(false)}
            className={`flex-1 py-2 rounded-xl font-medium transition
            ${
              modoNoche
                ? "bg-[#1a1a1a] border border-[#2e2e2e] hover:bg-[#222]"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  </div>
)}
    </>
  );
}
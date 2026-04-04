"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  User,
  MapPin,
  Lightbulb,
  LampDesk,
  Fan,
  Search,
  X,
} from "lucide-react";

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

export default function MovilEnergia({
  dataBackend = [],
  setInspecciones,
  mostrarModal,
  setMostrarModal,
  modoNoche,
}: Props) {
  const [responsable, setResponsable] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("responsable") || "";
    }
    return "";
  });

  const [areaId, setAreaId] = useState("");
  const [busquedaArea, setBusquedaArea] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [valores, setValores] = useState<ValoresType>({});

  const areasFiltradas = Array.isArray(dataBackend)
    ? dataBackend.filter((a: any) =>
        String(a?.nombre || "")
          .toLowerCase()
          .includes(busquedaArea.toLowerCase())
      )
    : [];

  useEffect(() => {
    localStorage.setItem("responsable", responsable);
  }, [responsable]);

  useEffect(() => {
    const areaExacta = areasFiltradas.find(
      (a: any) =>
        String(a?.nombre || "").toLowerCase().trim() ===
        busquedaArea.toLowerCase().trim()
    );

    if (areaExacta) {
      setAreaId(String(areaExacta.id));
    }
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

  const totalGeneral =
    Number(valores?.[1]?.c || 0) +
    Number(valores?.[1]?.nc || 0) +
    Number(valores?.[2]?.c || 0) +
    Number(valores?.[2]?.nc || 0) +
    Number(valores?.[3]?.c || 0) +
    Number(valores?.[3]?.nc || 0) +
    Number(valores?.[4]?.c || 0) +
    Number(valores?.[4]?.nc || 0);

const guardar = async () => {
  if (!responsable.trim() || !areaId) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Debes completar responsable y área",
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  const hoy = new Date().toISOString().split("T")[0];

  // 🔥 VALIDACIÓN DUPLICADO
  const yaExiste = await fetch("/api/inspecciones-energia")
    .then(res => res.json())
    .then((data) => {
      return data.some((item: any) => {
        return (
          item.area_id === Number(areaId) &&
          item.responsable === responsable &&
          item.fecha?.split("T")[0] === hoy
        );
      });
    });

  if (yaExiste) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "⚠️ Ya elegiste esta área hoy",
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  if (guardando) return;
  setGuardando(true);

  try {
    const body = {
      fecha: hoy,
      responsable: responsable.trim(),
      area_id: Number(areaId),

      bombillas_c: Number(valores?.[1]?.c || 0),
      bombillas_nc: Number(valores?.[1]?.nc || 0),

      reflectores_c: Number(valores?.[2]?.c || 0),
      reflectores_nc: Number(valores?.[2]?.nc || 0),

      lamparas_c: Number(valores?.[3]?.c || 0),
      lamparas_nc: Number(valores?.[3]?.nc || 0),

      aires_c: Number(valores?.[4]?.c || 0),
      aires_nc: Number(valores?.[4]?.nc || 0),

      observacion: observacion.trim(),
      total: totalGeneral,
    };

    const response = await fetch("/api/inspecciones-energia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "No se pudo guardar");
    }

    // 🔥 refrescar tabla
    const res = await fetch("/api/inspecciones-energia");
    const data = await res.json();
    const dataFinal = Array.isArray(data) ? data : data?.data || [];

    setInspecciones(dataFinal);

    // 🔥 LIMPIAR SOLO CAMPOS (NO RESPONSABLE)
    setValores({});
    setObservacion("");
    setAreaId("");
    setBusquedaArea("");

    // 🔥 ALERTA BONITA
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Guardado correctamente",
      timer: 1400,
      showConfirmButton: false,
    });

    // ❌ NO CERRAR MODAL (QUITAMOS ESTO)
    // setMostrarModal(false);

  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "Error al guardar",
      text: error?.message || "Ocurrió un problema",
    });
  } finally {
    setGuardando(false);
  }
};

  const campos = [
    {
      key: 1,
      label: "Bombillas",
      icon: <Lightbulb className="text-yellow-500" size={18} />,
    },
    {
      key: 2,
      label: "Reflectores",
      icon: <Search className="text-blue-500" size={18} />,
    },
    {
      key: 3,
      label: "Lámparas",
      icon: <LampDesk className="text-fuchsia-500" size={18} />,
    },
    {
      key: 4,
      label: "Aires acondicionados",
      icon: <Fan className="text-cyan-500" size={18} />,
    },
  ];

  return (
    <>
    {mostrarModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3">
    <div
      className={`w-full max-w-md rounded-3xl overflow-hidden border shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all ${
        modoNoche
          ? "bg-[#0f0f0f] border-[#2a2a2a] text-white"
          : "bg-white border-gray-200 text-gray-800"
      }`}
      onClick={(e) => e.stopPropagation()}
    >

      {/* 🔴 HEADER ENVIA */}
      <div className="bg-gradient-to-r from-red-700 to-red-500 text-white px-5 py-4 flex items-center gap-3">
        
        <img src="/img/envia3.png" className="w-9 h-9 rounded-full shadow-md" />

        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            Inspección de energía
          </span>
          <span className="text-[11px] opacity-85">
            Control de equipos eléctricos
          </span>
        </div>

        <button
          onClick={() => setMostrarModal(false)}
          className="ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-4">

        {/* RESPONSABLE */}
        <div
          className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition ${
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
  onClick={(e) => e.stopPropagation()}
  className={`relative flex items-center gap-3 px-3 py-3 rounded-xl border transition ${
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
    onFocus={() => setMostrarLista(true)}
    onBlur={() => {
      setTimeout(() => setMostrarLista(false), 200);
    }}
    placeholder="Buscar o seleccionar área..."
    className="w-full bg-transparent outline-none text-sm"
  />

  {mostrarLista && (
    <div
      className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-lg max-h-44 overflow-auto z-50 border ${
        modoNoche
          ? "bg-[#1a1a1a] border-[#2e2e2e]"
          : "bg-white border-gray-200"
      }`}
    >
      {areasFiltradas.length > 0 ? (
        areasFiltradas.map((a: any) => (
          <div
            key={a.id}
            onMouseDown={(e) => {
              e.preventDefault();
              setAreaId(String(a.id));
              setBusquedaArea(a.nombre);
              setMostrarLista(false);
            }}
            className={`px-3 py-2 text-sm cursor-pointer transition ${
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
        {campos.map((c) => (
          <div
            key={c.key}
            className={`rounded-xl p-3 border transition ${
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
                onChange={(e) =>
                  handleChange(c.key, "c", e.target.value)
                }
                className={`p-2 rounded-lg border text-center text-sm transition ${
                  modoNoche
                    ? "bg-[#0f0f0f] border-[#2e2e2e] text-white focus:border-green-500"
                    : "bg-white border-gray-200 focus:border-green-500"
                }`}
              />

              <input
                placeholder="✖ No cumple"
                value={valores?.[c.key]?.nc || ""}
                onChange={(e) =>
                  handleChange(c.key, "nc", e.target.value)
                }
                className={`p-2 rounded-lg border text-center text-sm transition ${
                  modoNoche
                    ? "bg-[#0f0f0f] border-[#2e2e2e] text-white focus:border-red-500"
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
          className={`w-full p-3 rounded-xl border text-sm transition ${
            modoNoche
              ? "bg-[#181818] border-[#2e2e2e] text-white focus:border-blue-500"
              : "bg-gray-50 border-gray-200 focus:border-blue-500"
          }`}
        />

        {/* BOTONES */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={guardar}
            className="flex-1 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white py-2.5 rounded-xl font-semibold shadow-md transition"
          >
            Guardar
          </button>

          <button
            onClick={() => setMostrarModal(false)}
            className={`flex-1 py-2.5 rounded-xl font-medium transition ${
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
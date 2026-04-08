"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Recycle,
  Trash2,
  AlertTriangle,
  Lock,
  User,
  MapPin
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

export default function MovilReciclaje({
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
  const [valores, setValores] = useState<ValoresType>({});
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [busquedaArea, setBusquedaArea] = useState("");
  const [mostrarLista, setMostrarLista] = useState(false);

  const areasFiltradas = dataBackend.filter((a: any) =>
    a.nombre.toLowerCase().includes(busquedaArea.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem("responsable", responsable);
  }, [responsable]);


  useEffect(() => {
    const areaExacta = dataBackend.find(
      (a: any) =>
        a.nombre.toLowerCase() === busquedaArea.toLowerCase()
    );

    if (areaExacta) {
      setAreaId(areaExacta.id);
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

    // 🔥 VALIDACIÓN DUPLICADO
    // 🔥 VALIDACIÓN REAL (POR DÍA + ÁREA + RESPONSABLE)
    const hoy = new Date().toISOString().split("T")[0];

    const yaExiste = await fetch("/api/inspecciones-residuos")
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
        title: "⚠️ Ya creaste esta área hoy",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    if (guardando) return;
    setGuardando(true);

    try {
      const body = {
        fecha: new Date().toISOString().split("T")[0],
        responsable,
        area_id: Number(areaId),

        reciclables_c: Number(valores?.[1]?.c || 0),
        reciclables_nc: Number(valores?.[1]?.nc || 0),

        ordinarios_c: Number(valores?.[2]?.c || 0),
        ordinarios_nc: Number(valores?.[2]?.nc || 0),

        peligrosos_c: Number(valores?.[3]?.c || 0),
        peligrosos_nc: Number(valores?.[3]?.nc || 0),

        presintos_c: Number(valores?.[4]?.c || 0),
        presintos_nc: Number(valores?.[4]?.nc || 0),

        observacion,
      };

      await fetch("/api/inspecciones-residuos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const res = await fetch("/api/inspecciones-residuos");
      const data = await res.json();
      setInspecciones(data);

      // 🔥 LIMPIAR CAMPOS
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

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">

          <div
            className={`w-[95%] max-w-md rounded-2xl overflow-hidden shadow-2xl transition-all
            ${modoNoche
                ? "bg-[#0d0d0d] border border-white/10 text-white"
                : "bg-white border border-gray-200 text-gray-800"
              }`}
          >

            {/* 🔴 HEADER */}
            <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-3">

              {/* LOGO */}
              <img src="/img/logo.png" className="w-7 h-7" />

              <span className="font-semibold text-sm">
                Nueva inspección
              </span>

              <button
                onClick={() => setMostrarModal(false)}
                className="ml-auto"
              >
                ✕
              </button>
            </div>



            <div className="p-4 space-y-4">

              {/* RESPONSABLE */}
              <div
                className={`flex items-center gap-2 p-3 rounded-xl border transition
    ${modoNoche
                    ? "bg-[#161616] border-white/10 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-800"
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
                onClick={(e) => e.stopPropagation()} // 🔥 CLAVE
                className={`relative flex items-center gap-2 p-3 rounded-xl border transition
  ${modoNoche
                    ? "bg-[#161616] border-white/10 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-800"
                  }`}
              >
                <MapPin className="text-blue-500" size={18} />

                {/* INPUT BUSCADOR */}
                <input
                  value={busquedaArea}
                  onChange={(e) => {
                    setBusquedaArea(e.target.value);
                    setMostrarLista(true);
                  }}
                  onFocus={() => setMostrarLista(true)}
                  onBlur={() => {
                    setTimeout(() => setMostrarLista(false), 200); // 🔥 CLAVE
                  }}
                  placeholder="Buscar o seleccionar área..."
                  className="w-full bg-transparent outline-none text-sm"
                />

                {/* LISTA DESPLEGABLE */}
                {mostrarLista && (
                  <div
                    className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto
      ${modoNoche
                        ? "bg-[#1a1a1a] border border-white/10"
                        : "bg-white border border-gray-200"
                      }`}
                  >
                    {areasFiltradas.length > 0 ? (
                      areasFiltradas.map((a: any) => (
                        <div
                          key={a.id}
                          onMouseDown={(e) => {
                            e.preventDefault(); // 🔥 CLAVE
                            setAreaId(a.id);
                            setBusquedaArea(a.nombre);
                            setMostrarLista(false);
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer transition
            ${modoNoche
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
                {
                  key: 1,
                  label: "Reciclables",
                  icon: <Recycle className="text-green-500" size={18} />
                },
                {
                  key: 2,
                  label: "Ordinarios",
                  icon: <Trash2 className="text-gray-500" size={18} />
                },
                {
                  key: 3,
                  label: "Peligrosos",
                  icon: <AlertTriangle className="text-yellow-500" size={18} />
                },
                {
                  key: 4,
                  label: "Presintos",
                  icon: <Lock className="text-blue-500" size={18} />
                },
              ].map((c) => (
                <div
                  key={c.key}
                  className={`rounded-xl p-3 border transition
      ${modoNoche
                      ? "bg-[#161616] border-white/10"
                      : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {c.icon}
                    <span className="font-semibold text-sm">{c.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={valores?.[c.key]?.c || ""}
                      placeholder="✔ Cumple"
                      onChange={(e) =>
                        handleChange(c.key, "c", e.target.value)
                      }
                      className={`p-2 rounded-lg border text-center text-sm transition
          ${modoNoche
                          ? "bg-[#0d0d0d] border-white/10 text-white focus:border-green-500"
                          : "bg-white border-gray-200 focus:border-green-500"
                        }`}
                    />

                    <input
                      value={valores?.[c.key]?.nc || ""}
                      placeholder="✖ No cumple"
                      onChange={(e) =>
                        handleChange(c.key, "nc", e.target.value)
                      }
                      className={`p-2 rounded-lg border text-center text-sm transition
          ${modoNoche
                          ? "bg-[#0d0d0d] border-white/10 text-white focus:border-red-500"
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
                placeholder="Observación"
                className={`w-full p-3 rounded-xl border text-sm transition
    ${modoNoche
                    ? "bg-[#161616] border-white/10 text-white focus:border-blue-500"
                    : "bg-gray-50 border-gray-200 focus:border-blue-500"
                  }`}
              />

              {/* BOTONES */}
              <div className="flex gap-2">
                <button
                  onClick={guardar}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition"
                >
                  Guardar
                </button>

                <button
                  onClick={() => setMostrarModal(false)}
                  className={`flex-1 py-2 rounded-xl transition
      ${modoNoche
                      ? "bg-[#1a1a1a] border border-white/10 hover:bg-[#222]"
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
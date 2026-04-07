"use client";

import { useEffect, useState } from "react";
import React from "react";
import Swal from "sweetalert2";
import {
  Search,
  Filter,
  TrendingUp,
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle,
  User,
  Bolt,
  Zap,
} from "lucide-react";
import { CreditCard } from "lucide-react";
import { generarReciboEnergia } from "@/app/utils/reciboEnergia";

interface Props {
  modoNoche: boolean;
}

const meses = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

export default function ComparativoEnergia({ modoNoche }: Props) {
  const [datosEnergia, setDatosEnergia] = useState<any[]>([]);
  const [sedesDB, setSedesDB] = useState<any[]>([]);

  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const futureYears = 6;

  const [anio, setAnio] = useState(currentYear.toString());
  const [mes, setMes] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [mostrarTotales, setMostrarTotales] = useState(true);
  const [consumoMin, setConsumoMin] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tipoTotal, setTipoTotal] = useState("todos");

  const years = Array.from(
    { length: currentYear - startYear + 1 + futureYears },
    (_, i) => startYear + i
  );

  const inputsRef = React.useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);

  const [nuevaFila, setNuevaFila] = useState({
    nombre: "",
    ubicacion: "",
    cuenta: "",
    datos: Array.from({ length: 12 }, () => ({
      kWh: 0,
      valor: 0,
      cumple: true,
    })),
  });

  const fondo = modoNoche
    ? "bg-[#0f0f0f] text-white"
    : "bg-[#ffffff] text-gray-800";

  const card = modoNoche
    ? "bg-[#1b1b1b] border border-gray-700"
    : "bg-white border border-gray-200 shadow";

  const formatearNumeroInput = (valor: any) => {
    if (valor === null || valor === undefined || valor === "") return "";
    const numero = Number(String(valor).replace(/\./g, "").replace(/,/g, ""));
    if (isNaN(numero)) return "";
    return numero.toLocaleString("es-CO");
  };

  const limpiarNumeroEntero = (valor: string) => {
    return valor.replace(/\./g, "").replace(/[^0-9]/g, "");
  };

  const limpiarNumeroDecimal = (valor: string) => {
    let limpio = valor.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const partes = limpio.split(".");
    if (partes.length > 2) {
      limpio = partes[0] + "." + partes[1];
    }
    return limpio;
  };

  const editarNuevaFila = (campo: string, valor: any) => {
    setNuevaFila((prev) => ({ ...prev, [campo]: valor }));
  };

  const editarFila = (filaIndex: number, campo: string, valor: any) => {
    setDatosEnergia((prev) => {
      const nuevos = [...prev];
      nuevos[filaIndex] = { ...nuevos[filaIndex], [campo]: valor };
      return nuevos;
    });
  };

  const editarCelda = (
    filaIndex: number,
    mesIndex: number,
    campo: string,
    valor: any
  ) => {
    setDatosEnergia((prev) =>
      prev.map((fila, i) => {
        if (i !== filaIndex) return fila;

        return {
          ...fila,
          datos: fila.datos.map((celda: any, j: number) => {
            if (j !== mesIndex) return celda;

            return {
              ...celda,
              [campo]:
                campo === "cumple"
                  ? valor === true || valor === "true"
                  : valor === ""
                  ? null
                  : Number(valor),
            };
          }),
        };
      })
    );
  };

  const manejarTeclas = (
    e: React.KeyboardEvent,
    fila: number,
    col: number
  ) => {
    const totalFilas = inputsRef.current.length;
    const totalCols = inputsRef.current[0]?.length || 0;

    let nuevaFila = fila;
    let nuevaCol = col;

    switch (e.key) {
      case "ArrowRight":
        nuevaCol = col + 1;
        break;
      case "ArrowLeft":
        nuevaCol = col - 1;
        break;
      case "ArrowDown":
        nuevaFila = fila + 1;
        break;
      case "ArrowUp":
        nuevaFila = fila - 1;
        break;
      default:
        return;
    }

    e.preventDefault();

    if (
      nuevaFila >= 0 &&
      nuevaFila < totalFilas &&
      nuevaCol >= 0 &&
      nuevaCol < totalCols
    ) {
      inputsRef.current[nuevaFila][nuevaCol]?.focus();
    }
  };

  const cargarSedes = async () => {
    try {
      const res = await fetch("/api/sedes");
      const data = await res.json();

      if (!Array.isArray(data)) {
        setSedesDB([]);
        return;
      }

      setSedesDB(data);
    } catch {
      console.log("Error cargando sedes");
      setSedesDB([]);
    }
  };

  const cargarDatos = async () => {
    try {
      const [resComparativo, resSedes] = await Promise.all([
        fetch("/api/comparativoEnergia"),
        fetch("/api/sedes"),
      ]);

      let data = await resComparativo.json();
      let sedes = await resSedes.json();

      if (!Array.isArray(data)) data = [];
      if (!Array.isArray(sedes)) sedes = [];

      setSedesDB(sedes);

      const anioActual = Number(anio);

      const resultado = sedes.map((sede: any) => {
        const datosMeses = Array.from({ length: 12 }, (_, mesIndex) => {
          const encontrado = data.find(
            (d: any) =>
              d.sede_id === sede.id &&
              Number(d.anio) === anioActual &&
              Number(d.mes) === mesIndex + 1
          );

          return {
            kWh: encontrado?.kw_consumidos ?? null,
            valor: encontrado?.valor_consumo_energia ?? null,
            cumple: encontrado?.cumple ?? true,
          };
        });

        return {
          id: sede.id,
          sede_id: sede.id,
          nombre: sede.nombre,
          ubicacion: sede.ubicacion,
          cuenta: sede.cuenta,
          anio: anioActual,
          datos: datosMeses,
        };
      });

      setDatosEnergia(resultado);
    } catch (error) {
      console.error("Error cargando datos:", error);

      Swal.fire({
        icon: "error",
        title: "Error cargando datos",
      });
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarSedes();
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [anio]);

  const actualizarSede = async (fila: any) => {
    try {
      const res = await fetch("/api/sedes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: fila.sede_id || fila.id,
          nombre: fila.nombre,
          ubicacion: fila.ubicacion,
          cuenta: fila.cuenta,
        }),
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Sede actualizada",
        showConfirmButton: false,
        timer: 1000,
      });

      await cargarSedes();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error actualizando sede",
      });
    }
  };

  const guardarRegistro = async (fila: any, mesIndex: number) => {
    try {
      const mesData = fila.datos?.[mesIndex];
      if (!mesData) return;

      const sede = sedesDB.find((s) => s.id === fila.sede_id);
      if (!sede) return;

      const payload = {
        sede_id: sede.id,
        anio: Number(anio),
        mes: mesIndex + 1,
        kw_consumidos:
          mesData.kWh === null || mesData.kWh === ""
            ? null
            : Number(mesData.kWh),
        valor_consumo_energia:
          mesData.valor === null || mesData.valor === ""
            ? null
            : Number(mesData.valor),
        cumple: mesData.cumple,
      };

      const res = await fetch("/api/comparativoEnergia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("ERROR BACKEND:", error);
        throw new Error(error || "Error desconocido");
      }

      setDatosEnergia((prev) =>
        prev.map((f) =>
          f.sede_id === fila.sede_id
            ? {
                ...f,
                datos: f.datos.map((d: any, i: number) =>
                  i === mesIndex
                    ? {
                        ...d,
                        kWh: payload.kw_consumidos,
                        valor: payload.valor_consumo_energia,
                        cumple: payload.cumple,
                      }
                    : d
                ),
              }
            : f
        )
      );

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Actualizado con éxito",
        showConfirmButton: false,
        timer: 1200,
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error guardando datos",
      });
    }
  };

  const crearRegistro = async () => {
    try {
      let sede = sedesDB.find((s) => s.nombre === nuevaFila.nombre);

      if (!sede) {
        const res = await fetch("/api/sedes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nuevaFila.nombre,
            ubicacion: nuevaFila.ubicacion,
            cuenta: nuevaFila.cuenta,
          }),
        });

        const data = await res.json();
        sede = data.data;
      }

      const nueva = {
        ...nuevaFila,
        sede_id: sede.id,
        anio: Number(anio),
      };

      setDatosEnergia((prev) => [...prev, nueva]);

      setNuevaFila({
        nombre: "",
        ubicacion: "",
        cuenta: "",
        datos: Array.from({ length: 12 }, () => ({
          kWh: 0,
          valor: 0,
          cumple: true,
        })),
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Sede creada",
        timer: 1000,
        showConfirmButton: false,
      });

      await cargarDatos();
      await cargarSedes();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error creando sede",
      });
    }
  };

  const confirmarEliminarFila = async (fila: any) => {
    const result = await Swal.fire({
      title: "¿Eliminar sede?",
      text: "Se eliminará la sede y sus datos de energía",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`/api/comparativoEnergia/por-sede/${fila.sede_id}`, {
          method: "DELETE",
        });

        const res = await fetch(`/api/sedes?id=${fila.sede_id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error();

        setDatosEnergia((prev) => prev.filter((f) => f.sede_id !== fila.sede_id));
        setSedesDB((prev) => prev.filter((s) => s.id !== fila.sede_id));

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Borrado con éxito",
          timer: 1200,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);

        Swal.fire({
          icon: "error",
          title: "No se pudo eliminar",
        });
      }
    }
  };

  const datosFiltrados = datosEnergia.filter((d) => {
    const texto = busqueda.toLowerCase();

    const matchBusqueda =
      (d.nombre || "").toLowerCase().includes(texto) ||
      (d.ubicacion || "").toLowerCase().includes(texto);

    const matchAnio = anio === "" || Number(d.anio) === Number(anio);

    const matchSede =
      sedeSeleccionada === "" || d.nombre === sedeSeleccionada;

    const matchMes =
      mes === "" || Number(d.datos?.[Number(mes)]?.kWh || 0) >= 0;

    const matchConsumo =
      consumoMin === "" ||
      d.datos.some((m: any) => Number(m.kWh || 0) >= Number(consumoMin));

    let matchTipo = true;

    if (tipoTotal === "principal") {
      matchTipo = d.nombre?.toUpperCase().includes("SEDE PPAL");
    }

    if (tipoTotal === "receptorias") {
      matchTipo = d.nombre?.toUpperCase().includes("RECEPTORIA");
    }

    return (
      matchBusqueda &&
      matchAnio &&
      matchSede &&
      matchMes &&
      matchConsumo &&
      matchTipo
    );
  });

  const sedes = Array.from(
    new Set(datosEnergia.map((d) => d.nombre).filter(Boolean))
  );

  const renderResumenTotal = (
    lista: any[],
    mesReal: number,
    claseFila: string
  ) => {
    const totalKwh = lista.reduce(
      (acc: number, d: any) => acc + Number(d.datos?.[mesReal]?.kWh || 0),
      0
    );

    const totalValor = lista.reduce(
      (acc: number, d: any) => acc + Number(d.datos?.[mesReal]?.valor || 0),
      0
    );

    return (
      <table
        className={`w-full text-xs font-semibold border ${
          modoNoche ? "border-[#333]" : "border-gray-300"
        }`}
      >
        <tbody>
          <tr>
            <td
              className={`border px-2 py-1 text-center ${claseFila} ${
                modoNoche ? "border-[#333]" : "border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Zap size={13} />
                {formatearNumeroInput(totalKwh)} kWh
              </div>
            </td>

            <td
              className={`border px-2 py-1 text-center text-green-500 ${
                modoNoche ? "border-[#333]" : "border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <DollarSign size={13} />
                ${Number(totalValor || 0).toLocaleString("es-CO")}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderTabla = (inicio: number, fin: number) => (
    <div
      className={`overflow-x-auto rounded-xl shadow-sm border ${
        modoNoche ? "border-[#333]" : "border-gray-300"
      }`}
    >
      <table
        className={`w-full text-xs border-collapse table-auto ${
          modoNoche ? "text-white" : "text-gray-800"
        }`}
      >
        <thead>
          <tr>
            <th
              colSpan={3 + meses.slice(inicio, fin).length * 3}
              className={`p-4 text-center text-lg font-bold tracking-wide
              ${
                modoNoche
                  ? "bg-[#111] text-yellow-400 border border-[#333]"
                  : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border border-gray-300"
              }`}
            >
              REGISTRO CONSUMO DE ENERGÍA SEGÚN FACTURACIÓN
            </th>
          </tr>

          <tr
            className={`text-sm ${
              modoNoche
                ? "bg-[#1f1f1f] text-white"
                : "bg-gradient-to-r from-yellow-200 to-yellow-400 text-gray-800"
            }`}
          >
            <th
              rowSpan={2}
              className={`p-3 border ${
                modoNoche ? "border-[#333]" : "border-gray-300"
              } text-left`}
            >
              <div className="flex items-center gap-2">
                <User size={16} /> Nombre
              </div>
            </th>

            <th
              rowSpan={2}
              className={`p-3 border ${
                modoNoche ? "border-[#333]" : "border-gray-300"
              } text-left`}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} /> Ubicación
              </div>
            </th>

            <th
              rowSpan={2}
              className={`p-3 border ${
                modoNoche ? "border-[#333]" : "border-gray-300"
              } text-center`}
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCard size={16} /> Cuenta
              </div>
            </th>

            {meses.slice(inicio, fin).map((mesNombre, i) => (
              <th
                key={i}
                className={`border p-2 text-center font-semibold ${
                  modoNoche ? "border-[#333]" : "border-gray-300"
                }`}
                colSpan={3}
              >
                {mesNombre}
              </th>
            ))}
          </tr>

          <tr className={`${modoNoche ? "bg-[#2a2a2a]" : "bg-yellow-100"} text-xs`}>
            {meses.slice(inicio, fin).map((_, i) => (
              <React.Fragment key={i}>
                <th
                  className={`border p-2 ${
                    modoNoche ? "border-[#333]" : "border-gray-300"
                  }`}
                >
                  <div className="flex justify-center gap-1 items-center">
                    <Zap size={14} /> kWh
                  </div>
                </th>

                <th
                  className={`border p-2 ${
                    modoNoche ? "border-[#333]" : "border-gray-300"
                  }`}
                >
                  <div className="flex justify-center gap-1 items-center">
                    <DollarSign size={14} /> Valor
                  </div>
                </th>

                <th
                  className={`border p-2 ${
                    modoNoche ? "border-[#333]" : "border-gray-300"
                  }`}
                >
                  <div className="flex justify-center gap-1 items-center">
                    <CheckCircle size={14} /> C
                  </div>
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {datosFiltrados.map((fila: any, i: number) => (
            <tr
              key={i}
              className={`transition ${
                modoNoche
                  ? i % 2 === 0
                    ? "bg-[#141414] hover:bg-[#1e1e1e]"
                    : "bg-[#181818] hover:bg-[#222]"
                  : i % 2 === 0
                  ? "bg-white hover:bg-yellow-50"
                  : "bg-gray-50 hover:bg-yellow-50"
              }`}
            >
              <td
                className={`border px-3 py-2 min-w-[200px] ${
                  modoNoche ? "border-[#333]" : "border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between group">
                  <input
                    value={fila.nombre ?? ""}
                    ref={(el) => {
                      if (!inputsRef.current[i]) inputsRef.current[i] = [];
                      inputsRef.current[i][0] = el;
                    }}
                    onKeyDown={(e) => {
                      manejarTeclas(e, i, 0);

                      if (e.key === "Enter") {
                        actualizarSede(fila);
                      }
                    }}
                    className={`w-full outline-none font-semibold text-sm ${
                      modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"
                    }`}
                    onChange={(e) => editarFila(i, "nombre", e.target.value)}
                  />

                  <button
                    onClick={() => confirmarEliminarFila(fila)}
                    className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 text-xs ml-2"
                    title="Eliminar fila"
                  >
                    ✕
                  </button>
                </div>
              </td>

              <td
                className={`border px-3 py-2 min-w-[220px] ${
                  modoNoche ? "border-[#333]" : "border-gray-300"
                }`}
              >
                <input
                  value={fila.ubicacion ?? ""}
                  ref={(el) => {
                    if (!inputsRef.current[i]) inputsRef.current[i] = [];
                    inputsRef.current[i][1] = el;
                  }}
                  onKeyDown={(e) => {
                    manejarTeclas(e, i, 1);

                    if (e.key === "Enter") {
                      actualizarSede(fila);
                    }
                  }}
                  className={`w-full outline-none text-sm ${
                    modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"
                  }`}
                  onChange={(e) => editarFila(i, "ubicacion", e.target.value)}
                />
              </td>

              <td
                className={`border px-3 py-2 text-center min-w-[120px] ${
                  modoNoche ? "border-[#333]" : "border-gray-300"
                }`}
              >
                <input
                  value={fila.cuenta ?? ""}
                  ref={(el) => {
                    if (!inputsRef.current[i]) inputsRef.current[i] = [];
                    inputsRef.current[i][2] = el;
                  }}
                  onKeyDown={(e) => {
                    manejarTeclas(e, i, 2);

                    if (e.key === "Enter") {
                      actualizarSede(fila);
                    }
                  }}
                  className={`w-full outline-none text-center text-sm ${
                    modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"
                  }`}
                  onChange={(e) => editarFila(i, "cuenta", e.target.value)}
                />
              </td>

              {fila.datos.slice(inicio, fin).map((d: any, j: number) => {
                const colBase = 3 + j * 3;

                return (
                  <React.Fragment key={j}>
                    <td
                      className={`border p-1 text-center ${
                        modoNoche ? "border-[#333]" : "border-gray-300"
                      }`}
                    >
                      <input
                        value={d.kWh ?? ""}
                        placeholder="0"
                        inputMode="decimal"
                        ref={(el) => {
                          if (!inputsRef.current[i]) inputsRef.current[i] = [];
                          inputsRef.current[i][colBase] = el;
                        }}
                        onKeyDown={(e) => {
                          manejarTeclas(e, i, colBase);

                          if (e.key === "Enter") {
                            guardarRegistro(fila, inicio + j);
                          }

                          if (e.key === "Delete" || e.key === "Backspace") {
                            editarCelda(i, inicio + j, "kWh", "");
                          }
                        }}
                        className={`w-20 text-center rounded-md border text-sm outline-none transition ${
                          modoNoche
                            ? "bg-[#2a2a2a] border-[#444] text-white"
                            : "bg-gray-100 border-gray-300 text-gray-800"
                        }`}
                        onChange={(e) => {
                          const valor = limpiarNumeroDecimal(e.target.value);
                          editarCelda(i, inicio + j, "kWh", valor);
                        }}
                      />
                    </td>

                    <td
                      className={`border p-1 text-center ${
                        modoNoche ? "border-[#333]" : "border-gray-300"
                      }`}
                    >
                      <input
                        value={formatearNumeroInput(d.valor)}
                        placeholder="0"
                        inputMode="numeric"
                        ref={(el) => {
                          if (!inputsRef.current[i]) inputsRef.current[i] = [];
                          inputsRef.current[i][colBase + 1] = el;
                        }}
                        onKeyDown={(e) => {
                          manejarTeclas(e, i, colBase + 1);

                          if (e.key === "Enter") {
                            guardarRegistro(fila, inicio + j);
                          }

                          if (e.key === "Delete" || e.key === "Backspace") {
                            editarCelda(i, inicio + j, "valor", "");
                          }
                        }}
                        className={`w-24 text-center rounded-md border text-sm outline-none transition ${
                          modoNoche
                            ? "bg-[#2a2a2a] border-[#444] text-white"
                            : "bg-gray-100 border-gray-300 text-gray-800"
                        }`}
                        onChange={(e) => {
                          const valorLimpio = limpiarNumeroEntero(e.target.value);
                          editarCelda(i, inicio + j, "valor", valorLimpio);
                        }}
                      />
                    </td>

                    <td
                      className={`border p-1 text-center ${
                        modoNoche ? "border-[#333]" : "border-gray-300"
                      }`}
                    >
                      <select
                        value={d.cumple ? "true" : "false"}
                        ref={(el) => {
                          if (!inputsRef.current[i]) inputsRef.current[i] = [];
                          inputsRef.current[i][colBase + 2] = el;
                        }}
                        onKeyDown={(e) => manejarTeclas(e, i, colBase + 2)}
                        className={`text-lg font-bold cursor-pointer rounded-md px-1
                        ${d.cumple ? "text-green-500" : "text-red-500"}
                        ${modoNoche ? "bg-[#1f1f1f]" : "bg-white"}`}
                        onChange={(e) => {
                          const nuevoValor = e.target.value === "true";

                          editarCelda(i, inicio + j, "cumple", nuevoValor);

                          guardarRegistro(
                            {
                              ...fila,
                              datos: fila.datos.map((item: any, idx: number) =>
                                idx === inicio + j
                                  ? { ...item, cumple: nuevoValor }
                                  : item
                              ),
                            },
                            inicio + j
                          );
                        }}
                      >
                        <option value="true">✔</option>
                        <option value="false">✖</option>
                      </select>
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}

          <tr className={`${modoNoche ? "bg-[#202020]" : "bg-yellow-50"}`}>
            <td className="border border-gray-300 p-3">
              <input
                value={nuevaFila.nombre}
                placeholder="Nombre sede"
                className={`w-full rounded-md px-3 py-2 border ${
                  modoNoche
                    ? "bg-[#2a2a1f] border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                onChange={(e) => editarNuevaFila("nombre", e.target.value)}
              />
            </td>

            <td className="border border-gray-300 p-3">
              <input
                value={nuevaFila.ubicacion}
                placeholder="Ubicación"
                className={`w-full rounded-md px-3 py-2 border ${
                  modoNoche
                    ? "bg-[#2a2a1f] border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                onChange={(e) => editarNuevaFila("ubicacion", e.target.value)}
              />
            </td>

            <td className="border border-gray-300 p-3 text-center">
              <input
                value={nuevaFila.cuenta}
                placeholder="Cuenta"
                className={`w-full rounded-md px-3 py-2 text-center border ${
                  modoNoche
                    ? "bg-[#2a2a1f] border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                onChange={(e) => editarNuevaFila("cuenta", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    crearRegistro();
                  }
                }}
              />
            </td>
          </tr>

          {mostrarTotales && (
            <tr
              className={`font-bold ${
                modoNoche
                  ? "bg-[#202020] text-yellow-200"
                  : "bg-yellow-50 text-yellow-800"
              }`}
            >
              <td colSpan={3} className="border border-gray-300 p-3 text-left">
                TOTAL SEDE PRINCIPAL
              </td>

              {meses.slice(inicio, fin).map((_, i) => (
                <td
                  key={i}
                  colSpan={3}
                  className="border border-gray-300 text-center p-3"
                >
                  {renderResumenTotal(
                    datosEnergia.filter((d) =>
                      d.nombre?.toUpperCase().includes("SEDE PPAL")
                    ),
                    inicio + i,
                    "text-yellow-500"
                  )}
                </td>
              ))}
            </tr>
          )}

          <tr
            className={`font-bold ${
              modoNoche
                ? "bg-[#202020] text-yellow-100"
                : "bg-yellow-100 text-yellow-900"
            }`}
          >
            <td colSpan={3} className="border border-gray-300 p-3 text-left">
              TOTAL SOLO RECEPTORIAS
            </td>

            {meses.slice(inicio, fin).map((_, i) => (
              <td
                key={i}
                colSpan={3}
                className="border border-gray-300 text-center p-3"
              >
                {renderResumenTotal(
                  datosEnergia.filter((d) =>
                    d.nombre?.toUpperCase().includes("RECEPTORIA")
                  ),
                  inicio + i,
                  "text-yellow-500"
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={`min-h-screen p-8 ${fondo}`}>
      <div className="max-w-[1700px] mx-auto space-y-8">
        <div className="flex items-center gap-1">
          <div></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
            ${card} shadow-lg hover:scale-[1.02] transition`}
          >
            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                ⚡ Consumo total
              </p>

              <h2 className="text-3xl font-bold text-yellow-500 mt-2">
                {formatearNumeroInput(
                  datosEnergia.reduce(
                    (acc, d) =>
                      acc +
                      d.datos.reduce((a: any, b: any) => a + Number(b.kWh || 0), 0),
                    0
                  )
                )}{" "}
                kWh
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg">
              <Zap size={30} />
            </div>

            <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500 opacity-20 rounded-full blur-2xl"></div>
          </div>

          <div
            className={`p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden
            ${card} shadow-lg hover:scale-[1.02] transition`}
          >
            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                📄 Comparativo general
              </p>

              <p className="text-xs opacity-60 mt-1">
                Exporta un resumen completo en PDF
              </p>
            </div>

            <button
              onClick={() => generarReciboEnergia(datosEnergia)}
              className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition"
            >
              ⚡ Descargar PDF
            </button>

            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-yellow-500 opacity-20 rounded-full blur-2xl"></div>
          </div>

          <div
            className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
            ${card} shadow-lg hover:scale-[1.02] transition`}
          >
            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                🏢 Sedes activas
              </p>

              <h2 className="text-3xl font-bold text-yellow-500 mt-2">
                {datosEnergia.length}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg">
              <Building2 size={30} />
            </div>

            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-yellow-500 opacity-20 rounded-full blur-2xl"></div>
          </div>

          <div
            className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
            ${card} shadow-lg hover:scale-[1.02] transition`}
          >
            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                ⚡ Total Energía
              </p>

              <h2 className="text-3xl font-bold text-yellow-600 mt-2">
                $
                {datosEnergia
                  .reduce(
                    (acc, d) =>
                      acc +
                      d.datos.reduce((a: any, b: any) => a + Number(b.valor || 0), 0),
                    0
                  )
                  .toLocaleString("es-CO")}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg">
              <Bolt size={30} />
            </div>

            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-yellow-500 opacity-20 rounded-full blur-2xl"></div>
          </div>
        </div>

        <div
          className={`p-6 rounded-2xl ${card} shadow-md border ${
            modoNoche ? "border-[#333]" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-yellow-500/10 shadow-[0_0_12px_rgba(234,179,8,0.4)]">
              <Filter size={20} className="text-yellow-500" />
            </div>

            <div>
              <h3 className="font-semibold text-lg tracking-wide">
                Filtros Avanzados
              </h3>
              <p className="text-xs opacity-60">
                Filtra el consumo de energía por diferentes criterios
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 w-full">
            <div className="relative group">
              <Search
                size={16}
                className="absolute left-3 top-3 text-gray-400 group-focus-within:text-yellow-500 transition"
              />

              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar sede o ubicación..."
                className={`w-full p-3 pl-10 rounded-xl border text-sm transition shadow-sm
                ${
                  modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-yellow-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-yellow-400"
                }`}
              />
            </div>

            <div className="relative group">
              <Calendar
                size={16}
                className="absolute left-3 top-3 text-gray-400 group-focus-within:text-yellow-500 transition"
              />

              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium transition shadow-sm
                ${
                  modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-yellow-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-yellow-400"
                }`}
              >
                <option value="">Todos los años</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative group">
              <TrendingUp
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />

              <select
                value={tipoTotal}
                onChange={(e) => setTipoTotal(e.target.value)}
                className={`w-full p-3 pl-10 rounded-xl border text-sm shadow-sm
                ${
                  modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="todos">Todos</option>
                <option value="principal">Total sede principal</option>
                <option value="receptorias">Total receptorías</option>
              </select>
            </div>

            <div className="relative group">
              <Building2
                size={16}
                className="absolute left-3 top-3 text-gray-400 group-focus-within:text-yellow-500 transition"
              />

              <select
                value={sedeSeleccionada}
                onChange={(e) => setSedeSeleccionada(e.target.value)}
                className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium transition shadow-sm
                ${
                  modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-yellow-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-yellow-400"
                }`}
              >
                <option value="">Todas las sedes</option>
                {sedes.map((sede, i) => (
                  <option key={i} value={sede}>
                    {sede}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative group">
              <Zap
                size={16}
                className="absolute left-3 top-3 text-gray-400 group-focus-within:text-yellow-500 transition"
              />

              <input
                type="number"
                value={consumoMin}
                onChange={(e) => setConsumoMin(e.target.value)}
                placeholder="Consumo mínimo (kWh)"
                className={`w-full p-3 pl-10 rounded-xl border text-sm transition shadow-sm
                ${
                  modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-yellow-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-yellow-400"
                }`}
              />
            </div>
          </div>
        </div>

        <div className={`rounded-xl overflow-auto ${card}`}>{renderTabla(0, 4)}</div>
        <div className={`rounded-xl overflow-auto ${card}`}>{renderTabla(4, 8)}</div>
        <div className={`rounded-xl overflow-auto ${card}`}>{renderTabla(8, 12)}</div>
      </div>
    </div>
  );
}
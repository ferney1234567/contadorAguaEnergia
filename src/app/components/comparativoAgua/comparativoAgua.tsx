"use client";

import { useEffect, useState } from "react";
import React from "react";
import Swal from "sweetalert2";
import { Search, Filter, Droplets, TrendingUp, Building2, DollarSign, MapPin, Calendar, CheckSquare, CheckCircle, User } from "lucide-react";
import { CreditCard } from "lucide-react";
import { generarReciboPDF } from "../../utils/recibo";
interface Props {
  modoNoche: boolean;
}

const meses = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

export default function ComparativoAgua({ modoNoche }: Props) {
  const [datosEnergia, setDatosEnergia] = useState<any[]>([]);
  const currentYear = new Date().getFullYear();
  const [anio, setAnio] = useState(currentYear.toString());
  const [mes, setMes] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [mostrarTotales, setMostrarTotales] = useState(true);
  const [consumoMin, setConsumoMin] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const startYear = 2025;
  const futureYears = 6; // hasta 2031 inicialmente
  const inputsRef = React.useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
  const years = Array.from({ length: (currentYear - startYear + 1) + futureYears }, (_, i) => startYear + i);
  const [nuevaFila, setNuevaFila] = useState({ nombre: "", ubicacion: "", cuenta: "", datos: Array.from({ length: 12 }, () => ({ M3: 0, valor: 0, cumple: true })) });
  const editarNuevaFila = (campo: string, valor: any) => { setNuevaFila(prev => ({ ...prev, [campo]: valor })); };
  const editarFila = (filaIndex: number, campo: string, valor: any) => {
    const nuevosDatos = [...datosEnergia]; nuevosDatos[filaIndex] = { ...nuevosDatos[filaIndex], [campo]: valor }; setDatosEnergia(nuevosDatos);
  };
  const [sedesDB, setSedesDB] = useState<any[]>([]);
  const [tipoTotal, setTipoTotal] = useState("todos");
  // valores: "todos" | "principal" | "receptorias"
  const editarNuevaCelda = (mesIndex: number, campo: string, valor: any) => {
    const nuevosDatos = [...nuevaFila.datos];
    if (campo === "M3") {
      nuevosDatos[mesIndex].M3 = Number(valor);
    }
    if (campo === "valor") {
      nuevosDatos[mesIndex].valor = Number(valor);
    }
    if (campo === "cumple") {
      nuevosDatos[mesIndex].cumple = valor === "true";
    }
    setNuevaFila({
      ...nuevaFila,
      datos: nuevosDatos
    });
  };

  useEffect(() => {
    cargarDatos();
    cargarSedes();
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [anio]);

  const cargarSedes = async () => {
    try {
      const res = await fetch("/api/sedes");
      const data = await res.json();
      setSedesDB(data);
    } catch {
      console.log("Error cargando sedes");
    }
  };


  const cargarDatos = async () => {
    try {
      const [resComparativo, resSedes] = await Promise.all([
        fetch("/api/comparativoAgua"),
        fetch("/api/sedes")
      ]);

      let data = await resComparativo.json();
      const sedes = await resSedes.json();

      // 🔥 FIX ERROR data.find
      if (!Array.isArray(data)) {
        console.error("Comparativo no es array:", data);
        data = [];
      }

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
            M3: encontrado?.m3_consumidos ?? null,
            valor: encontrado?.valor_consumo_agua ?? null,
            cumple: encontrado?.cumple ?? true
          };

        });

        return {
          id: sede.id,
          sede_id: sede.id,
          nombre: sede.nombre,
          ubicacion: sede.ubicacion,
          cuenta: sede.cuenta,
          anio: anioActual,
          datos: datosMeses
        };
      });

      setDatosEnergia(resultado);

    } catch (error) {
      console.error("Error cargando datos:", error);

      Swal.fire({
        icon: "error",
        title: "Error cargando datos"
      });
    }
  };
  const agregarFila = () => {
    const nuevaFila = {
      nombre: "NUEVA SEDE",
      ubicacion: "",
      cuenta: "",
      datos: Array.from({ length: 12 }, () => ({
        M3: 0,
        valor: 0,
        cumple: true
      }))
    };

    setDatosEnergia([...datosEnergia, nuevaFila]);

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Fila agregada",
      showConfirmButton: false,
      timer: 1200
    });

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

    // evitar salir del rango
    if (
      nuevaFila >= 0 &&
      nuevaFila < totalFilas &&
      nuevaCol >= 0 &&
      nuevaCol < totalCols
    ) {
      inputsRef.current[nuevaFila][nuevaCol]?.focus();
    }

  };


  const editarCelda = (filaIndex: number, mesIndex: number, campo: string, valor: any) => {

    setDatosEnergia(prev =>
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
                  ? (valor === true || valor === "true")
                  : valor === "" ? null : Number(valor)
            };

          })
        };

      })
    );

  };
  const fondo = modoNoche
    ? "bg-[#0f0f0f] text-white"
    : "bg-[#ffffff] text-gray-800";

  const card = modoNoche
    ? "bg-[#1b1b1b] border border-gray-700"
    : "bg-white border border-gray-200 shadow";

  const formatearNumeroInput = (valor: any) => {
    if (valor === null || valor === undefined || valor === "") return "";
    const numero = Number(String(valor).replace(/\./g, ""));
    if (isNaN(numero)) return "";
    return numero.toLocaleString("es-CO");
  };

  const limpiarNumero = (valor: string) => {
    return valor.replace(/\./g, "").replace(/[^0-9]/g, "");
  };

  const datosFiltrados = datosEnergia.filter((d) => {

    const texto = busqueda.toLowerCase();

    const matchBusqueda =
      (d.nombre || "").toLowerCase().includes(texto) ||
      (d.ubicacion || "").toLowerCase().includes(texto);

    const matchAnio =
      anio === "" || Number(d.anio) === Number(anio);

    const matchSede =
      sedeSeleccionada === "" || d.nombre === sedeSeleccionada;

    // 🔥 FILTRO POR TIPO
    let matchTipo = true;

    if (tipoTotal === "principal") {
      matchTipo = d.nombre?.toUpperCase().includes("SEDE PPAL");
    }

    if (tipoTotal === "receptorias") {
      matchTipo = d.nombre?.toUpperCase().includes("RECEPTORIA");
    }

    return matchBusqueda && matchAnio && matchSede && matchTipo;

  });

  const crearRegistro = async () => {
    try {

      let sede = sedesDB.find(s => s.nombre === nuevaFila.nombre);

      if (!sede) {
        const res = await fetch("/api/sedes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevaFila)
        });

        const data = await res.json();
        sede = data.data;
      }

      const nueva = {
        ...nuevaFila,
        sede_id: sede.id,
        anio: Number(anio),
        datos: nuevaFila.datos
      };

      // 🔥 AGREGAR DIRECTO AL FRONT
      setDatosEnergia(prev => [...prev, nueva]);

      setNuevaFila({
        nombre: "",
        ubicacion: "",
        cuenta: "",
        datos: Array.from({ length: 12 }, () => ({
          M3: 0,
          valor: 0,
          cumple: true
        }))
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Sede creada",
        timer: 1000,
        showConfirmButton: false
      });

    } catch {
      Swal.fire({
        icon: "error",
        title: "Error creando sede"
      });
    }
  };
  const calcularTotales = (tipo: string, mes: number): number => {

    return datosEnergia
      .filter((d: any) => d.tipo === tipo)
      .reduce((acc: number, d: any) => {

        if (!d.datos[mes]) return acc;

        return acc + (d.datos[mes].M3 || 0);

      }, 0);

  };
  const guardarRegistro = async (fila: any, mesIndex: number) => {
    try {
      const mesData = fila.datos?.[mesIndex];
      if (!mesData) return;

      const sede = sedesDB.find(s => s.id === fila.sede_id);
      if (!sede) return;

      const payload = {
        sede_id: sede.id,
        anio: Number(anio),
        mes: mesIndex + 1,
        m3_consumidos:
          mesData.M3 === null || mesData.M3 === "" ? null : Number(mesData.M3),
        valor_consumo_agua:
          mesData.valor === null || mesData.valor === "" ? null : Number(mesData.valor),
        cumple: mesData.cumple,
      };

      const res = await fetch(`/api/comparativoAgua`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      setDatosEnergia(prev =>
        prev.map(f =>
          f.sede_id === fila.sede_id
            ? {
              ...f,
              datos: f.datos.map((d: any, i: number) =>
                i === mesIndex
                  ? {
                    ...d,
                    M3: payload.m3_consumidos,
                    valor: payload.valor_consumo_agua,
                    cumple: payload.cumple
                  }
                  : d
              )
            }
            : f
        )
      );

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Actualizado con éxito",
        timer: 1200,
        showConfirmButton: false
      });

    } catch {
      Swal.fire({
        icon: "error",
        title: "Error actualizando"
      });
    }
  };

  const actualizarSede = async (fila: any) => {
    try {

      const res = await fetch("/api/sedes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: fila.sede_id || fila.id,
          nombre: fila.nombre,
          ubicacion: fila.ubicacion,
          cuenta: fila.cuenta
        })
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Sede actualizada",
        showConfirmButton: false,
        timer: 1000
      });

      await cargarSedes();

    } catch {
      Swal.fire({
        icon: "error",
        title: "Error actualizando sede"
      });
    }
  };

  const confirmarEliminarFila = async (fila: any) => {
    const result = await Swal.fire({
      title: "¿Eliminar sede?",
      text: "Se eliminará la sede y sus datos",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {

        // 🔥 1. BORRAR PRIMERO COMPARATIVO (IMPORTANTE)
        await fetch(`/api/comparativoAgua/por-sede/${fila.sede_id}`, {
          method: "DELETE"
        });

        // 🔥 2. BORRAR SEDE
        const res = await fetch(`/api/sedes?id=${fila.sede_id}`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error();

        // 🔥 3. ACTUALIZAR FRONT SIN RECARGAR TODO
        setDatosEnergia(prev =>
          prev.filter(f => f.sede_id !== fila.sede_id)
        );

        setSedesDB(prev =>
          prev.filter(s => s.id !== fila.sede_id)
        );

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Borrado con éxito",
          timer: 1200,
          showConfirmButton: false
        });

      } catch (err) {
        console.error(err);

        Swal.fire({
          icon: "error",
          title: "No se pudo eliminar"
        });
      }
    }
  };





  const inicio = mes === "" ? 0 : Number(mes);
  const fin = mes === "" ? 12 : Number(mes) + 1;

  const renderTabla = (inicio: number, fin: number) => (

    <div className={`overflow-x-auto rounded-xl shadow-sm border 
${modoNoche ? "border-[#333]" : "border-gray-300"}`}>

      <table className={`w-full text-xs border-collapse table-auto
${modoNoche ? "text-white" : "text-gray-800"}`}>

        <thead>

          <tr>
            <th
              colSpan={3 + (meses.slice(inicio, fin).length * 3)}
              className={`p-4 text-center text-lg font-bold tracking-wide
    ${modoNoche
                  ? "bg-[#111] text-cyan-400 border border-[#333]"
                  : "bg-blue-400 text-white border border-gray-300"}
    `}
            >
              REGISTRO CONSUMO DE AGUA SEGÚN FACTURACIÓN
            </th>
          </tr>


          <tr className={`text-sm
${modoNoche
              ? "bg-[#1f1f1f] text-white"
              : "bg-blue-200 text-gray-800"}`}>

            <th rowSpan={2} className={`p-3 border ${modoNoche ? "border-[#333]" : "border-gray-300"} text-left`}>
              <div className="flex items-center gap-2">
                <User size={16} /> Nombre
              </div>
            </th>

            <th rowSpan={2} className={`p-3 border ${modoNoche ? "border-[#333]" : "border-gray-300"} text-left`}>
              <div className="flex items-center gap-2">
                <MapPin size={16} /> Ubicación
              </div>
            </th>

            <th rowSpan={2} className={`p-3 border ${modoNoche ? "border-[#333]" : "border-gray-300"} text-center`}>
              <div className="flex items-center justify-center gap-2">
                <CreditCard size={16} /> Cuenta
              </div>
            </th>

            {meses.slice(inicio, fin).map((mes, i) => (
              <th key={i}
                className={`border p-2 text-center font-semibold
${modoNoche ? "border-[#333]" : "border-gray-300"}`}
                colSpan={3}>
                {mes}
              </th>
            ))}

          </tr>

          <tr className={`${modoNoche ? "bg-[#2a2a2a]" : "bg-blue-100"} text-xs`}>

            {meses.slice(inicio, fin).map((_, i) => (

              <React.Fragment key={i}>

                <th className={`border p-2 ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
                  <div className="flex justify-center gap-1 items-center">
                    <Droplets size={14} /> M³
                  </div>
                </th>

                <th className={`border p-2 ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
                  <div className="flex justify-center gap-1 items-center">
                    <DollarSign size={14} /> Valor
                  </div>
                </th>

                <th className={`border p-2 ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
                  <div className="flex justify-center gap-1 items-center">
                    <CheckCircle size={14} /> C
                  </div>
                </th>

              </React.Fragment>

            ))}

          </tr>

        </thead>
        <tbody>

          {/* FILAS */}
          {datosFiltrados.map((fila: any, i: number) => (

            <tr key={i} className={`transition
${modoNoche
                ? i % 2 === 0
                  ? "bg-[#141414] hover:bg-[#1e1e1e]"
                  : "bg-[#181818] hover:bg-[#222]"
                : i % 2 === 0
                  ? "bg-white hover:bg-blue-50"
                  : "bg-gray-50 hover:bg-blue-50"}`}>


              {/* =========================
   NOMBRE
========================= */}
              <td className={`border px-3 py-2 min-w-[200px] 
${modoNoche ? "border-[#333]" : "border-gray-300"}`}>

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
                        actualizarSede(fila); // 🔥 ahora edita sede
                      }
                    }}
                    className={`w-full outline-none font-semibold text-sm ${modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"
                      }`}
                    onChange={(e) => editarFila(i, "nombre", e.target.value)}
                  />

                  {/* 🔥 BOTÓN ELIMINAR */}
                  <button
                    onClick={() => confirmarEliminarFila(fila)}
                    className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 text-xs ml-2"
                    title="Eliminar fila"
                  >
                    ✕
                  </button>

                </div>

              </td>

              {/* =========================
   UBICACION
========================= */}
              <td className={`border px-3 py-2 min-w-[220px] ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
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
                  className={`w-full outline-none text-sm ${modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"
                    }`}
                  onChange={(e) => editarFila(i, "ubicacion", e.target.value)}
                />
              </td>

              {/* =========================
   CUENTA
========================= */}
              <td className={`border px-3 py-2 text-center min-w-[120px] ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
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
                  className={`w-full outline-none text-center text-sm ${modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"
                    }`}
                  onChange={(e) => editarFila(i, "cuenta", e.target.value)}
                />
              </td>

              {/* =========================
   MESES DINÁMICOS
========================= */}
              {fila.datos.slice(inicio, fin).map((d: any, j: number) => {
                const colBase = 3 + j * 3;

                return (
                  <React.Fragment key={j}>

                    {/* =========================
         M3
      ========================= */}
                   {/* =========================
   M3
========================= */}
<td className={`border p-1 text-center ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
  <input
    value={formatearNumeroInput(d.M3)}
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
        editarCelda(i, inicio + j, "M3", "");
      }
    }}
    className={`w-20 text-center rounded-md border text-sm outline-none transition
      ${modoNoche
        ? "bg-[#2a2a2a] border-[#444] text-white"
        : "bg-gray-100 border-gray-300 text-gray-800"}`}
    onChange={(e) => {
      // 🔥 permite números y punto decimal
      let valor = e.target.value.replace(/[^0-9.]/g, "");

      // evitar más de un punto
      const partes = valor.split(".");
      if (partes.length > 2) {
        valor = partes[0] + "." + partes[1];
      }

      editarCelda(i, inicio + j, "M3", valor);
    }}
  />
</td>

                    {/* =========================
         VALOR
      ========================= */}
                   {/* =========================
   VALOR
========================= */}
<td className={`border p-1 text-center ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
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
    className={`w-24 text-center rounded-md border text-sm outline-none transition
      ${modoNoche
        ? "bg-[#2a2a2a] border-[#444] text-white"
        : "bg-gray-100 border-gray-300 text-gray-800"}`}
    onChange={(e) => {
      const valorLimpio = limpiarNumero(e.target.value);
      editarCelda(i, inicio + j, "valor", valorLimpio);
    }}
  />
</td>

                    {/* =========================
         CUMPLE
      ========================= */}
                    <td className={`border p-1 text-center ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
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
                                idx === (inicio + j)
                                  ? { ...item, cumple: nuevoValor }
                                  : item
                              )
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

          {/* NUEVA FILA */}
          <tr
            className={`${modoNoche ? "bg-[#202020]" : "bg-blue-50"

              }`}
          >
            {/* NOMBRE */}
            <td className="border border-gray-300 p-3">
              <input
                value={nuevaFila.nombre}
                placeholder="Nombre sede"
                className={`w-full rounded-md px-3 py-2 border ${modoNoche
                  ? "bg-[#202020] border-gray-500 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                onChange={(e) => editarNuevaFila("nombre", e.target.value)}
              />
            </td>

            {/* UBICACIÓN */}
            <td className="border border-gray-300 p-3">
              <input
                value={nuevaFila.ubicacion}
                placeholder="Ubicación"
                className={`w-full rounded-md px-3 py-2 border ${modoNoche
                  ? "bg-[#202020] border-gray-500 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                onChange={(e) => editarNuevaFila("ubicacion", e.target.value)}
              />
            </td>

            {/* CUENTA */}
            <td className="border border-gray-300 p-3 text-center">
              <input
                value={nuevaFila.cuenta}
                placeholder="Cuenta"
                className={`w-full rounded-md px-3 py-2 text-center border ${modoNoche
                  ? "bg-[#202020] border-gray-500 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-400`}
                onChange={(e) => editarNuevaFila("cuenta", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    crearRegistro();
                  }
                }}
              />
            </td>
          </tr>
          {/* TOTAL PRINCIPAL */}
          {mostrarTotales && (
            <tr
              className={`font-bold ${modoNoche
                ? "bg-[#181818] text-white"
                : "bg-blue-100 text-blue-800"
                }`}
            >
              <td colSpan={3} className="border border-gray-300 p-3">
                TOTAL SEDE PRINCIPAL
              </td>

              {meses.slice(inicio, fin).map((_, i) => (
                <td
                  key={i}
                  colSpan={3}
                  className="border border-gray-300 text-center p-3"
                >
                  {(() => {
                    const totalM3 = datosEnergia
                      .filter((d) =>
                        d.nombre?.toUpperCase().includes("SEDE PPAL")
                      )
                      .reduce(
                        (acc: any, d: any) =>
                          acc + Number(d.datos?.[inicio + i]?.M3 || 0),
                        0
                      );

                    const totalValor = datosEnergia
                      .filter((d) =>
                        d.nombre?.toUpperCase().includes("SEDE PPAL")
                      )
                      .reduce(
                        (acc: any, d: any) =>
                          acc + Number(d.datos?.[inicio + i]?.valor || 0),
                        0
                      );

                    return (
                      <table className={`w-full text-xs font-semibold border 
  ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>

                        <tbody>
                          <tr>

                            {/* M3 */}
                            <td className={`border px-2 py-1 text-blue-500 text-center 
        ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
                              <div className="flex items-center justify-center gap-1">
                                <Droplets size={13} />
                                {totalM3} m³
                              </div>
                            </td>

                            {/* VALOR */}
                            <td className={`border px-2 py-1 text-green-500 text-center 
        ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
                              <div className="flex items-center justify-center gap-1">
                                <DollarSign size={13} />
                                ${totalValor.toLocaleString()}
                              </div>
                            </td>

                          </tr>
                        </tbody>

                      </table>
                    );
                  })()}

                </td>
              ))}
            </tr>
          )}

          {/* TOTAL RECEPTORIAS */}
          <tr
            className={`font-bold ${modoNoche
              ? "bg-[#202020] text-gray-200"
              : "bg-blue-50 text-blue-700"
              }`}
          >
            <td colSpan={3} className="border border-gray-300 p-3">
              TOTAL SOLO RECEPTORIAS
            </td>

            {meses.slice(inicio, fin).map((_, i) => (
              <td
                key={i}
                colSpan={3}
                className="border border-gray-300 text-center p-3"
              >
                {(() => {
                  const totalM3 = datosEnergia
                    .filter((d) =>
                      d.nombre?.toUpperCase().includes("RECEPTORIA")
                    )
                    .reduce(
                      (acc: any, d: any) =>
                        acc + Number(d.datos?.[inicio + i]?.M3 || 0),
                      0
                    );

                  const totalValor = datosEnergia
                    .filter((d) =>
                      d.nombre?.toUpperCase().includes("RECEPTORIA")
                    )
                    .reduce(
                      (acc: any, d: any) =>
                        acc + Number(d.datos?.[inicio + i]?.valor || 0),
                      0
                    );

                  return (
                    <table className={`w-full text-xs font-semibold border 
  ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>

                      <tbody>
                        <tr>

                          {/* M3 */}
                          <td className={`border px-2 py-1 text-blue-500 text-center 
        ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
                            <div className="flex items-center justify-center gap-1">
                              <Droplets size={13} />
                              {totalM3} m³
                            </div>
                          </td>

                          {/* VALOR */}
                          <td className={`border px-2 py-1 text-green-500 text-center 
        ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
                            <div className="flex items-center justify-center gap-1">
                              <DollarSign size={13} />
                              ${totalValor.toLocaleString()}
                            </div>
                          </td>

                        </tr>
                      </tbody>

                    </table>
                  );
                })()}

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

        {/* HEADER */}

        <div className="flex items-center gap-1">


          <div>



          </div>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* CONSUMO TOTAL */}

          <div className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                💧 Consumo total
              </p>

              <h2 className="text-3xl font-bold text-blue-500 mt-2">
                {datosEnergia.reduce((acc, d) => acc +
                  d.datos.reduce((a: any, b: any) => a + b.M3, 0), 0)} m³
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
              <Droplets size={30} />
            </div>

            {/* Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-2xl"></div>

          </div>


          {/* EXPORTAR */}

          <div className={`p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                📄 Comparativo general
              </p>

              <p className="text-xs opacity-60 mt-1">
                Exporta un resumen completo en PDF
              </p>
            </div>

            <button
              onClick={() => generarReciboPDF(datosEnergia)}
              className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition"
            >
              📥 Descargar PDF
            </button>

            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-500 opacity-20 rounded-full blur-2xl"></div>

          </div>


          {/* SEDES */}

          <div className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                🏢 Sedes activas
              </p>

              <h2 className="text-3xl font-bold text-emerald-500 mt-2">
                {datosEnergia.length}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg">
              <Building2 size={30} />
            </div>

            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-green-500 opacity-20 rounded-full blur-2xl"></div>

          </div>


          {/* TOTAL A PAGAR */}

          <div className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

            <div>
              <p className="text-sm opacity-70 flex items-center gap-2">
                💰 Total agua
              </p>

              <h2 className="text-3xl font-bold text-blue-600 mt-2">
                $
                {datosEnergia.reduce((acc, d) => acc +
                  d.datos.reduce((a: any, b: any) => a + b.valor, 0), 0)
                  .toLocaleString()}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
              <DollarSign size={30} />
            </div>

            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>

          </div>

        </div>

        {/* BUSCADOR AVANZADO */}

        <div className={`p-6 rounded-2xl ${card} shadow-md border ${modoNoche ? "border-[#333]" : "border-gray-200"}`}>

          {/* HEADER */}
          <div className="flex items-center gap-3 mb-6">

            <div className="p-2 rounded-xl bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
              <Filter size={20} className="text-blue-500" />
            </div>

            <div>
              <h3 className="font-semibold text-lg tracking-wide">
                Filtros Avanzados
              </h3>
              <p className="text-xs opacity-60">
                Filtra el consumo de agua por diferentes criterios
              </p>
            </div>

          </div>

          {/* 🔥 GRID FULL WIDTH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">

            {/* AÑO */}
            <div className="relative group w-full">

              <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />

              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium transition shadow-sm
        ${modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400"}
        `}
              >
                <option value="">Todos los años</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

            </div>

            {/* TOTAL */}
            <div className="relative group w-full">

              <TrendingUp size={16} className="absolute left-3 top-3 text-gray-400" />

              <select
                value={tipoTotal}
                onChange={(e) => setTipoTotal(e.target.value)}
                className={`w-full p-3 pl-10 rounded-xl border text-sm shadow-sm
        ${modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white"
                    : "bg-white border-gray-300 text-gray-800"}
        `}
              >
                <option value="todos">Todos</option>
                <option value="principal">Total sede principal</option>
                <option value="receptorias">Total receptorías</option>
              </select>

            </div>

            {/* SEDES */}
            <div className="relative group w-full">

              <Building2 size={16} className="absolute left-3 top-3 text-gray-400" />

              <select
                value={sedeSeleccionada}
                onChange={(e) => setSedeSeleccionada(e.target.value)}
                className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium transition shadow-sm
  ${modoNoche
                    ? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400"}
  `}
              >
                <option value="">Todas las sedes</option>

                {Array.isArray(sedesDB) && sedesDB.map((sede: any) => (
                  <option key={sede.id} value={sede.nombre}>
                    {sede.nombre}
                  </option>
                ))}

              </select>

            </div>

          </div>
        </div>
        <div className={`rounded-xl overflow-auto ${card}`}>

          {renderTabla(0, 4)}
        </div>

        {/* TABLA MAYO - AGOSTO */}
        <div className={`rounded-xl overflow-auto ${card}`}>

          {renderTabla(4, 8)}
        </div>

        {/* TABLA SEPTIEMBRE - DICIEMBRE */}
        <div className={`rounded-xl overflow-auto ${card}`}>

          {renderTabla(8, 12)}
        </div>

      </div>

    </div>


  );
}
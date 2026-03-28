"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  User2,
  Filter,
  History,
  Droplets,
} from "lucide-react";

interface Props {
  data: any[];
  modoNoche?: boolean;
}

type RegistroValores = {
  [fila: number]: {
    [campo: number]: {
      c?: string;
      nc?: string;
    };
  };
};

type RegistroObservaciones = {
  [fila: number]: string;
};

export default function TablaAgua({ data = [], modoNoche = false }: Props) {
  const campos = [
    { key: 1, nombre: "Sanitarios", img: "/img/sanitario.png" },
    { key: 2, nombre: "Orinales", img: "/img/orinales.webp" },
    { key: 3, nombre: "Duchas", img: "/img/duchas.webp" },
    { key: 4, nombre: "Lavamanos", img: "/img/lavamanos.avif" },
    { key: 5, nombre: "Llaves", img: "/img/llaves.png" },
  ];

  const [valores, setValores] = useState<RegistroValores>({});
  const [observaciones, setObservaciones] = useState<RegistroObservaciones>({});
  const [responsable, setResponsable] = useState("");
  const [fechaActual, setFechaActual] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [anioFiltro, setAnioFiltro] = useState("Todos");
  const [mesFiltro, setMesFiltro] = useState("Todos");
  const [mostrarHistorial, setMostrarHistorial] = useState(true);

  useEffect(() => {
    const actualizarFecha = () => {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setFechaActual(fecha.charAt(0).toUpperCase() + fecha.slice(1));
    };

    actualizarFecha();
    const interval = setInterval(actualizarFecha, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (
    fila: number,
    campo: number,
    tipo: "c" | "nc",
    value: string
  ) => {
    const limpio = value.replace(/\D/g, "");

    setValores((prev) => ({
      ...prev,
      [fila]: {
        ...prev[fila],
        [campo]: {
          ...prev[fila]?.[campo],
          [tipo]: limpio,
        },
      },
    }));
  };

  const handleObs = (fila: number, value: string) => {
    setObservaciones((prev) => ({
      ...prev,
      [fila]: value,
    }));
  };

  const estilos = {
    fondo: modoNoche
      ? "bg-[#111111] text-white border border-[#2b2b2b]"
      : "bg-white text-gray-800 border border-gray-200",

    tarjeta: modoNoche
      ? "bg-[#181818] border border-[#2e2e2e] shadow-[0_8px_25px_rgba(0,0,0,0.25)]"
      : "bg-white border border-gray-200 shadow-[0_8px_25px_rgba(0,0,0,0.06)]",

    titulo: modoNoche ? "text-white" : "text-gray-800",

    subtitulo: modoNoche ? "text-gray-300" : "text-gray-500",

    input: modoNoche
      ? "bg-[#222] border border-[#3a3a3a] text-white placeholder:text-gray-400"
      : "bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400",

    inputSuave: modoNoche
      ? "bg-[#202020] border border-[#363636] text-white"
      : "bg-gray-50 border border-gray-200 text-gray-700",

    header: modoNoche
      ? "bg-[#161616] text-gray-200"
      : "bg-blue-50 text-gray-700",

    fila: modoNoche
      ? "bg-[#111111] hover:bg-[#1b1b1b]"
      : "bg-white hover:bg-blue-50/40",

    borde: modoNoche ? "border-[#303030]" : "border-gray-200",

    linea: modoNoche ? "border-[#3a3a3a]" : "border-gray-200",

    totalGeneral: modoNoche
      ? "bg-[#1a1a1a] text-gray-200"
      : "bg-[#f0f9ff] text-gray-700",

    chip: modoNoche
      ? "bg-[#202020] text-gray-200 border border-[#353535]"
      : "bg-blue-50 text-blue-700 border border-blue-100",

    icono: modoNoche
      ? "bg-[#1f1f1f] text-blue-300 border border-[#353535]"
      : "bg-blue-50 text-blue-600 border border-blue-100",
  };

  const obtenerAnio = (fila: any) => {
    if (fila?.anio) return String(fila.anio);

    if (fila?.fecha) {
      const d = new Date(fila.fecha);
      if (!isNaN(d.getTime())) return String(d.getFullYear());
    }

    return "Sin año";
  };

  const obtenerMes = (fila: any) => {
    if (fila?.mes) return String(fila.mes);

    if (fila?.fecha) {
      const d = new Date(fila.fecha);
      if (!isNaN(d.getTime())) {
        return String(d.getMonth() + 1).padStart(2, "0");
      }
    }

    return "Sin mes";
  };

  const nombreMes = (mes: string) => {
    const meses: Record<string, string> = {
      "01": "Enero",
      "02": "Febrero",
      "03": "Marzo",
      "04": "Abril",
      "05": "Mayo",
      "06": "Junio",
      "07": "Julio",
      "08": "Agosto",
      "09": "Septiembre",
      "10": "Octubre",
      "11": "Noviembre",
      "12": "Diciembre",
      "1": "Enero",
      "2": "Febrero",
      "3": "Marzo",
      "4": "Abril",
      "5": "Mayo",
      "6": "Junio",
      "7": "Julio",
      "8": "Agosto",
      "9": "Septiembre",
    };

    return meses[mes] || mes;
  };

  const aniosDisponibles = useMemo(() => {
    const setAnios = new Set<string>();
    data.forEach((fila) => setAnios.add(obtenerAnio(fila)));
    return ["Todos", ...Array.from(setAnios)];
  }, [data]);

  const mesesDisponibles = useMemo(() => {
    const setMeses = new Set<string>();
    data.forEach((fila) => setMeses.add(obtenerMes(fila)));
    return ["Todos", ...Array.from(setMeses)];
  }, [data]);

  const dataFiltrada = useMemo(() => {
    return data.filter((fila) => {
      const area = String(fila?.area || "").toLowerCase();
      const textoBusqueda = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !textoBusqueda || area.includes(textoBusqueda);

      const anio = obtenerAnio(fila);
      const mes = obtenerMes(fila);

      const coincideAnio = anioFiltro === "Todos" || anio === anioFiltro;
      const coincideMes = mesFiltro === "Todos" || mes === mesFiltro;

      return coincideBusqueda && coincideAnio && coincideMes;
    });
  }, [data, busqueda, anioFiltro, mesFiltro]);

  const totalCampoFila = (fila: number, campo: number) => {
    const c = Number(valores?.[fila]?.[campo]?.c || 0);
    const nc = Number(valores?.[fila]?.[campo]?.nc || 0);
    return c + nc;
  };

  const totalFila = (fila: number) => {
    let total = 0;
    campos.forEach((c) => {
      total += totalCampoFila(fila, c.key);
    });
    return total;
  };

  const totalCampoGeneral = (campo: number) => {
    let total = 0;

    dataFiltrada.forEach((fila: any) => {
      const indiceOriginal = data.indexOf(fila);
      total += totalCampoFila(indiceOriginal, campo);
    });

    return total;
  };

  const totalGeneral = () => {
    let total = 0;

    dataFiltrada.forEach((fila: any) => {
      const indiceOriginal = data.indexOf(fila);
      total += totalFila(indiceOriginal);
    });

    return total;
  };

  return (
    <div className={`w-full rounded-3xl p-3 sm:p-4 md:p-6 ${estilos.tarjeta}`}>
      {/* ENCABEZADO */}
      <div className="mb-5 flex flex-col gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`p-2 rounded-2xl ${estilos.icono}`}>
              <Droplets size={18} />
            </div>
          </div>

          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-wide ${estilos.titulo}`}
          >
            Gestión de Agua
          </h2>

          <p className={`mt-1 text-xs sm:text-sm ${estilos.subtitulo}`}>
            Control de inspecciones, filtros e historial en tiempo real
          </p>
        </div>

        {/* FECHA + RESPONSABLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${estilos.inputSuave}`}
          >
            <CalendarDays size={18} />
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs opacity-80">
                Fecha de inspección
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                {fechaActual}
              </span>
            </div>
          </div>

          <div
            className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${estilos.inputSuave}`}
          >
            <User2 size={18} />
            <div className="flex-1">
              <label className="block text-[11px] sm:text-xs mb-1 opacity-80">
                Responsable
              </label>
              <input
                type="text"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Nombre del responsable"
                className={`w-full rounded-xl px-3 py-2 text-sm outline-none ${estilos.input}`}
              />
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className={`rounded-2xl p-3 sm:p-4 ${estilos.inputSuave}`}>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} />
            <h3 className="text-sm sm:text-base font-semibold">
              Filtros de búsqueda
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por área o puesto"
                className={`w-full rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none ${estilos.input}`}
              />
            </div>

            <select
              value={anioFiltro}
              onChange={(e) => setAnioFiltro(e.target.value)}
              className={`rounded-xl px-3 py-2.5 text-sm outline-none ${estilos.input}`}
            >
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  Año: {anio}
                </option>
              ))}
            </select>

            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className={`rounded-xl px-3 py-2.5 text-sm outline-none ${estilos.input}`}
            >
              {mesesDisponibles.map((mes) => (
                <option key={mes} value={mes}>
                  Mes: {mes === "Todos" ? "Todos" : nombreMes(mes)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition ${estilos.input}`}
            >
              <History size={16} />
              {mostrarHistorial ? "Ocultar historial" : "Mostrar historial"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs ${estilos.chip}`}>
              Registros visibles: {dataFiltrada.length}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs ${estilos.chip}`}>
              Responsable: {responsable || "Sin asignar"}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs ${estilos.chip}`}>
              Fecha: {fechaActual}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      {mostrarHistorial && (
        <>
          {/* MOVIL */}
          <div className="block lg:hidden space-y-4">
            {dataFiltrada.map((fila: any) => {
              const indiceOriginal = data.indexOf(fila);

              return (
                <div
                  key={indiceOriginal}
                  className={`rounded-2xl p-3 border ${estilos.borde} ${estilos.fila}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">
                        {fila.area}
                      </h4>
                      <p className={`text-[11px] sm:text-xs ${estilos.subtitulo}`}>
                        Año: {obtenerAnio(fila)} | Mes: {nombreMes(obtenerMes(fila))}
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${estilos.chip}`}
                    >
                      Total: {totalFila(indiceOriginal)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {campos.map((c) => (
                      <div
                        key={c.key}
                        className={`rounded-xl border p-3 ${estilos.borde}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={c.img}
                            alt={c.nombre}
                            className="w-8 h-8 object-contain"
                          />
                          <span className="text-sm font-semibold">
                            {c.nombre}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] mb-1">C</label>
                            <input
                              value={valores?.[indiceOriginal]?.[c.key]?.c || ""}
                              onChange={(e) =>
                                handleChange(
                                  indiceOriginal,
                                  c.key,
                                  "c",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-lg px-3 py-2 text-sm text-center outline-none ${estilos.input}`}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] mb-1">NC</label>
                            <input
                              value={valores?.[indiceOriginal]?.[c.key]?.nc || ""}
                              onChange={(e) =>
                                handleChange(
                                  indiceOriginal,
                                  c.key,
                                  "nc",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-lg px-3 py-2 text-sm text-center outline-none ${estilos.input}`}
                            />
                          </div>
                        </div>

                        <div className="mt-3 text-center text-sm font-semibold">
                          Total campo: {totalCampoFila(indiceOriginal, c.key)}
                        </div>
                      </div>
                    ))}

                    <div className={`rounded-xl border p-3 ${estilos.borde}`}>
                      <label className="block text-xs mb-2 font-medium">
                        Observaciones
                      </label>
                      <input
                        value={observaciones[indiceOriginal] || ""}
                        onChange={(e) =>
                          handleObs(indiceOriginal, e.target.value)
                        }
                        placeholder="Escribe una observación..."
                        className={`w-full rounded-lg px-3 py-2 text-sm outline-none ${estilos.input}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div
              className={`rounded-2xl p-4 border ${estilos.totalGeneral} ${estilos.borde}`}
            >
              <h3 className="text-center text-sm sm:text-base font-bold mb-3">
                Total General
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                {campos.map((c) => (
                  <div
                    key={c.key}
                    className={`rounded-xl p-3 text-center border ${estilos.borde}`}
                  >
                    <div className="font-medium">{c.nombre}</div>
                    <div className="mt-1 text-base font-bold">
                      {totalCampoGeneral(c.key)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl p-3 text-center border border-dashed border-gray-300">
                <span className="text-xs sm:text-sm font-medium">
                  Total inspección:
                </span>
                <div className="text-lg sm:text-xl font-bold mt-1">
                  {totalGeneral()}
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP */}
          <div className="hidden lg:block overflow-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead className={estilos.header}>
                <tr className="text-center">
                  <th className={`p-3 border ${estilos.borde} min-w-[180px]`}>
                    Área / Puesto
                  </th>

                  {campos.map((c) => (
                    <th
                      key={c.key}
                      className={`p-3 border ${estilos.borde} min-w-[160px]`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={c.img}
                          alt={c.nombre}
                          className="w-10 h-10 object-contain"
                        />
                        <span className="text-sm">{c.nombre}</span>
                      </div>
                    </th>
                  ))}

                  <th className={`p-3 border ${estilos.borde} min-w-[220px]`}>
                    Observaciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {dataFiltrada.map((fila: any) => {
                  const indiceOriginal = data.indexOf(fila);

                  return (
                    <tr key={indiceOriginal} className={estilos.fila}>
                      <td
                        className={`border p-3 text-center font-semibold ${estilos.borde}`}
                      >
                        <div>{fila.area}</div>
                        <div className={`text-xs mt-1 ${estilos.subtitulo}`}>
                          {obtenerAnio(fila)} - {nombreMes(obtenerMes(fila))}
                        </div>
                      </td>

                      {campos.map((c) => (
                        <td key={c.key} className={`border ${estilos.borde}`}>
                          <div className="flex flex-col">
                            <div className="grid grid-cols-2">
                              <div
                                className={`flex flex-col items-center py-2 border-r ${estilos.linea}`}
                              >
                                <span className="text-xs mb-1">C</span>
                                <input
                                  value={valores?.[indiceOriginal]?.[c.key]?.c || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      indiceOriginal,
                                      c.key,
                                      "c",
                                      e.target.value
                                    )
                                  }
                                  className={`w-14 text-center rounded-lg px-2 py-1.5 outline-none ${estilos.input}`}
                                />
                              </div>

                              <div className="flex flex-col items-center py-2">
                                <span className="text-xs mb-1">NC</span>
                                <input
                                  value={valores?.[indiceOriginal]?.[c.key]?.nc || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      indiceOriginal,
                                      c.key,
                                      "nc",
                                      e.target.value
                                    )
                                  }
                                  className={`w-14 text-center rounded-lg px-2 py-1.5 outline-none ${estilos.input}`}
                                />
                              </div>
                            </div>

                            <div
                              className={`text-center font-semibold py-2 border-t ${estilos.linea}`}
                            >
                              {totalCampoFila(indiceOriginal, c.key)}
                            </div>
                          </div>
                        </td>
                      ))}

                      <td className={`border p-3 ${estilos.borde}`}>
                        <div className="flex flex-col gap-3">
                          <input
                            value={observaciones[indiceOriginal] || ""}
                            onChange={(e) =>
                              handleObs(indiceOriginal, e.target.value)
                            }
                            placeholder="Observación..."
                            className={`w-full p-2.5 rounded-lg text-sm outline-none ${estilos.input}`}
                          />

                          <div className="text-center font-semibold text-sm">
                            Total: {totalFila(indiceOriginal)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                <tr className={estilos.totalGeneral}>
                  <td className={`border p-3 font-bold text-center ${estilos.borde}`}>
                    TOTAL GENERAL
                  </td>

                  {campos.map((c) => (
                    <td
                      key={c.key}
                      className={`border text-center text-base font-bold ${estilos.borde}`}
                    >
                      {totalCampoGeneral(c.key)}
                    </td>
                  ))}

                  <td
                    className={`border text-center text-lg font-bold ${estilos.borde}`}
                  >
                    {totalGeneral()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FOOTER */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className={`px-4 py-2 rounded-xl text-xs sm:text-sm ${estilos.chip}`}>
          Día actual: <span className="font-semibold">{fechaActual}</span>
        </div>

        <div className={`px-4 py-2 rounded-xl text-xs sm:text-sm ${estilos.chip}`}>
          Responsable:{" "}
          <span className="font-semibold">
            {responsable ? responsable : "Pendiente por asignar"}
          </span>
        </div>
      </div>
    </div>
  );
}
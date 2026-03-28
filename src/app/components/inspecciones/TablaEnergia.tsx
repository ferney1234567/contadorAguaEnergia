"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  User2,
  Filter,
  History,
  Zap,
  ChevronDown,
  ListFilter,
} from "lucide-react";

interface Props {
  data: any[];
  modoNoche?: boolean;
}

type ValoresState = {
  [fila: number]: {
    [campo: number]: {
      c?: string;
      nc?: string;
    };
  };
};

type ObservacionesState = {
  [fila: number]: string;
};

export default function TablaEnergia({ data = [], modoNoche = false }: Props) {
  const campos = [
    { key: 1, nombre: "Bombillas", img: "/img/bombillas.png" },
    { key: 2, nombre: "Reflectores", img: "/img/reflectores.png" },
    { key: 3, nombre: "Lámparas piso", img: "/img/lampara_piso.png" },
    { key: 4, nombre: "Aire acondicionado", img: "/img/aireAcondicionado.png" },
  ];

  const [valores, setValores] = useState<ValoresState>({});
  const [observaciones, setObservaciones] = useState<ObservacionesState>({});
  const [responsable, setResponsable] = useState("");
  const [fechaActual, setFechaActual] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [anioFiltro, setAnioFiltro] = useState("Todos");
  const [mesFiltro, setMesFiltro] = useState("Todos");
  const [mostrarHistorial, setMostrarHistorial] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

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
    const interval = setInterval(actualizarFecha, 60000);

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
      if (!isNaN(d.getTime())) return String(d.getMonth() + 1);
    }

    return "Sin mes";
  };

  const nombreMes = (mes: string) => {
    const meses: Record<string, string> = {
      "1": "Enero",
      "2": "Febrero",
      "3": "Marzo",
      "4": "Abril",
      "5": "Mayo",
      "6": "Junio",
      "7": "Julio",
      "8": "Agosto",
      "9": "Septiembre",
      "10": "Octubre",
      "11": "Noviembre",
      "12": "Diciembre",
      "01": "Enero",
      "02": "Febrero",
      "03": "Marzo",
      "04": "Abril",
      "05": "Mayo",
      "06": "Junio",
      "07": "Julio",
      "08": "Agosto",
      "09": "Septiembre",
    };

    return meses[mes] || mes;
  };

  const aniosDisponibles = useMemo(() => {
    const setAnios = new Set<string>();

    data.forEach((fila) => {
      setAnios.add(obtenerAnio(fila));
    });

    return ["Todos", ...Array.from(setAnios)];
  }, [data]);

  const mesesDisponibles = useMemo(() => {
    const setMeses = new Set<string>();

    data.forEach((fila) => {
      setMeses.add(obtenerMes(fila));
    });

    const ordenados = Array.from(setMeses).sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);

      if (isNaN(na) || isNaN(nb)) return 0;
      return na - nb;
    });

    return ["Todos", ...ordenados];
  }, [data]);

  const dataFiltrada = useMemo(() => {
    return data.filter((fila) => {
      const area = String(fila?.area || "").toLowerCase();
      const textoBusqueda = busqueda.trim().toLowerCase();

      const coincideBusqueda =
        !textoBusqueda || area.includes(textoBusqueda);

      const anio = obtenerAnio(fila);
      const mes = obtenerMes(fila);

      const coincideAnio =
        anioFiltro === "Todos" || anio === anioFiltro;

      const coincideMes =
        mesFiltro === "Todos" || mes === mesFiltro;

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

    campos.forEach((campo) => {
      total += totalCampoFila(fila, campo.key);
    });

    return total;
  };

  const totalCampoGeneral = (campo: number) => {
    let total = 0;

    dataFiltrada.forEach((fila) => {
      const indiceOriginal = data.indexOf(fila);
      total += totalCampoFila(indiceOriginal, campo);
    });

    return total;
  };

  const totalGeneral = () => {
    let total = 0;

    dataFiltrada.forEach((fila) => {
      const indiceOriginal = data.indexOf(fila);
      total += totalFila(indiceOriginal);
    });

    return total;
  };

  const totalCumple = () => {
    let total = 0;

    dataFiltrada.forEach((fila) => {
      const indiceOriginal = data.indexOf(fila);

      campos.forEach((campo) => {
        total += Number(valores?.[indiceOriginal]?.[campo.key]?.c || 0);
      });
    });

    return total;
  };

  const totalNoCumple = () => {
    let total = 0;

    dataFiltrada.forEach((fila) => {
      const indiceOriginal = data.indexOf(fila);

      campos.forEach((campo) => {
        total += Number(valores?.[indiceOriginal]?.[campo.key]?.nc || 0);
      });
    });

    return total;
  };

  const estilos = {
    contenedor: modoNoche
      ? "bg-[#141414] border border-[#2f2f2f] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      : "bg-white border border-gray-200 text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.06)]",

    tarjeta: modoNoche
      ? "bg-[#1b1b1b] border border-[#2d2d2d]"
      : "bg-white border border-gray-200",

    suave: modoNoche
      ? "bg-[#1d1d1d] border border-[#333333]"
      : "bg-gray-50 border border-gray-200",

    header: modoNoche
      ? "bg-[#191919] text-gray-100"
      : "bg-yellow-50 text-gray-700",

    fila: modoNoche
      ? "odd:bg-[#141414] even:bg-[#191919] hover:bg-[#212121] transition"
      : "odd:bg-white even:bg-gray-50 hover:bg-yellow-50 transition",

    borde: modoNoche ? "border-[#343434]" : "border-gray-200",

    input: modoNoche
      ? "bg-[#242424] text-white border border-[#414141] placeholder:text-gray-500"
      : "bg-white text-gray-800 border border-gray-300 placeholder:text-gray-400",

    inputSuave: modoNoche
      ? "bg-[#202020] text-white border border-[#383838]"
      : "bg-gray-100 text-gray-800 border border-gray-300",

    linea: modoNoche ? "border-[#3f3f3f]" : "border-gray-200",

    obsInput: modoNoche
      ? "bg-[#202020] text-white border border-[#414141] placeholder:text-gray-500"
      : "bg-gray-50 text-gray-800 border border-gray-300 placeholder:text-gray-400",

    totalRow: modoNoche
      ? "bg-[#181818] text-gray-100"
      : "bg-[#fffaf0] text-gray-800",

    chip: modoNoche
      ? "bg-[#202020] border border-[#363636] text-gray-200"
      : "bg-white border border-gray-200 text-gray-700",

    subtitulo: modoNoche ? "text-gray-400" : "text-gray-500",

    cajaResumen: modoNoche
      ? "bg-[#1a1a1a] border border-[#333333]"
      : "bg-[#fffdf7] border border-yellow-100",
  };

  return (
    <div className={`w-full rounded-3xl p-3 sm:p-4 lg:p-6 ${estilos.contenedor}`}>
      {/* ENCABEZADO */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-wide">
              Gestión de Energía
            </h2>
          </div>
          <p className={`mt-1 text-xs sm:text-sm ${estilos.subtitulo}`}>
            Inspección, control, seguimiento e historial del componente energético
          </p>
        </div>

        {/* FECHA Y RESPONSABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${estilos.suave}`}>
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs opacity-75">
                Fecha actual de inspección
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                {fechaActual}
              </span>
            </div>
          </div>

          <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${estilos.suave}`}>
            <User2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <div className="flex-1">
              <label className="block text-[11px] sm:text-xs mb-1 opacity-75">
                Responsable de la inspección
              </label>
              <input
                type="text"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Escribe el nombre del responsable"
                className={`w-full rounded-xl px-3 py-2 text-sm outline-none ${estilos.input}`}
              />
            </div>
          </div>
        </div>

        {/* BOTON FILTROS */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`w-full sm:w-auto rounded-2xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${estilos.inputSuave}`}
          >
            <ListFilter className="w-4 h-4" />
            {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                mostrarFiltros ? "rotate-180" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            className={`w-full sm:w-auto rounded-2xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${estilos.inputSuave}`}
          >
            <History className="w-4 h-4" />
            {mostrarHistorial ? "Ocultar historial" : "Mostrar historial"}
          </button>
        </div>

        {/* FILTROS */}
        {mostrarFiltros && (
          <div className={`rounded-2xl p-3 sm:p-4 ${estilos.suave}`}>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" />
              <h3 className="text-sm sm:text-base font-semibold">
                Filtros de búsqueda
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por área"
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
                onClick={() => {
                  setBusqueda("");
                  setAnioFiltro("Todos");
                  setMesFiltro("Todos");
                }}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium ${estilos.inputSuave}`}
              >
                Limpiar filtros
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
        )}

        {/* RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-2xl p-4 ${estilos.cajaResumen}`}>
            <p className={`text-xs sm:text-sm ${estilos.subtitulo}`}>
              Total cumple
            </p>
            <h4 className="text-lg sm:text-xl font-bold mt-1">
              {totalCumple()}
            </h4>
          </div>

          <div className={`rounded-2xl p-4 ${estilos.cajaResumen}`}>
            <p className={`text-xs sm:text-sm ${estilos.subtitulo}`}>
              Total no cumple
            </p>
            <h4 className="text-lg sm:text-xl font-bold mt-1">
              {totalNoCumple()}
            </h4>
          </div>

          <div className={`rounded-2xl p-4 ${estilos.cajaResumen}`}>
            <p className={`text-xs sm:text-sm ${estilos.subtitulo}`}>
              Total general
            </p>
            <h4 className="text-lg sm:text-xl font-bold mt-1">
              {totalGeneral()}
            </h4>
          </div>
        </div>
      </div>

      {/* HISTORIAL */}
      {mostrarHistorial && (
        <>
          {/* MOVIL */}
          <div className="block xl:hidden space-y-4">
            {dataFiltrada.length === 0 && (
              <div className={`rounded-2xl p-5 text-center ${estilos.suave}`}>
                <p className="text-sm">No hay registros para mostrar.</p>
              </div>
            )}

            {dataFiltrada.map((fila: any) => {
              const indiceOriginal = data.indexOf(fila);

              return (
                <div
                  key={indiceOriginal}
                  className={`rounded-2xl p-3 border ${estilos.borde} ${estilos.tarjeta}`}
                >
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base">
                          {fila.area}
                        </h4>
                        <p className={`text-[11px] sm:text-xs ${estilos.subtitulo}`}>
                          Año: {obtenerAnio(fila)} | Mes: {nombreMes(obtenerMes(fila))}
                        </p>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${estilos.chip}`}>
                        Total: {totalFila(indiceOriginal)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {campos.map((campo) => (
                      <div
                        key={campo.key}
                        className={`rounded-xl border p-3 ${estilos.borde}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={campo.img}
                            alt={campo.nombre}
                            className="w-8 h-8 object-contain"
                          />
                          <span className="text-sm font-semibold">
                            {campo.nombre}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] mb-1">C</label>
                            <input
                              value={valores?.[indiceOriginal]?.[campo.key]?.c || ""}
                              onChange={(e) =>
                                handleChange(
                                  indiceOriginal,
                                  campo.key,
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
                              value={valores?.[indiceOriginal]?.[campo.key]?.nc || ""}
                              onChange={(e) =>
                                handleChange(
                                  indiceOriginal,
                                  campo.key,
                                  "nc",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-lg px-3 py-2 text-sm text-center outline-none ${estilos.input}`}
                            />
                          </div>
                        </div>

                        <div className="mt-3 text-center text-sm font-semibold">
                          Total campo: {totalCampoFila(indiceOriginal, campo.key)}
                        </div>
                      </div>
                    ))}

                    <div className={`rounded-xl border p-3 ${estilos.borde}`}>
                      <label className="block text-xs mb-2 font-medium">
                        Observaciones
                      </label>
                      <input
                        value={observaciones[indiceOriginal] || ""}
                        onChange={(e) => handleObs(indiceOriginal, e.target.value)}
                        placeholder="Escribe una observación..."
                        className={`w-full rounded-lg px-3 py-2 text-sm outline-none ${estilos.obsInput}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {dataFiltrada.length > 0 && (
              <div className={`rounded-2xl p-4 border ${estilos.totalRow} ${estilos.borde}`}>
                <h3 className="text-center text-sm sm:text-base font-bold mb-3">
                  Total General
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  {campos.map((campo) => (
                    <div
                      key={campo.key}
                      className={`rounded-xl p-3 text-center border ${estilos.borde}`}
                    >
                      <div className="font-medium">{campo.nombre}</div>
                      <div className="mt-1 text-base font-bold">
                        {totalCampoGeneral(campo.key)}
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
            )}
          </div>

          {/* DESKTOP TABLA COMPLETA */}
          <div className="hidden xl:block overflow-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-sm min-w-[1200px]">
              <thead className={estilos.header}>
                <tr className="text-center">
                  <th className={`p-4 border ${estilos.borde} min-w-[200px]`}>
                    Área
                  </th>

                  {campos.map((campo) => (
                    <th
                      key={campo.key}
                      className={`p-4 border ${estilos.borde} min-w-[190px]`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={campo.img}
                          className="w-12 h-12 object-contain"
                          alt={campo.nombre}
                        />
                        <span className="font-semibold text-sm">
                          {campo.nombre}
                        </span>
                      </div>
                    </th>
                  ))}

                  <th className={`p-4 border ${estilos.borde} min-w-[260px]`}>
                    Observaciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {dataFiltrada.length === 0 && (
                  <tr>
                    <td
                      colSpan={campos.length + 2}
                      className={`border p-6 text-center ${estilos.borde}`}
                    >
                      No hay registros para mostrar con los filtros actuales.
                    </td>
                  </tr>
                )}

                {dataFiltrada.map((fila: any) => {
                  const indiceOriginal = data.indexOf(fila);

                  return (
                    <tr key={indiceOriginal} className={estilos.fila}>
                      <td
                        className={`border p-4 text-center font-semibold ${estilos.borde}`}
                      >
                        <div>{fila.area}</div>
                        <div className={`text-xs mt-1 ${estilos.subtitulo}`}>
                          {obtenerAnio(fila)} - {nombreMes(obtenerMes(fila))}
                        </div>
                      </td>

                      {campos.map((campo) => (
                        <td key={campo.key} className={`border ${estilos.borde}`}>
                          <div className="flex flex-col h-full">
                            <div className="grid grid-cols-2">
                              <div
                                className={`flex flex-col items-center justify-center py-3 border-r ${estilos.linea}`}
                              >
                                <span className="text-xs font-semibold opacity-70">
                                  C
                                </span>
                                <input
                                  value={valores?.[indiceOriginal]?.[campo.key]?.c || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      indiceOriginal,
                                      campo.key,
                                      "c",
                                      e.target.value
                                    )
                                  }
                                  className={`w-16 text-center rounded-md px-2 py-1.5 mt-2 text-sm outline-none ${estilos.input}`}
                                />
                              </div>

                              <div className="flex flex-col items-center justify-center py-3">
                                <span className="text-xs font-semibold opacity-70">
                                  NC
                                </span>
                                <input
                                  value={valores?.[indiceOriginal]?.[campo.key]?.nc || ""}
                                  onChange={(e) =>
                                    handleChange(
                                      indiceOriginal,
                                      campo.key,
                                      "nc",
                                      e.target.value
                                    )
                                  }
                                  className={`w-16 text-center rounded-md px-2 py-1.5 mt-2 text-sm outline-none ${estilos.input}`}
                                />
                              </div>
                            </div>

                            <div
                              className={`border-t ${estilos.linea} text-center py-2 font-bold text-sm`}
                            >
                              {totalCampoFila(indiceOriginal, campo.key)}
                            </div>
                          </div>
                        </td>
                      ))}

                      <td className={`border p-3 ${estilos.borde}`}>
                        <div className="flex flex-col gap-2">
                          <input
                            value={observaciones[indiceOriginal] || ""}
                            onChange={(e) =>
                              handleObs(indiceOriginal, e.target.value)
                            }
                            placeholder="Escribe una observación..."
                            className={`w-full rounded-lg px-3 py-2 text-sm outline-none ${estilos.obsInput}`}
                          />

                          <div className="text-center font-semibold text-sm">
                            Total: {totalFila(indiceOriginal)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {dataFiltrada.length > 0 && (
                  <tr className={estilos.totalRow}>
                    <td
                      className={`border p-4 text-center font-bold text-base ${estilos.borde}`}
                    >
                      TOTAL GENERAL
                    </td>

                    {campos.map((campo) => (
                      <td
                        key={campo.key}
                        className={`border p-4 text-center font-bold text-lg ${estilos.borde}`}
                      >
                        {totalCampoGeneral(campo.key)}
                      </td>
                    ))}

                    <td
                      className={`border p-4 text-center font-bold text-xl ${estilos.borde}`}
                    >
                      {totalGeneral()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PIE */}
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
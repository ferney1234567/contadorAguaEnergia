"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, Filter, Plus, Edit } from "lucide-react";
import Swal from "sweetalert2";
import MovilAgua from "./modalAgua";
import { exportarSanitariosPDF } from "@/app/utils/exportadorSanitariosPDF";
import { Toilet, ShowerHead, Droplets, Wrench, Waves } from "lucide-react";


type RegistroValores = {
  [filaKey: string]: { [campo: number]: { c?: string; nc?: string } };
};

type RegistroObservaciones = {
  [filaKey: string]: string;
};

interface Props {
  modoNoche?: boolean;
  dataBackend: any[];
}

export default function InpeccionesSanitarios({
  modoNoche,
  dataBackend: dataInicial,
}: Props) {
  const [dataBackend, setdataBackend] = useState<any[]>(
    Array.isArray(dataInicial) ? dataInicial : []
  );

  const campos = [
    { key: 1, nombre: "Sanitarios", db: "sanitarios", icon: Toilet, color: "text-blue-500" },
    { key: 2, nombre: "Orinales", db: "orinales", icon: Droplets, color: "text-yellow-500" },
    { key: 3, nombre: "Duchas", db: "duchas", icon: ShowerHead, color: "text-cyan-500" },
    { key: 4, nombre: "Lavamanos", db: "lavamanos", icon: Waves, color: "text-indigo-500" },
    { key: 5, nombre: "Llaves", db: "llaves", icon: Wrench, color: "text-gray-500" },
  ];

  const MESES = [
    { value: "Todos", label: "Todos" },
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const STORAGE_DATA = "sanitarios_data";
  const STORAGE_MODO = "modo_nueva_inspeccion_sanitarios";
  const STORAGE_RESPONSABLE = "responsable";
  const [valores, setValores] = useState<RegistroValores>({});
  const [observaciones, setObservaciones] = useState<RegistroObservaciones>({});
  const [fechaActual, setFechaActual] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modoNuevaInspeccion, setModoNuevaInspeccion] = useState(false);
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [responsable, setResponsable] = useState("");
  const [fechaSesion, setFechaSesion] = useState(new Date().toISOString().split("T")[0]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const obtenerAnioActual = () => String(new Date().getFullYear());
  const obtenerMesActual = () => String(new Date().getMonth() + 1).padStart(2, "0");
  const [anioFiltro, setAnioFiltro] = useState(obtenerAnioActual());
  const [mesFiltro, setMesFiltro] = useState(obtenerMesActual());
  const [editandoGrupo, setEditandoGrupo] = useState<string | null>(null);

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

    chip: modoNoche
      ? "bg-[#202020] text-gray-200 border border-gray-200"
      : "bg-gray-100 text-gray-700 border border-gray-200",
  };

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_RESPONSABLE);
    if (guardado) setResponsable(guardado);
  }, []);

  const handleResponsable = (valor: string) => {
    setModoNuevaInspeccion(false);
    setResponsable(valor);
    localStorage.setItem(STORAGE_RESPONSABLE, valor);
    localStorage.removeItem(STORAGE_MODO);
  };

  const limpiarEstadoFila = (filaKey: string) => {
    setValores((prev) => {
      const copia = { ...prev };
      delete copia[filaKey];
      return copia;
    });

    setObservaciones((prev) => {
      const copia = { ...prev };
      delete copia[filaKey];
      return copia;
    });
  };

  useEffect(() => {
    const data = { valores, observaciones };
    localStorage.setItem(STORAGE_DATA, JSON.stringify(data));
  }, [valores, observaciones]);

  useEffect(() => {
    if (modoNuevaInspeccion) return;

    const data = localStorage.getItem(STORAGE_DATA);
    if (data) {
      const parsed = JSON.parse(data);
      setValores(parsed.valores || {});
      setObservaciones(parsed.observaciones || {});
    }
  }, [modoNuevaInspeccion]);

  useEffect(() => {
    const estado = localStorage.getItem(STORAGE_MODO);
    if (estado === "true") {
      setModoNuevaInspeccion(true);
    }
  }, []);

  const finalizarInspeccion = async () => {
    setModoNuevaInspeccion(true);
    localStorage.setItem(STORAGE_MODO, "true");
    localStorage.removeItem(STORAGE_DATA);

    setValores({});
    setObservaciones({});
    setInspecciones([]);
    setFechaSesion(new Date().toISOString().split("T")[0]);

    Swal.fire({
      icon: "success",
      title: "Inspección finalizada",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const guardado = localStorage.getItem(STORAGE_RESPONSABLE);
        if (guardado) setResponsable(guardado);

        const dataLocal = localStorage.getItem(STORAGE_DATA);
        if (dataLocal) {
          const parsed = JSON.parse(dataLocal);
          setValores(parsed.valores || {});
          setObservaciones(parsed.observaciones || {});
        }

        const [areasRes, inspeccionesRes] = await Promise.all([
          fetch("/api/areas-sanitarias"),
          fetch("/api/inspecciones-sanitarias"),
        ]);

        const areasData = await areasRes.json();
        const inspeccionesData = await inspeccionesRes.json();

        const areasFinal = Array.isArray(areasData)
          ? areasData
          : Array.isArray(areasData?.data)
            ? areasData.data
            : [];

        const inspeccionesFinal = Array.isArray(inspeccionesData)
          ? inspeccionesData
          : Array.isArray(inspeccionesData?.data)
            ? inspeccionesData.data
            : [];

        setdataBackend(areasFinal);
        setInspecciones(inspeccionesFinal);
      } catch (error) {
        console.error("Error inicializando:", error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!dataBackend.length) return;
    if (modoNuevaInspeccion) return;

    const nuevosValores: RegistroValores = {};
    const nuevasObservaciones: RegistroObservaciones = {};

    dataBackend.forEach((area) => {
      const filaKey = `${fechaSesion}__${responsable}__${area.id}`;

      const inspeccion = inspecciones.find(
        (i) =>
          i.area_id === area.id &&
          i.responsable === responsable
      );

      if (!inspeccion) return;

      nuevosValores[filaKey] = {
        1: {
          c: String(inspeccion.sanitarios_c || ""),
          nc: String(inspeccion.sanitarios_nc || ""),
        },
        2: {
          c: String(inspeccion.orinales_c || ""),
          nc: String(inspeccion.orinales_nc || ""),
        },
        3: {
          c: String(inspeccion.duchas_c || ""),
          nc: String(inspeccion.duchas_nc || ""),
        },
        4: {
          c: String(inspeccion.lavamanos_c || ""),
          nc: String(inspeccion.lavamanos_nc || ""),
        },
        5: {
          c: String(inspeccion.llaves_c || ""),
          nc: String(inspeccion.llaves_nc || ""),
        },
      };

      nuevasObservaciones[filaKey] = inspeccion.observacion || "";
    });

    setValores(nuevosValores);
    setObservaciones(nuevasObservaciones);
  }, [dataBackend, inspecciones, responsable, fechaSesion, modoNuevaInspeccion]);

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
    filaKey: string,
    campo: number,
    tipo: "c" | "nc",
    value: string
  ) => {
    const limpio = value.replace(/\D/g, "");

    setValores((prev) => ({
      ...prev,
      [filaKey]: {
        ...prev[filaKey],
        [campo]: {
          ...prev[filaKey]?.[campo],
          [tipo]: limpio,
        },
      },
    }));
  };

  const handleObs = (filaKey: string, value: string) => {
    setObservaciones((prev) => ({
      ...prev,
      [filaKey]: value,
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
      if (!isNaN(d.getTime())) {
        return String(d.getMonth() + 1).padStart(2, "0");
      }
    }
    return "Sin mes";
  };

  const aniosDisponibles = useMemo(() => {
    const setAnios = new Set<string>();
    inspecciones.forEach((item) => {
      if (item?.fecha) {
        setAnios.add(String(new Date(item.fecha).getFullYear()));
      }
    });
    return ["Todos", ...Array.from(setAnios).sort((a, b) => Number(b) - Number(a))];
  }, [inspecciones]);

  const obtenerSemana = (fecha: string) => {
    const d = new Date(fecha);
    const inicio = new Date(d.getFullYear(), 0, 1);
    const dias = Math.floor(
      (d.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.ceil((dias + inicio.getDay() + 1) / 7);
  };

  const normalizarFecha = (fecha: string) => {
    if (!fecha) return "";
    return fecha.split("T")[0];
  };

  const dataBackendFiltrada = useMemo(() => {
    return dataBackend.filter((fila) => {
      const nombre = String(fila?.nombre || "").toLowerCase();
      const textoBusqueda = busqueda.toLowerCase().trim();
      const coincideBusqueda = !textoBusqueda || nombre.includes(textoBusqueda);

      const anio = obtenerAnio(fila);
      const mes = obtenerMes(fila);

      const coincideAnio = anioFiltro === "Todos" || anio === anioFiltro;
      const coincideMes = mesFiltro === "Todos" || mes === mesFiltro;

      return coincideBusqueda && coincideAnio && coincideMes;
    });
  }, [dataBackend, busqueda, anioFiltro, mesFiltro]);

  const getFilaKey = (
    fecha: string,
    responsableFila: string,
    areaId: number | string
  ) => `${fecha}__${responsableFila}__${areaId}`;

  const inspeccionesPorFecha = useMemo(() => {
    const grupos: Record<string, any[]> = {};

    inspecciones.forEach((item) => {
      const fecha = normalizarFecha(item.fecha);
      const responsableItem = item.responsable || "sin-responsable";
      const semana = obtenerSemana(fecha);
      const anio = new Date(fecha).getFullYear();

      const clave = `${anio}__semana${semana}__${responsableItem}`;

      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(item);
    });

    return grupos;
  }, [inspecciones]);

  const inspeccionesFiltradas = useMemo(() => {
    return Object.entries(inspeccionesPorFecha)
      .filter(([clave, registros]) => {
        const [anio] = clave.split("__");
        const coincideAnio = anioFiltro === "Todos" || anio === anioFiltro;

        if (!coincideAnio) return false;

        if (mesFiltro === "Todos") return true;

        return registros.some((r) => {
          const fecha = normalizarFecha(r.fecha);
          const d = new Date(fecha);
          return String(d.getMonth() + 1).padStart(2, "0") === mesFiltro;
        });
      })
      .sort((a, b) => b[0].localeCompare(a[0]));
  }, [inspeccionesPorFecha, anioFiltro, mesFiltro]);

  const obtenerValor = (
    filaKey: string,
    campo: number,
    tipo: "c" | "nc",
    registro: any
  ) => {
    const valorLocal = valores?.[filaKey]?.[campo]?.[tipo];

    if (valorLocal !== undefined && valorLocal !== "") {
      return Number(valorLocal);
    }

    if (registro) {
      const campoDef = campos.find((c) => c.key === campo);
      if (!campoDef) return 0;
      return Number(registro?.[`${campoDef.db}_${tipo}`] || 0);
    }

    return 0;
  };

  const guardarFila = async (filaKey: string, area: any, registro: any) => {
    try {
      if (!area?.id) return;

      const responsableFinal =
        (typeof responsable === "string" && responsable.trim()) ||
        registro?.responsable ||
        "";

      if (!responsableFinal) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "Debes seleccionar un responsable",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      let registroSeguro = registro;
      if (registro && registro.responsable !== responsableFinal) {
        registroSeguro = null;
      }

      const body = {
        id: registroSeguro?.id || null,
        fecha: registroSeguro?.fecha?.split("T")[0] || fechaSesion,
        responsable: responsableFinal,
        area_id: area.id,

        sanitarios_c: obtenerValor(filaKey, 1, "c", registroSeguro),
        sanitarios_nc: obtenerValor(filaKey, 1, "nc", registroSeguro),

        orinales_c: obtenerValor(filaKey, 2, "c", registroSeguro),
        orinales_nc: obtenerValor(filaKey, 2, "nc", registroSeguro),

        duchas_c: obtenerValor(filaKey, 3, "c", registroSeguro),
        duchas_nc: obtenerValor(filaKey, 3, "nc", registroSeguro),

        lavamanos_c: obtenerValor(filaKey, 4, "c", registroSeguro),
        lavamanos_nc: obtenerValor(filaKey, 4, "nc", registroSeguro),

        llaves_c: obtenerValor(filaKey, 5, "c", registroSeguro),
        llaves_nc: obtenerValor(filaKey, 5, "nc", registroSeguro),

        observacion: observaciones[filaKey] || registroSeguro?.observacion || "",
      };

      const total =
        body.sanitarios_c +
        body.sanitarios_nc +
        body.orinales_c +
        body.orinales_nc +
        body.duchas_c +
        body.duchas_nc +
        body.lavamanos_c +
        body.lavamanos_nc +
        body.llaves_c +
        body.llaves_nc;

      if (total === 0 && registroSeguro?.id) {
        await fetch(`/api/inspecciones-sanitarias?id=${registroSeguro.id}`, {
          method: "DELETE",
        });

        limpiarEstadoFila(filaKey);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Registro eliminado",
          timer: 1200,
          showConfirmButton: false,
        });
      } else if (total > 0) {
        const response = await fetch("/api/inspecciones-sanitarias", {
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

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: registroSeguro?.id ? "Registro actualizado" : "Registro creado",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      const res = await fetch("/api/inspecciones-sanitarias");
      const data = await res.json();
      const dataFinal = Array.isArray(data) ? data : data?.data || [];
      setInspecciones(dataFinal);
    } catch (error) {
      console.error("ERROR GENERAL:", error);

      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "No se pudo guardar el registro",
      });
    }
  };

  const guardarTodo = async (responsableGrupo: string, fecha: string) => {
    try {
      if (!responsableGrupo) return;

      const promesas: Promise<any>[] = [];

      dataBackend.forEach((area: any) => {
        const filaKey = `${fecha}__${responsableGrupo}__${area.id}`;

        const registro = inspecciones.find(
          (r) =>
            r.area_id === area.id &&
            r.responsable === responsableGrupo &&
            r.fecha?.split("T")[0] === fecha
        );

        const body = {
          id: registro?.id || null,
          fecha,
          responsable: responsableGrupo,
          area_id: area.id,

          sanitarios_c: Number(valores?.[filaKey]?.[1]?.c || 0),
          sanitarios_nc: Number(valores?.[filaKey]?.[1]?.nc || 0),

          orinales_c: Number(valores?.[filaKey]?.[2]?.c || 0),
          orinales_nc: Number(valores?.[filaKey]?.[2]?.nc || 0),

          duchas_c: Number(valores?.[filaKey]?.[3]?.c || 0),
          duchas_nc: Number(valores?.[filaKey]?.[3]?.nc || 0),

          lavamanos_c: Number(valores?.[filaKey]?.[4]?.c || 0),
          lavamanos_nc: Number(valores?.[filaKey]?.[4]?.nc || 0),

          llaves_c: Number(valores?.[filaKey]?.[5]?.c || 0),
          llaves_nc: Number(valores?.[filaKey]?.[5]?.nc || 0),

          observacion: observaciones[filaKey] || "",
        };

        const total =
          body.sanitarios_c +
          body.sanitarios_nc +
          body.orinales_c +
          body.orinales_nc +
          body.duchas_c +
          body.duchas_nc +
          body.lavamanos_c +
          body.lavamanos_nc +
          body.llaves_c +
          body.llaves_nc;

        if (total === 0) {
          if (registro?.id) {
            promesas.push(
              fetch(`/api/inspecciones-sanitarias?id=${registro.id}`, {
                method: "DELETE",
              })
            );
          }

          limpiarEstadoFila(filaKey);
          return;
        }

        promesas.push(
          fetch("/api/inspecciones-sanitarias", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          })
        );
      });

      await Promise.all(promesas);

      const res = await fetch("/api/inspecciones-sanitarias");
      const data = await res.json();
      const dataFinal = Array.isArray(data) ? data : data?.data || [];
      setInspecciones(dataFinal);

      Swal.fire({
        icon: "success",
        title: "Guardado completo",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditandoGrupo(null);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "No se pudieron guardar los cambios",
      });
    }
  };

  return (
    <div className={`w-full rounded-3xl p-3 sm:p-4 md:p-6 ${estilos.tarjeta}`}>
      <div className="mb-5 flex flex-col gap-4">
        <div className="text-center">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-wide ${estilos.titulo}`}
          >
            Gestión de Sanitarios
          </h2>
          <p className={`mt-1 text-xs sm:text-sm ${estilos.subtitulo}`}>
            Control de inspecciones sanitarias, filtros e historial en tiempo real
          </p>
        </div>

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
            className={`rounded-2xl px-3 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${estilos.inputSuave}`}
          >
            {/* BOTÓN NUEVA INSPECCIÓN */}
            <button
              onClick={() => setMostrarModal(true)}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold transition
      ${modoNoche
                  ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md"
                  : "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-sm"
                }
      hover:scale-105 active:scale-95`}
            >
              <Plus size={16} />
              Nueva inspección sanitaria
            </button>

            {/* BOTÓN EXPORTAR PDF */}
            <button
              onClick={() => exportarSanitariosPDF(inspecciones)}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold transition
      ${modoNoche
                  ? "bg-gradient-to-r from-green-700 to-green-500 text-white shadow-md"
                  : "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-sm"
                }
      hover:scale-105 active:scale-95`}
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${estilos.inputSuave}`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <h3 className="text-sm sm:text-base font-semibold">
                Filtros de búsqueda
              </h3>
            </div>
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
              {MESES.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  Mes: {mes.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <Plus
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              />
              <input
                type="text"
                placeholder="Nueva área + Enter"
                className={`w-full rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none ${estilos.input}`}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();

                    const input = e.target as HTMLInputElement;
                    const valor = input.value.trim();

                    if (!valor) return;

                    try {
                      const existe = dataBackend.some(
                        (a) => String(a?.nombre || "").toLowerCase().trim() === valor.toLowerCase()
                      );

                      if (existe) {
                        Swal.fire({
                          toast: true,
                          position: "top-end",
                          icon: "warning",
                          title: "Esa área ya existe",
                          timer: 1400,
                          showConfirmButton: false,
                        });
                        return;
                      }

                      const res = await fetch("/api/areas-sanitarias", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nombre: valor }),
                      });

                      if (!res.ok) throw new Error("Error al crear área");

                      const nuevaArea = await res.json();
                      setdataBackend((prev) => [...prev, nuevaArea]);

                      Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Área creada",
                        timer: 1200,
                        showConfirmButton: false,
                      });

                      input.value = "";
                    } catch (error) {
                      console.error(error);
                      Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "No se pudo crear el área",
                      });
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs ${estilos.chip}`}>
              📊 {inspeccionesFiltradas.length} registros
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${estilos.chip}`}>
              👤 {responsable || "Sin responsable"}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${estilos.chip}`}>
              📅 {fechaActual}
            </span>
          </div>
        </div>
      </div>

      <>
        <MovilAgua
          modoNoche={modoNoche ?? false}
          dataBackend={dataBackend}
          setInspecciones={setInspecciones}
          mostrarModal={mostrarModal}
          setMostrarModal={setMostrarModal}
        />

        <div
          className={`lg:block p-4 rounded-2xl ${modoNoche ? "bg-[#0f0f0f]" : "bg-gray-100"
            }`}
        >
          {inspeccionesFiltradas.map(([clave, registros]) => {
            const [anio, semana, responsableGrupo] = clave.split("__");

            return (
              <div
                key={clave}
                className={`mb-10 rounded-2xl p-5 shadow-sm ${modoNoche
                  ? "bg-[#161616] border border-[#2a2a2a]"
                  : "bg-white border border-gray-200"
                  }`}
              >
                {/* HEADER */}
                <div className="mb-5 text-center">
                  <h2>
                    Semana {semana.replace("semana", "")} - {anio}
                  </h2>

                  {/* 🔥 FECHA REAL DE LA SEMANA */}
                  {registros.length > 0 && (
                    <p className={`text-sm mt-1 ${modoNoche ? "text-gray-300" : "text-gray-600"}`}>
                      📅 {new Date(registros[0].fecha).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">

                    {/* ✏️ EDITAR */}
                    <button
                      onClick={() => {
                        setEditandoGrupo(clave);

                        Swal.fire({
                          toast: true,
                          position: "top-end",
                          icon: "info",
                          title: "Modo edición activado",
                          timer: 1200,
                          showConfirmButton: false,
                        });
                      }}
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 
              ${modoNoche
                          ? "bg-gradient-to-r from-red-600 to-pink-500 text-white shadow-lg shadow-red-900/30"
                          : "bg-gradient-to-r from-red-500 to-pink-400 text-white shadow-md"
                        }
              hover:scale-105 hover:shadow-xl active:scale-95`}
                    >
                      <Edit size={16} />
                      Editar
                    </button>

                    {/* 💾 GUARDAR */}
                    <button
                      onClick={() =>
                        guardarTodo(
                          responsableGrupo,
                          registros[0]?.fecha?.split("T")[0]
                        )
                      }
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${modoNoche
                          ? "bg-green-700 text-white"
                          : "bg-green-500 text-white"
                        }`}
                    >
                      💾 Guardar
                    </button>

                    {/* ❌ QUITAR EDICIÓN */}
                    <button
                      onClick={() => {
                        setEditandoGrupo(null);

                        Swal.fire({
                          toast: true,
                          position: "top-end",
                          icon: "info",
                          title: "Edición desactivada",
                          timer: 1200,
                          showConfirmButton: false,
                        });
                      }}
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 
              ${modoNoche
                          ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-lg shadow-black/30"
                          : "bg-gradient-to-r from-gray-300 to-gray-200 text-gray-800 shadow-md"
                        }
              hover:scale-105 hover:shadow-xl active:scale-95`}
                    >
                      ❌ Quitar edición
                    </button>

                  </div>
                  <div className="flex justify-center gap-3 mt-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${modoNoche
                        ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}
                    >
                      📊 {registros.length} registros
                    </span>


                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${modoNoche
                        ? "bg-purple-900/30 text-purple-300 border border-purple-800"
                        : "bg-purple-50 text-purple-600 border border-purple-200"
                        }`}
                    >
                      👤 Responsable:{" "}
                      {responsableGrupo ||
                        registros[0]?.responsable ||
                        "Sin responsable"}
                    </span>
                  </div>
                </div>



                <div
                  className={`overflow-auto rounded-2xl border ${modoNoche
                    ? "bg-[#1a1a1a] border-[#2f2f2f]"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr
                        className={`text-center text-xs uppercase ${modoNoche
                          ? "text-gray-300 bg-[#202020]"
                          : "text-gray-600 bg-gray-50"
                          }`}
                      >
                        <th
                          className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"
                            }`}
                        >
                          Área / Puesto
                        </th>

                        {campos.map((c) => (
                          <th
                            key={c.key}
                            className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                          >
                            <div className="flex flex-col items-center gap-1">

                              {(() => {
                                const Icono = c.icon;
                                return <Icono className={`w-6 h-6 ${c.color}`} />;
                              })()}

                              <span>{c.nombre}</span>

                            </div>
                          </th>
                        ))}

                        <th
                          className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"
                            }`}
                        >
                          Observaciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataBackend.map((area: any) => {
                        const registro = registros.find((r) => r.area_id === area.id);

                        const filaKey = getFilaKey(
                          registro?.fecha?.split("T")[0] || fechaSesion,
                          responsableGrupo,
                          area.id
                        );

                        return (
                          <tr
                            key={filaKey}
                            className={`transition ${modoNoche
                              ? "bg-[#181818] hover:bg-[#1f1f1f]"
                              : "bg-white hover:bg-gray-50"
                              }`}
                          >
                            <td
                              className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"
                                }`}
                            >
                              <input
                                disabled={editandoGrupo !== clave}
                                value={area.nombre || ""}
                                onChange={(e) => {
                                  const nuevo = e.target.value;
                                  setdataBackend((prev) =>
                                    prev.map((item) =>
                                      item.id === area.id
                                        ? { ...item, nombre: nuevo }
                                        : item
                                    )
                                  );
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();

                                    const valor = String(area.nombre || "").trim();

                                    try {
                                      if (!valor) {
                                        const res = await fetch(
                                          `/api/areas-sanitarias?id=${area.id}`,
                                          { method: "DELETE" }
                                        );

                                        if (!res.ok) {
                                          const errorText = await res.text();
                                          throw new Error(errorText);
                                        }

                                        setdataBackend((prev) =>
                                          prev.filter((item) => item.id !== area.id)
                                        );

                                        Swal.fire({
                                          toast: true,
                                          position: "top-end",
                                          icon: "success",
                                          title: "Área eliminada",
                                          timer: 1200,
                                          showConfirmButton: false,
                                        });

                                        return;
                                      }

                                      const duplicada = dataBackend.some(
                                        (a) =>
                                          a.id !== area.id &&
                                          String(a?.nombre || "").toLowerCase().trim() ===
                                          valor.toLowerCase()
                                      );

                                      if (duplicada) {
                                        Swal.fire({
                                          toast: true,
                                          position: "top-end",
                                          icon: "warning",
                                          title: "Ya existe un área con ese nombre",
                                          timer: 1400,
                                          showConfirmButton: false,
                                        });
                                        return;
                                      }

                                      const res = await fetch("/api/areas-sanitarias", {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          id: area.id,
                                          nombre: valor,
                                        }),
                                      });

                                      if (!res.ok) {
                                        const errorText = await res.text();
                                        throw new Error(errorText);
                                      }

                                      setdataBackend((prev) =>
                                        prev.map((item) =>
                                          item.id === area.id
                                            ? { ...item, nombre: valor }
                                            : item
                                        )
                                      );

                                      Swal.fire({
                                        toast: true,
                                        position: "top-end",
                                        icon: "success",
                                        title: "Área actualizada",
                                        timer: 1200,
                                        showConfirmButton: false,
                                      });
                                    } catch (error) {
                                      console.error(error);
                                      Swal.fire({
                                        icon: "error",
                                        title: "Error",
                                        text: "No se pudo actualizar/eliminar el área",
                                      });
                                    }
                                  }
                                }}
                                className={`w-full text-center font-semibold rounded-xl px-3 py-2 ${modoNoche
                                  ? "bg-[#222] text-white"
                                  : "bg-gray-50 text-gray-800"
                                  }`}
                              />
                            </td>

                            {campos.map((c) => {
                              const cVal =
                                valores?.[filaKey]?.[c.key]?.c !== undefined
                                  ? Number(valores[filaKey][c.key].c || 0)
                                  : registro
                                    ? Number(registro?.[`${c.db}_c`] || 0)
                                    : 0;

                              const ncVal =
                                valores?.[filaKey]?.[c.key]?.nc !== undefined
                                  ? Number(valores[filaKey][c.key].nc || 0)
                                  : registro
                                    ? Number(registro?.[`${c.db}_nc`] || 0)
                                    : 0;

                              const total = cVal + ncVal;

                              return (
                                <td
                                  key={c.key}
                                  className={`p-2 border ${modoNoche
                                    ? "border-[#353535]"
                                    : "border-gray-200"
                                    }`}
                                >
                                  <div
                                    className={`rounded-xl p-2 ${modoNoche ? "bg-[#202020]" : "bg-gray-50"
                                      }`}
                                  >
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        disabled={editandoGrupo !== clave}
                                        value={
                                          valores?.[filaKey]?.[c.key]?.c !== undefined
                                            ? valores[filaKey][c.key].c
                                            : registro
                                              ? String(registro?.[`${c.db}_c`] || "")
                                              : ""
                                        }
                                        onChange={(e) =>
                                          handleChange(filaKey, c.key, "c", e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            guardarFila(filaKey, area, registro);
                                          }
                                        }}
                                        className={`w-full text-center rounded-lg py-1 border font-semibold ${modoNoche
                                          ? "bg-[#111] text-white border-[#2f2f2f]"
                                          : "bg-white text-gray-700 border-gray-200"
                                          }`}
                                      />

                                      <input
                                        disabled={editandoGrupo !== clave}
                                        value={
                                          valores?.[filaKey]?.[c.key]?.nc !== undefined
                                            ? valores[filaKey][c.key].nc
                                            : registro
                                              ? String(registro?.[`${c.db}_nc`] || "")
                                              : ""
                                        }
                                        onChange={(e) =>
                                          handleChange(filaKey, c.key, "nc", e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            guardarFila(filaKey, area, registro);
                                          }
                                        }}
                                        className={`w-full text-center rounded-lg py-1 border font-semibold ${modoNoche
                                          ? "bg-[#111] text-white border-[#2f2f2f]"
                                          : "bg-white text-gray-700 border-gray-200"
                                          }`}
                                      />
                                    </div>

                                    <div
                                      className={`mt-2 text-center text-xs font-semibold py-1 rounded-lg border ${modoNoche
                                        ? "bg-blue-900/20 text-blue-300 border-blue-800/40"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                        }`}
                                    >
                                      {total}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}

                            <td
                              className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"
                                }`}
                            >
                              <div className="flex flex-col gap-2">
                                <textarea
                                  disabled={editandoGrupo !== clave}
                                  value={
                                    observaciones[filaKey] !== undefined
                                      ? observaciones[filaKey]
                                      : registro?.observacion || ""
                                  }
                                  onChange={(e) =>
                                    handleObs(filaKey, e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      guardarFila(filaKey, area, registro);
                                    }
                                  }}
                                  className={`w-full p-2 rounded-xl border ${modoNoche
                                    ? "bg-[#222] text-white border-[#2f2f2f]"
                                    : "bg-gray-50 text-gray-800 border-gray-200"
                                    }`}
                                />

                                <div
                                  className={`text-center text-sm font-semibold py-2 rounded-xl border ${modoNoche
                                    ? "bg-green-900/20 text-green-300 border-green-800/40"
                                    : "bg-green-50 text-green-700 border-green-200"
                                    }`}
                                >
                                  Total: {
                                    (valores?.[filaKey]?.[1]?.c ? Number(valores[filaKey][1].c) : Number(registro?.sanitarios_c || 0)) +
                                    (valores?.[filaKey]?.[1]?.nc ? Number(valores[filaKey][1].nc) : Number(registro?.sanitarios_nc || 0)) +
                                    (valores?.[filaKey]?.[2]?.c ? Number(valores[filaKey][2].c) : Number(registro?.orinales_c || 0)) +
                                    (valores?.[filaKey]?.[2]?.nc ? Number(valores[filaKey][2].nc) : Number(registro?.orinales_nc || 0)) +
                                    (valores?.[filaKey]?.[3]?.c ? Number(valores[filaKey][3].c) : Number(registro?.duchas_c || 0)) +
                                    (valores?.[filaKey]?.[3]?.nc ? Number(valores[filaKey][3].nc) : Number(registro?.duchas_nc || 0)) +
                                    (valores?.[filaKey]?.[4]?.c ? Number(valores[filaKey][4].c) : Number(registro?.lavamanos_c || 0)) +
                                    (valores?.[filaKey]?.[4]?.nc ? Number(valores[filaKey][4].nc) : Number(registro?.lavamanos_nc || 0)) +
                                    (valores?.[filaKey]?.[5]?.c ? Number(valores[filaKey][5].c) : Number(registro?.llaves_c || 0)) +
                                    (valores?.[filaKey]?.[5]?.nc ? Number(valores[filaKey][5].nc) : Number(registro?.llaves_nc || 0))
                                  }
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  className={`mt-6 overflow-auto rounded-2xl border ${modoNoche
                    ? "bg-[#1a1a1a] border-[#2f2f2f]"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr
                        className={`text-center text-xs uppercase ${modoNoche
                          ? "text-gray-300 bg-[#202020]"
                          : "text-gray-600 bg-red-600 text-white"
                          }`}
                      >
                        <th
                          className={`p-3 border ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          Tipo
                        </th>
                        <th
                          className={`p-3 border ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          ✔ Cumple
                        </th>
                        <th
                          className={`p-3 border ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          ✖ No cumple
                        </th>
                        <th
                          className={`p-3 border ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {campos.map((c) => {
                        let totalC = 0;
                        let totalNC = 0;

                        registros.forEach((r) => {
                          totalC += Number(r?.[`${c.db}_c`] || 0);
                          totalNC += Number(r?.[`${c.db}_nc`] || 0);
                        });

                        return (
                          <tr
                            key={c.key}
                            className={`${modoNoche
                              ? "bg-[#181818] hover:bg-[#1f1f1f]"
                              : "bg-white hover:bg-gray-50"
                              }`}
                          >
                            <td
                              className={`p-3 border font-semibold ${modoNoche ? "border-gray-200" : "border-gray-200"
                                }`}
                            >
                              {c.nombre}
                            </td>

                            <td
                              className={`p-3 border text-center ${modoNoche ? "border-gray-200" : "border-gray-200"
                                }`}
                            >
                              {totalC}
                            </td>

                            <td
                              className={`p-3 border text-center ${modoNoche ? "border-gray-200" : "border-gray-200"
                                }`}
                            >
                              {totalNC}
                            </td>

                            <td
                              className={`p-3 border text-center font-bold ${modoNoche ? "border-gray-200" : "border-gray-200"
                                }`}
                            >
                              {totalC + totalNC}
                            </td>
                          </tr>
                        );
                      })}

                      <tr
                        className={`font-bold ${modoNoche ? "bg-[#222]" : "bg-gray-100"
                          }`}
                      >
                        <td
                          className={`p-3 border ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          TOTAL
                        </td>

                        <td
                          className={`p-3 border text-center ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          {registros.reduce(
                            (acc, r) =>
                              acc +
                              Number(r.sanitarios_c || 0) +
                              Number(r.orinales_c || 0) +
                              Number(r.duchas_c || 0) +
                              Number(r.lavamanos_c || 0) +
                              Number(r.llaves_c || 0),
                            0
                          )}
                        </td>

                        <td
                          className={`p-3 border text-center ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          {registros.reduce(
                            (acc, r) =>
                              acc +
                              Number(r.sanitarios_nc || 0) +
                              Number(r.orinales_nc || 0) +
                              Number(r.duchas_nc || 0) +
                              Number(r.lavamanos_nc || 0) +
                              Number(r.llaves_nc || 0),
                            0
                          )}
                        </td>

                        <td
                          className={`p-3 border text-center ${modoNoche ? "border-gray-200" : "border-gray-200"
                            }`}
                        >
                          {registros.reduce(
                            (acc, r) => acc + Number(r.total || 0),
                            0
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </>

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
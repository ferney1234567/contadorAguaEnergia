"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Search, User2, Filter, Plus,
} from "lucide-react";
import Swal from "sweetalert2";
import MovilEnergia from "./modalEnergia";
import { exportarEnergiaPDF } from "@/app/utils/exportadorEnergiaPDF";
import { Lightbulb, Sun, LampFloor, Wind } from "lucide-react";


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

export default function TablaEnergia({
  modoNoche,
  dataBackend: dataInicial,
}: Props) {
  const [dataBackend, setdataBackend] = useState<any[]>(
    Array.isArray(dataInicial) ? dataInicial : [],
  );

  const campos = [
    { key: 1, nombre: "Bombillas", icon: Lightbulb, color: "text-yellow-500" },
    { key: 2, nombre: "Reflectores", icon: Sun, color: "text-orange-500" },
    { key: 3, nombre: "Lámpara piso", icon: LampFloor, color: "text-purple-500" },
    { key: 4, nombre: "Aires", icon: Wind, color: "text-cyan-500" },
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

  const camposMap: Record<number, string> = {
    1: "bombillas",
    2: "reflectores",
    3: "lamparas",
    4: "aires",
  };

  const [valores, setValores] = useState<RegistroValores>({});
  const [observaciones, setObservaciones] = useState<RegistroObservaciones>({});
  const [fechaActual, setFechaActual] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modoNuevaInspeccion, setModoNuevaInspeccion] = useState(false);
  const obtenerAnioActual = () => {
    return String(new Date().getFullYear());
  };
  const [anioFiltro, setAnioFiltro] = useState(obtenerAnioActual());
  const obtenerMesActual = () => {
    const hoy = new Date();
    return String(hoy.getMonth() + 1).padStart(2, "0");
  };
  const [mesFiltro, setMesFiltro] = useState(obtenerMesActual());
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [responsable, setResponsable] = useState("");
  const [fechaSesion, setFechaSesion] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [mostrarModal, setMostrarModal] = useState(false);

  const STORAGE_DATA = "energia_data";
  const STORAGE_MODO = "modo_nueva_inspeccion_energia";

  useEffect(() => {
    const guardado = localStorage.getItem("responsable");
    if (guardado) setResponsable(guardado);
  }, []);

  const handleResponsable = (valor: string) => {
    setModoNuevaInspeccion(false);
    setResponsable(valor);
    localStorage.setItem("responsable", valor);
    localStorage.removeItem("modo_nueva_inspeccion");
  };

  useEffect(() => {
    const data = {
      valores,
      observaciones,
    };
    localStorage.setItem(STORAGE_DATA, JSON.stringify(data));
  }, [valores, observaciones]);

  useEffect(() => {
    if (modoNuevaInspeccion) return; // 🔥 CLAVE

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
    if (!dataBackend.length) return;
    if (modoNuevaInspeccion) return;

    const nuevosValores: RegistroValores = {};
    const nuevasObservaciones: RegistroObservaciones = {};

    dataBackend.forEach((area) => {

      const filaKey = `${fechaSesion}__${responsable}__${area.id}`;

      const inspeccion = inspecciones
        .filter((i) =>
          i.area_id === area.id &&
          i.responsable === responsable &&
          i.fecha?.split("T")[0] === fechaSesion
        )
        .slice(-1)[0];

      if (!inspeccion) return;

      nuevosValores[filaKey] = {
        1: {
          c: String(inspeccion.bombillas_c || ""),
          nc: String(inspeccion.bombillas_nc || ""),
        },
        2: {
          c: String(inspeccion.reflectores_c || ""),
          nc: String(inspeccion.reflectores_nc || ""),
        },
        3: {
          c: String(inspeccion.lamparas_c || ""),
          nc: String(inspeccion.lamparas_nc || ""),
        },
        4: {
          c: String(inspeccion.aires_c || ""),
          nc: String(inspeccion.aires_nc || ""),
        },
      };

      nuevasObservaciones[filaKey] = inspeccion.observacion || "";
    });

    setValores(nuevosValores);
    setObservaciones(nuevasObservaciones);

  }, [dataBackend, inspecciones, responsable, fechaSesion, modoNuevaInspeccion]);
  useEffect(() => {
    const init = async () => {
      try {
        const guardado = localStorage.getItem("responsable");
        if (guardado) setResponsable(guardado);
        const dataLocal = localStorage.getItem(STORAGE_DATA);
        if (dataLocal) {
          const parsed = JSON.parse(dataLocal);
          setValores(parsed.valores || {});
          setObservaciones(parsed.observaciones || {});
        }
        const [areasRes, inspeccionesRes] = await Promise.all([
          fetch("/api/areas"),
          fetch("/api/inspecciones-energia"),
        ]);
        const areas = await areasRes.json();
        console.log("AREAS:", areas); // 🔍 DEBUG
        setdataBackend(Array.isArray(areas) ? areas : []);
        const inspeccionesData = await inspeccionesRes.json();
        setInspecciones(inspeccionesData);
      } catch (error) {
        console.error("Error inicializando:", error);
      }
    };
    init();
  }, []);


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


  const editarContenedor = (index: number) => {
    Swal.fire({
      icon: "info",
      title: "Modo edición",
      text: "Ahora puedes modificar los datos y guardar",
      timer: 1500,
      showConfirmButton: false,
    });
  };

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
      : "bg-gray-50 text-gray-700",

    fila: modoNoche
      ? "bg-[#111111] hover:bg-[#1b1b1b]"
      : "bg-white hover:bg-gray-50",

    borde: modoNoche ? "border-[#303030]" : "border-gray-200",

    linea: modoNoche ? "border-[#3a3a3a]" : "border-gray-200",

    totalGeneral: modoNoche
      ? "bg-[#1a1a1a] text-gray-200"
      : "bg-[#f8fafc] text-gray-700",

    chip: modoNoche
      ? "bg-[#202020] text-gray-200 border border-[#353535]"
      : "bg-gray-100 text-gray-700 border border-gray-200",
  };

  const tieneDatos = (index: number) => {
    const valoresFila = valores[index];
    if (!valoresFila) return false;

    return Object.values(valoresFila).some((campo: any) => {
      return Number(campo?.c || 0) > 0 || Number(campo?.nc || 0) > 0;
    });
  };



  const aniosDisponibles = useMemo(() => {
    const setAnios = new Set<string>();

    inspecciones.forEach((item) => {
      if (item.fecha) {
        const anio = new Date(item.fecha).getFullYear();
        setAnios.add(String(anio));
      }
    });

    const aniosOrdenados = Array.from(setAnios).sort(
      (a, b) => Number(b) - Number(a),
    );

    return ["Todos", ...aniosOrdenados];
  }, [inspecciones]);






  const inspeccionesPorFecha = useMemo(() => {
    const grupos: Record<string, any[]> = {};

    inspecciones.forEach((item) => {
      const clave = `${item.fecha || "sin-fecha"}__${item.responsable || "sin-responsable"}`;

      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(item);
    });

    return grupos;
  }, [inspecciones]);

  const inspeccionesFiltradas = useMemo(() => {
    return Object.entries(inspeccionesPorFecha)
      .filter(([clave]) => {
        const [fechaBase] = clave.split("__");
        const d = new Date(fechaBase);

        if (isNaN(d.getTime())) return false;

        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const anio = String(d.getFullYear());

        return (
          (mesFiltro === "Todos" || mes === mesFiltro) &&
          (anioFiltro === "Todos" || anio === anioFiltro)
        );
      })
      .sort((a, b) => {
        const [fechaA] = a[0].split("__");
        const [fechaB] = b[0].split("__");
        return new Date(fechaB).getTime() - new Date(fechaA).getTime();
      });
  }, [inspeccionesPorFecha, mesFiltro, anioFiltro]);



  const obtenerValor = (
    filaKey: string,
    campo: number,
    tipo: "c" | "nc",
    registro: any
  ): number => {

    // 🔹 valor escrito por el usuario
    const valorLocal = valores?.[filaKey]?.[campo]?.[tipo];

    if (valorLocal !== undefined && valorLocal !== "") {
      return Number(valorLocal);
    }

    // 🔹 valor del backend
    if (registro) {
      const baseKey = camposMap[campo];
      if (!baseKey) return 0;

      return Number(registro[`${baseKey}_${tipo}`] || 0);
    }

    return 0;
  };




  const guardarFila = async (
    filaKey: string,
    area: any,
    registro: any
  ) => {
    try {
      if (!area?.id) return;

      // ❌ NO PERMITIR CREAR
      if (!registro?.id) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "No puedes crear registros aquí",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      const responsableFinal =
        (typeof responsable === "string" && responsable.trim()) ||
        registro?.responsable ||
        "";

      if (!responsableFinal) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "Falta responsable",
          timer: 1200,
          showConfirmButton: false,
        });
        return;
      }

      const body = {
        id: registro.id,
        fecha: registro.fecha,
        responsable: responsableFinal,
        area_id: area.id,

        bombillas_c: obtenerValor(filaKey, 1, "c", registro),
        bombillas_nc: obtenerValor(filaKey, 1, "nc", registro),

        reflectores_c: obtenerValor(filaKey, 2, "c", registro),
        reflectores_nc: obtenerValor(filaKey, 2, "nc", registro),

        lamparas_c: obtenerValor(filaKey, 3, "c", registro),
        lamparas_nc: obtenerValor(filaKey, 3, "nc", registro),

        aires_c: obtenerValor(filaKey, 4, "c", registro),
        aires_nc: obtenerValor(filaKey, 4, "nc", registro),

        observacion:
          observaciones[filaKey] ||
          registro?.observacion ||
          "",
      };

      const response = await fetch("/api/inspecciones-energia", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();

        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          text: errorText,
        });

        return;
      }

      const res = await fetch("/api/inspecciones-energia");
      const data = await res.json();

      const dataFinal = Array.isArray(data) ? data : data?.data || [];

      setInspecciones(dataFinal);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Actualizado correctamente",
        timer: 1200,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: "No se pudo actualizar",
      });
    }
  };


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

    Object.keys(valores).forEach((fila) => {
      const c = Number(valores?.[Number(fila)]?.[campo]?.c || 0);
      const nc = Number(valores?.[Number(fila)]?.[campo]?.nc || 0);
      total += c + nc;
    });

    return total;
  };

  const totalGeneral = () => {
    let total = 0;

    Object.keys(valores).forEach((fila) => {
      campos.forEach((c) => {
        total +=
          Number(valores?.[Number(fila)]?.[c.key]?.c || 0) +
          Number(valores?.[Number(fila)]?.[c.key]?.nc || 0);
      });
    });

    return total;
  };

  return (
    <div className={`w-full rounded-3xl p-3 sm:p-4 md:p-6 ${estilos.tarjeta}`}>
      {/* ENCABEZADO */}
      <div className=" mb-5 flex flex-col gap-4">
        <div className="text-center">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-wide ${estilos.titulo}`}
          >
            Gestión de Energia
          </h2>
          <p className={`mt-1 text-xs sm:text-sm ${estilos.subtitulo}`}>
            Control de inspecciones de Energia, filtros e historial en tiempo real
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
              Nueva inspección de Energía
            </button>

            {/* BOTÓN EXPORTAR PDF */}
            <button
              onClick={() => exportarEnergiaPDF(inspecciones)}
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
              {MESES.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  Mes: {mes.label}
                </option>
              ))}
            </select>

            <div className="relative w-full">
              <Plus
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              />

              <input
                type="text"
                placeholder="Crear nueva área y presionar Enter..."
                className={`w-full rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none 
    ${modoNoche
                    ? "bg-[#222] border border-[#3a3a3a] text-white placeholder:text-gray-400"
                    : "bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400"
                  }`}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();

                    const input = e.target as HTMLInputElement;
                    const valor = input.value.trim();

                    if (!valor) return;

                    try {
                      // 🔥 guardar en backend
                      const res = await fetch("/api/areas", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          nombre: valor,
                        }),
                      });

                      if (!res.ok) throw new Error("Error al guardar");

                      const nuevaArea = await res.json();

                      // 🔥 actualizar tabla SIN recargar
                      setdataBackend((prev) => [...prev, nuevaArea]);

                      // 🔥 alerta bonita
                      Swal.fire({
                        toast: true,
                        position: "top-end", // arriba derecha (en móvil se ve arriba)
                        icon: "success",
                        title: "Área creada",
                        text: valor,
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,

                        // 🎨 ESTILO BLANCO
                        background: "#ffffff",
                        color: "#1f2937",
                        width: "280px",

                        // 🔥 bordes suaves y sombra elegante
                        customClass: {
                          popup: "rounded-xl shadow-md",
                        },
                      });

                      input.value = ""; // limpiar input
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

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs ${estilos.chip}`}>
              Registros visibles: {inspeccionesFiltradas.length}
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

      <>
        {/*------------------ VISTA MOVIL -------------------------*/}
        <MovilEnergia
          modoNoche={modoNoche ?? false}// ✅ CORRECTO
          dataBackend={dataBackend}
          setInspecciones={setInspecciones}
          mostrarModal={mostrarModal}
          setMostrarModal={setMostrarModal}
        />

        {/*------------------ VISTA DESKTOP------------------------ */}
        <div
          className={`lg:block p-4 rounded-2xl ${modoNoche ? "bg-[#0f0f0f]" : "bg-gray-100"
            }`}
        >
          {inspeccionesFiltradas.map(([clave, registros]) => {
            const [fecha, responsableGrupo] = clave.split("__");

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
                  <h2
                    className={`text-xl font-bold tracking-wide ${modoNoche ? "text-white" : "text-gray-800"
                      }`}
                  >
                    {new Date(fecha).toLocaleDateString("es-CO", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>

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

                {/* TABLA */}
                <div
                  className={`overflow-auto rounded-2xl border ${modoNoche
                    ? "bg-[#1a1a1a] border-[#2f2f2f]"
                    : "bg-white border-gray-200"
                    }`}
                >
                  <table className="w-full text-sm border-collapse">
                    {/* HEADER */}
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

                    {/* BODY */}
                    <tbody>
                      {dataBackend.map((area: any) => {
                        const filaKey = `${fecha}__${responsableGrupo}__${area.id}`;
                        const registro = registros.find(
                          (r) => r.area_id === area.id,
                        );

                        return (
                          <tr
                            key={filaKey}
                            className={`transition ${modoNoche
                              ? "bg-[#181818] hover:bg-[#1f1f1f]"
                              : "bg-white hover:bg-gray-50"
                              }`}
                          >
                            {/* AREA */}
                            <td
                              className={`p-3 border ${modoNoche
                                ? "border-[#353535]"
                                : "border-gray-200"
                                }`}
                            >

                              <input
                                value={area.nombre || ""}
                                onChange={(e) => {
                                  const nuevo = e.target.value;
                                  setdataBackend((prev) =>
                                    prev.map((item) =>
                                      item.id === area.id
                                        ? { ...item, nombre: nuevo }
                                        : item,
                                    ),
                                  );
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();

                                    const valor = (area.nombre || "").trim();

                                    try {
                                      // =========================
                                      // ❌ ELIMINAR
                                      // =========================
                                      if (!valor) {
                                        const res = await fetch(`/api/areas?id=${area.id}`, {
                                          method: "DELETE",
                                        });

                                        if (!res.ok) {
                                          const errorText = await res.text();
                                          console.error("ERROR BACKEND:", errorText);
                                          throw new Error(errorText);
                                        }

                                        // 🔥 actualizar UI
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

                                      // =========================
                                      // ✏️ EDITAR
                                      // =========================
                                      const res = await fetch(`/api/areas`, {
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
                                        console.error("ERROR BACKEND:", errorText);
                                        throw new Error(errorText);
                                      }

                                      // 🔥 actualizar UI local
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

                            {/* CAMPOS */}
                            {campos.map((c) => {
                              const base = camposMap[c.key];

                              const cVal = registro ? Number(registro[`${base}_c`] || 0) : 0;
                              const ncVal = registro ? Number(registro[`${base}_nc`] || 0) : 0;

                              const total = Number(cVal) + Number(ncVal);

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
                                      {/* CUMPLE */}
                                      <input
                                        value={
                                          obtenerValor(filaKey, c.key, "c", registro) === 0
                                            ? ""
                                            : obtenerValor(filaKey, c.key, "c", registro)
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            filaKey,
                                            c.key,
                                            "c",
                                            e.target.value
                                          )
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            guardarFila(filaKey, area, registro);
                                        }}
                                        className={`w-full text-center rounded-lg py-1 border ${modoNoche
                                          ? "bg-[#111] text-white border-[#2f2f2f]"
                                          : "bg-white text-gray-700 border-gray-200"
                                          }`}
                                      />

                                      {/* NO CUMPLE */}
                                      <input
                                        value={
                                          obtenerValor(filaKey, c.key, "nc", registro) === 0
                                            ? ""
                                            : obtenerValor(filaKey, c.key, "nc", registro)
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            filaKey,
                                            c.key,
                                            "nc",
                                            e.target.value
                                          )
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            guardarFila(filaKey, area, registro);
                                        }}
                                        className={`w-full text-center rounded-lg py-1 border ${modoNoche
                                          ? "bg-[#111] text-white border-[#2f2f2f]"
                                          : "bg-white text-gray-700 border-gray-200"
                                          }`}
                                      />
                                    </div>

                                    {/* TOTAL */}
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

                            {/* OBSERVACIONES */}
                            <td
                              className={`p-3 border ${modoNoche
                                ? "border-[#353535]"
                                : "border-gray-200"
                                }`}
                            >
                              <div className="flex flex-col gap-2">
                                <textarea
                                  value={
                                    observaciones[filaKey] !== undefined
                                      ? observaciones[filaKey]
                                      : registro?.observacion || ""
                                  }
                                  onChange={(e) =>
                                    handleObs(filaKey, e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      guardarFila(filaKey, area, registro);
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
                                  Total: {registro?.total || 0}
                                </div>
                              </div>

                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* 🔥 RESUMEN CON MISMO DISEÑO */}
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
                          : "text-gray-600 bg-gray-50"
                          }`}
                      >
                        <th
                          className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          Tipo
                        </th>
                        <th
                          className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          ✔ Cumple
                        </th>
                        <th
                          className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          ✖ No cumple
                        </th>
                        <th
                          className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
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
                          const base = camposMap[c.key];
                          totalC += Number(r[`${base}_c`] || 0);
                          totalNC += Number(r[`${base}_nc`] || 0);
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
                              className={`p-3 border font-semibold ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                            >
                              {c.nombre}
                            </td>

                            <td
                              className={`p-3 border text-center ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                            >
                              {totalC}
                            </td>

                            <td
                              className={`p-3 border text-center ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                            >
                              {totalNC}
                            </td>

                            <td
                              className={`p-3 border text-center font-bold ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                            >
                              {totalC + totalNC}
                            </td>
                          </tr>
                        );
                      })}

                      {/* 🔥 TOTAL GENERAL */}
                      <tr
                        className={`font-bold ${modoNoche ? "bg-[#222]" : "bg-gray-100"
                          }`}
                      >
                        <td
                          className={`p-3 border ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          TOTAL
                        </td>

                        <td
                          className={`p-3 border text-center ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          {registros.reduce((acc, r) => {
                            return (
                              acc +
                              Number(r.bombillas_c || 0) +
                              Number(r.reflectores_c || 0) +
                              Number(r.lamparas_c || 0) +
                              Number(r.aires_c || 0)
                            );
                          }, 0)}
                        </td>

                        <td
                          className={`p-3 border text-center ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          {registros.reduce((acc, r) => {
                            return (
                              acc +
                              Number(r.bombillas_nc || 0) +
                              Number(r.reflectores_nc || 0) +
                              Number(r.lamparas_nc || 0) +
                              Number(r.aires_nc || 0)
                            );
                          }, 0)}
                        </td>

                        <td
                          className={`p-3 border text-center ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          {registros.reduce(
                            (acc, r) => acc + Number(r.total || 0),
                            0,
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

      {/* FOOTER */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm ${estilos.chip}`}
        >
          Día actual: <span className="font-semibold">{fechaActual}</span>
        </div>

        <div
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm ${estilos.chip}`}
        >
          Responsable:{" "}
          <span className="font-semibold">
            {responsable ? responsable : "Pendiente por asignar"}
          </span>
        </div>
      </div>
    </div>
  );
}

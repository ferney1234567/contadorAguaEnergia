"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  User2,
  Filter,
  History,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";

type RegistroValores = {
  [fila: number]: { [campo: number]: { c?: string; nc?: string } };
};
type RegistroObservaciones = { [fila: number]: string };
interface Props {
  modoNoche?: boolean;
  dataBackend: any[];
}

export default function TablaReciclaje({
  modoNoche,
  dataBackend: dataInicial,
}: Props) {
  const [dataBackend, setdataBackend] = useState<any[]>(
    Array.isArray(dataInicial) ? dataInicial : [],
  );
  const campos = [
    { key: 1, nombre: "Reciclables", img: "/img/reciclable.png" },
    { key: 2, nombre: "Ordinarios", img: "/img/ordinarios.png" },
    { key: 3, nombre: "Peligrosos", img: "/img/peligroso.png" },
    { key: 4, nombre: "Presintos", img: "/img/presintos.png" },
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

  useEffect(() => {
    const guardado = localStorage.getItem("responsable");
    if (guardado) setResponsable(guardado);
  }, []);

  const handleResponsable = (valor: string) => {
    setModoNuevaInspeccion(false); // 🔥 vuelve a modo normal
    setResponsable(valor);
    localStorage.setItem("responsable", valor);
  };

  useEffect(() => {
    const data = {
      valores,
      observaciones,
    };
    localStorage.setItem("residuos_data", JSON.stringify(data));
  }, [valores, observaciones]);

  useEffect(() => {
    const data = localStorage.getItem("residuos_data");
    if (data) {
      const parsed = JSON.parse(data);
      setValores(parsed.valores || {});
      setObservaciones(parsed.observaciones || {});
    }
  }, []);

  const finalizarInspeccion = async () => {
    setModoNuevaInspeccion(true); // 🔥 IMPORTANTE

    localStorage.removeItem("residuos_data");
    setValores({});
    setObservaciones({});

    const res = await fetch("/api/inspecciones-residuos");
    const data = await res.json();
    setInspecciones(data);

    Swal.fire({
      icon: "success",
      title: "Inspección finalizada",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    if (!dataBackend.length) return;

    // 🔥 EVITA QUE RELLENE CUANDO ES NUEVA INSPECCIÓN
    if (modoNuevaInspeccion) return;

    const nuevosValores: RegistroValores = {};
    const nuevasObservaciones: RegistroObservaciones = {};

    dataBackend.forEach((area, index) => {
      const inspeccion = inspecciones.find((i) => i.area_id === area.id);
      if (!inspeccion) return;

      nuevosValores[index] = {
        1: {
          c: String(inspeccion.reciclables_c || ""),
          nc: String(inspeccion.reciclables_nc || ""),
        },
        2: {
          c: String(inspeccion.ordinarios_c || ""),
          nc: String(inspeccion.ordinarios_nc || ""),
        },
        3: {
          c: String(inspeccion.peligrosos_c || ""),
          nc: String(inspeccion.peligrosos_nc || ""),
        },
        4: {
          c: String(inspeccion.presintos_c || ""),
          nc: String(inspeccion.presintos_nc || ""),
        },
      };

      nuevasObservaciones[index] = inspeccion.observacion || "";
    });

    setValores(nuevosValores);
    setObservaciones(nuevasObservaciones);
  }, [dataBackend, inspecciones]);

  useEffect(() => {
    const init = async () => {
      try {
        const guardado = localStorage.getItem("responsable");
        if (guardado) setResponsable(guardado);
        const dataLocal = localStorage.getItem("residuos_data");
        if (dataLocal) {
          const parsed = JSON.parse(dataLocal);
          setValores(parsed.valores || {});
          setObservaciones(parsed.observaciones || {});
        }
        const [areasRes, inspeccionesRes] = await Promise.all([
          fetch("/api/area"),
          fetch("/api/inspecciones-residuos"),
        ]);
        const areas = await areasRes.json();
        console.log("AREAS:", areas); // 🔍 DEBUG
        setdataBackend(Array.isArray(areas) ? areas : []);
        const inspeccionesData = await inspeccionesRes.json();
        setdataBackend(areas);
        setInspecciones(inspeccionesData);
      } catch (error) {
        console.error("Error inicializando:", error);
      }
    };
    init();
  }, []);
  const tieneDatos = (index: number) => {
    const valoresFila = valores[index];
    if (!valoresFila) return false;
    return Object.values(valoresFila).some((campo: any) => {
      return Number(campo?.c || 0) > 0 || Number(campo?.nc || 0) > 0;
    });
  };

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
    fila: number,
    campo: number,
    tipo: "c" | "nc",
    value: string,
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

  const mesesDisponibles = useMemo(() => {
    if (!Array.isArray(dataBackend)) return ["Todos"];

    const setMeses = new Set<string>();
    dataBackend.forEach((fila) => setMeses.add(obtenerMes(fila)));

    return ["Todos", ...Array.from(setMeses)];
  }, [dataBackend]);

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
        const cVal = Number(valores?.[Number(fila)]?.[c.key]?.c || 0);
        const ncVal = Number(valores?.[Number(fila)]?.[c.key]?.nc || 0);
        total += cVal + ncVal;
      });
    });

    return total;
  };

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

  // 🔥 AQUÍ SÍ
  const hayDatosEnMes = inspeccionesFiltradas.length > 0;

  const guardarFila = async (
    index: number,
    area: any,
    registro: any, // 🔥 IMPORTANTE
  ) => {
    console.log("RESPONSABLE ACTUAL:", responsable);

    // 🔥 RESPONSABLE CORRECTO
    const responsableFinal = responsable?.trim() || registro?.responsable || "";

    if (!area?.id) return;

    if (!responsableFinal) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Falta responsable",
        timer: 1200,
        showConfirmButton: false,
        width: "250px",
      });
      return;
    }

    const body = {
      // 🔥 FORMATO CORRECTO PARA FASTAPI
      fecha: new Date().toISOString(),

      responsable: responsableFinal,
      area_id: area.id,

      reciclables_c: Number(valores?.[index]?.[1]?.c || 0),
      reciclables_nc: Number(valores?.[index]?.[1]?.nc || 0),

      ordinarios_c: Number(valores?.[index]?.[2]?.c || 0),
      ordinarios_nc: Number(valores?.[index]?.[2]?.nc || 0),

      peligrosos_c: Number(valores?.[index]?.[3]?.c || 0),
      peligrosos_nc: Number(valores?.[index]?.[3]?.nc || 0),

      presintos_c: Number(valores?.[index]?.[4]?.c || 0),
      presintos_nc: Number(valores?.[index]?.[4]?.nc || 0),

      observacion: observaciones[index] || "",
    };

    try {
      console.log("ENVIANDO:", body);

      const response = await fetch("/api/inspecciones-residuos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // 🔥 VALIDAR ERROR REAL DEL BACKEND
      if (!response.ok) {
        const errorText = await response.text();
        console.error("ERROR BACKEND:", errorText);

        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          text: errorText,
        });
        return;
      }

      // 🔥 RECARGAR DATOS
      const res = await fetch("/api/inspecciones-residuos/");
      const data = await res.json();
      setInspecciones(data);

      // 🔥 ALERTA PEQUEÑA
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Guardado",
        timer: 1200,
        showConfirmButton: false,
        width: "250px",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error al guardar",
      });
    }
  };

  return (
    <div className={`w-full rounded-3xl p-3 sm:p-4 md:p-6 ${estilos.tarjeta}`}>
      {/* ENCABEZADO */}
      <div className=" mb-5 flex flex-col gap-4">
        <div className="text-center">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-wide ${estilos.titulo}`}
          >
            Gestión de Residuos
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
                onChange={(e) => handleResponsable(e.target.value)}
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
    ${
      modoNoche
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
                      const res = await fetch("/api/area", {
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
        <div className="block lg:hidden space-y-4">
          {/* 🔥 FORMULARIO PARA TODAS LAS ÁREAS */}
          {dataBackend.map((fila: any) => {
            const indiceOriginal = dataBackend.indexOf(fila);

            return (
              <div
                key={"form-" + indiceOriginal}
                className={`rounded-2xl p-4 border ${estilos.borde} ${estilos.fila}`}
              >
                <h4 className="font-bold text-base mb-4 text-center">
                  {fila.nombre} 📝
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {campos.map((c) => (
                    <div
                      key={c.key}
                      className={`rounded-xl border p-3 ${estilos.borde}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <img src={c.img} className="w-8 h-8 object-contain" />
                        <span className="text-sm font-semibold">
                          {c.nombre}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={valores?.[indiceOriginal]?.[c.key]?.c || ""}
                          onChange={(e) =>
                            handleChange(
                              indiceOriginal,
                              c.key,
                              "c",
                              e.target.value,
                            )
                          }
                          placeholder="✔ Cumple"
                          className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                        />

                        <input
                          value={valores?.[indiceOriginal]?.[c.key]?.nc || ""}
                          onChange={(e) =>
                            handleChange(
                              indiceOriginal,
                              c.key,
                              "nc",
                              e.target.value,
                            )
                          }
                          placeholder="✖ No cumple"
                          className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                        />
                      </div>
                    </div>
                  ))}

                  <textarea
                    placeholder="Observación..."
                    onChange={(e) => handleObs(indiceOriginal, e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm ${estilos.input}`}
                  />

                  {/* 🔥 GUARDAR */}
                  <button
                    onClick={async () => {
                      if (!responsable) {
                        alert("Debes escribir el responsable");
                        return;
                      }

                      const body = {
                        fecha: new Date().toISOString().split("T")[0],
                        responsable,
                        area_id: fila.id,

                        reciclables_c: Number(
                          valores?.[indiceOriginal]?.[1]?.c || 0,
                        ),
                        reciclables_nc: Number(
                          valores?.[indiceOriginal]?.[1]?.nc || 0,
                        ),

                        ordinarios_c: Number(
                          valores?.[indiceOriginal]?.[2]?.c || 0,
                        ),
                        ordinarios_nc: Number(
                          valores?.[indiceOriginal]?.[2]?.nc || 0,
                        ),

                        peligrosos_c: Number(
                          valores?.[indiceOriginal]?.[3]?.c || 0,
                        ),
                        peligrosos_nc: Number(
                          valores?.[indiceOriginal]?.[3]?.nc || 0,
                        ),

                        presintos_c: Number(
                          valores?.[indiceOriginal]?.[4]?.c || 0,
                        ),
                        presintos_nc: Number(
                          valores?.[indiceOriginal]?.[4]?.nc || 0,
                        ),

                        observacion: observaciones[indiceOriginal] || "",
                      };

                      await fetch("/api/inspecciones-residuos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      });

                      // 🔥 volver a traer datos
                      const inspeccionesRes = await fetch(
                        "/api/inspecciones-residuos",
                      );
                      const nuevasInspecciones = await inspeccionesRes.json();
                      setInspecciones(nuevasInspecciones);

                      // 🔥 limpiar inputs (opcional)
                      setValores({});
                      setObservaciones({});

                      // 🔥 alerta bonita
                      Swal.fire({
                        icon: "success",
                        title: "Guardado",
                        text: "Datos guardados correctamente",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl"
                  >
                    Guardar
                  </button>
                  <div className="flex gap-2">
                    {tieneDatos(indiceOriginal) && (
                      <button
                        onClick={() => editarContenedor(indiceOriginal)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 🔥 DATOS EXISTENTES */}
          {inspeccionesFiltradas.length > 0 &&
            (dataBackendFiltrada || []).map((fila: any) => {
              const indiceOriginal = dataBackend.indexOf(fila);

              return (
                <div
                  key={"data-" + indiceOriginal}
                  className={`rounded-2xl p-4 border ${estilos.borde} ${estilos.fila}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-base">{fila.nombre}</h4>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold
          ${
            modoNoche
              ? "bg-blue-900/40 text-blue-200 border border-blue-800"
              : "bg-blue-50 text-blue-600 border border-blue-200"
          }`}
                    >
                      {totalFila(indiceOriginal)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {campos.map((c) => (
                      <div
                        key={c.key}
                        className={`rounded-xl border p-3 ${estilos.borde}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <img src={c.img} className="w-8 h-8 object-contain" />
                          <span className="text-sm font-semibold">
                            {c.nombre}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={valores?.[indiceOriginal]?.[c.key]?.c || ""}
                            onChange={(e) =>
                              handleChange(
                                indiceOriginal,
                                c.key,
                                "c",
                                e.target.value,
                              )
                            }
                            className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                          />

                          <input
                            value={valores?.[indiceOriginal]?.[c.key]?.nc || ""}
                            onChange={(e) =>
                              handleChange(
                                indiceOriginal,
                                c.key,
                                "nc",
                                e.target.value,
                              )
                            }
                            className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                          />
                        </div>

                        <div
                          className={`mt-3 text-center text-sm font-semibold rounded-lg py-1
              ${modoNoche ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"}`}
                        >
                          Total: {totalCampoFila(indiceOriginal, c.key)}
                        </div>
                      </div>
                    ))}

                    <textarea
                      value={observaciones[indiceOriginal] || ""}
                      onChange={(e) =>
                        handleObs(indiceOriginal, e.target.value)
                      }
                      className={`w-full rounded-lg px-3 py-2 text-sm ${estilos.input}`}
                    />
                  </div>
                </div>
              );
            })}

          {/* TOTAL GENERAL */}
          <div className={`rounded-2xl p-4 border ${estilos.borde}`}>
            <h3 className="text-center font-bold mb-3">Total General</h3>

            <div className="grid grid-cols-2 gap-2">
              {campos.map((c) => (
                <div
                  key={c.key}
                  className={`rounded-xl p-3 text-center
      ${modoNoche ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"}`}
                >
                  <div>{c.nombre}</div>
                  <div className="font-bold text-lg">
                    {totalCampoGeneral(c.key)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <div>Total inspección</div>
              <div className="text-2xl font-bold">{totalGeneral()}</div>
            </div>
          </div>

          <button
            onClick={finalizarInspeccion}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-xl"
          >
            Finalizar inspección semanal
          </button>
        </div>

        {/*------------------ VISTA DESKTOP------------------------ */}
        <div
          className={`hidden lg:block p-4 rounded-2xl ${
            modoNoche ? "bg-[#0f0f0f]" : "bg-gray-100"
          }`}
        >
          {inspeccionesFiltradas.map(([clave, registros]) => {
            const [fecha, responsableGrupo] = clave.split("__");

            return (
              <div
                key={clave}
                className={`mb-10 rounded-2xl p-5 shadow-sm ${
                  modoNoche
                    ? "bg-[#161616] border border-[#2a2a2a]"
                    : "bg-white border border-gray-200"
                }`}
              >
                {/* HEADER */}
                <div className="mb-5 text-center">
                  <h2
                    className={`text-xl font-bold tracking-wide ${
                      modoNoche ? "text-white" : "text-gray-800"
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
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        modoNoche
                          ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}
                    >
                      📊 {registros.length} registros
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        modoNoche
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
                  className={`overflow-auto rounded-2xl border ${
                    modoNoche
                      ? "bg-[#1a1a1a] border-[#2f2f2f]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <table className="w-full text-sm border-collapse">
                    {/* HEADER */}
                    <thead>
                      <tr
                        className={`text-center text-xs uppercase ${
                          modoNoche
                            ? "text-gray-300 bg-[#202020]"
                            : "text-gray-600 bg-gray-50"
                        }`}
                      >
                        <th
                          className={`p-3 border ${
                            modoNoche ? "border-[#353535]" : "border-gray-200"
                          }`}
                        >
                          Área / Puesto
                        </th>

                        {campos.map((c) => (
                          <th
                            key={c.key}
                            className={`p-3 border ${
                              modoNoche ? "border-[#353535]" : "border-gray-200"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <img src={c.img} className="w-8 h-8 opacity-80" />
                              <span>{c.nombre}</span>
                            </div>
                          </th>
                        ))}

                        <th
                          className={`p-3 border ${
                            modoNoche ? "border-[#353535]" : "border-gray-200"
                          }`}
                        >
                          Observaciones
                        </th>
                      </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                      {dataBackend.map((area: any, index) => {
                        const registro = registros.find(
                          (r) => r.area_id === area.id,
                        );

                        return (
                          <tr
                            key={index}
                            className={`transition ${
                              modoNoche
                                ? "bg-[#181818] hover:bg-[#1f1f1f]"
                                : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            {/* AREA */}
                            <td
                              className={`p-3 border ${
                                modoNoche
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
                                onKeyDown={undefined}
                                className={`w-full text-center font-semibold rounded-xl px-3 py-2 ${
                                  modoNoche
                                    ? "bg-[#222] text-white"
                                    : "bg-gray-50 text-gray-800"
                                }`}
                              />
                            </td>

                            {/* CAMPOS */}
                            {campos.map((c) => {
                              const cVal = registro
                                ? registro[`${c.nombre.toLowerCase()}_c`] || 0
                                : 0;

                              const ncVal = registro
                                ? registro[`${c.nombre.toLowerCase()}_nc`] || 0
                                : 0;

                              const total = Number(cVal) + Number(ncVal);

                              return (
                                <td
                                  key={c.key}
                                  className={`p-2 border ${
                                    modoNoche
                                      ? "border-[#353535]"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div
                                    className={`rounded-xl p-2 ${
                                      modoNoche ? "bg-[#202020]" : "bg-gray-50"
                                    }`}
                                  >
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        value={
                                          valores?.[index]?.[c.key]?.c || ""
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            index,
                                            c.key,
                                            "c",
                                            e.target.value,
                                          )
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            guardarFila(index, area, registro);
                                        }}
                                        className={`w-full text-center rounded-lg py-1 border ${
                                          modoNoche
                                            ? "bg-[#111] text-white border-[#2f2f2f]"
                                            : "bg-white text-gray-700 border-gray-200"
                                        }`}
                                      />

                                      <input
                                        value={
                                          valores?.[index]?.[c.key]?.nc || ""
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            index,
                                            c.key,
                                            "nc",
                                            e.target.value,
                                          )
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter")
                                            guardarFila(index, area, registro);
                                        }}
                                        className={`w-full text-center rounded-lg py-1 border ${
                                          modoNoche
                                            ? "bg-[#111] text-white border-[#2f2f2f]"
                                            : "bg-white text-gray-700 border-gray-200"
                                        }`}
                                      />
                                    </div>

                                    {/* TOTAL */}
                                    <div
                                      className={`mt-2 text-center text-xs font-semibold py-1 rounded-lg border ${
                                        modoNoche
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
                              className={`p-3 border ${
                                modoNoche
                                  ? "border-[#353535]"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex flex-col gap-2">
                                <textarea
                                  value={observaciones[index] || ""}
                                  onChange={(e) =>
                                    handleObs(index, e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      guardarFila(index, area, registro);
                                  }}
                                  className={`w-full p-2 rounded-xl border ${
                                    modoNoche
                                      ? "bg-[#222] text-white border-[#2f2f2f]"
                                      : "bg-gray-50 text-gray-800 border-gray-200"
                                  }`}
                                />

                                <div
                                  className={`text-center text-sm font-semibold py-2 rounded-xl border ${
                                    modoNoche
                                      ? "bg-green-900/20 text-green-300 border-green-800/40"
                                      : "bg-green-50 text-green-700 border-green-200"
                                  }`}
                                >
                                  Total: {registro?.total || 0}
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  guardarFila(index, area, registro)
                                }
                                className="mt-2 w-full bg-blue-600 text-white py-1 rounded-lg text-xs"
                              >
                                Guardar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* 🔥 RESUMEN CON MISMO DISEÑO */}
                <div
                  className={`mt-6 overflow-auto rounded-2xl border ${
                    modoNoche
                      ? "bg-[#1a1a1a] border-[#2f2f2f]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr
                        className={`text-center text-xs uppercase ${
                          modoNoche
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
                          totalC += Number(
                            r[`${c.nombre.toLowerCase()}_c`] || 0,
                          );
                          totalNC += Number(
                            r[`${c.nombre.toLowerCase()}_nc`] || 0,
                          );
                        });

                        return (
                          <tr
                            key={c.key}
                            className={`${
                              modoNoche
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
                        className={`font-bold ${
                          modoNoche ? "bg-[#222]" : "bg-gray-100"
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
                              Number(r.reciclables_c || 0) +
                              Number(r.ordinarios_c || 0) +
                              Number(r.peligrosos_c || 0) +
                              Number(r.presintos_c || 0)
                            );
                          }, 0)}
                        </td>

                        <td
                          className={`p-3 border text-center ${modoNoche ? "border-[#353535]" : "border-gray-200"}`}
                        >
                          {registros.reduce((acc, r) => {
                            return (
                              acc +
                              Number(r.reciclables_nc || 0) +
                              Number(r.ordinarios_nc || 0) +
                              Number(r.peligrosos_nc || 0) +
                              Number(r.presintos_nc || 0)
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

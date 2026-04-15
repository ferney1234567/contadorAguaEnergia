"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, User2, Filter, Plus, Recycle, Trash2, AlertTriangle, ShieldCheck, Edit } from "lucide-react";
import Swal from "sweetalert2";
import MovilReciclaje from "./modalReciclaje";
import { exportarResiduosPDF } from "@/app/utils/exportadorResiduosPDF";
import { CheckCircle, XCircle, BarChart3 } from "lucide-react";

type RegistroValores = {
  [fila: string]: { [campo: number]: { c?: string; nc?: string } };
};

type RegistroObservaciones = {
  [fila: string]: string;
};
interface Props {
  modoNoche?: boolean;
  dataBackend: any[];
}

export default function TablaReciclaje({ modoNoche, dataBackend: dataInicial, }: Props) {

  const [dataBackend, setdataBackend] = useState<any[]>(Array.isArray(dataInicial) ? dataInicial : [],);
  const campos = [
    { key: 1, nombre: "Reciclables", icon: Recycle, color: "text-green-500" },
    { key: 2, nombre: "Ordinarios", icon: Trash2, color: "text-gray-500" },
    { key: 3, nombre: "Peligrosos", icon: AlertTriangle, color: "text-red-500" },
    { key: 4, nombre: "Presintos", icon: ShieldCheck, color: "text-blue-500" },
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
  const obtenerAnioActual = () => { return String(new Date().getFullYear()); };
  const [anioFiltro, setAnioFiltro] = useState(obtenerAnioActual());
  const obtenerMesActual = () => { const hoy = new Date(); return String(hoy.getMonth() + 1).padStart(2, "0"); };
  const [mesFiltro, setMesFiltro] = useState(obtenerMesActual());
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [responsable, setResponsable] = useState("");
  const [fechaSesion, setFechaSesion] = useState(new Date().toISOString().split("T")[0],);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoGrupo, setEditandoGrupo] = useState<string | null>(null);

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
    if (!responsable) return;

    const data = {
      valores,
      observaciones,
    };

    const key = `residuos_${responsable}`;
    localStorage.setItem(key, JSON.stringify(data));
  }, [valores, observaciones, responsable]);


  useEffect(() => {
    if (modoNuevaInspeccion) return; // 🔥 CLAVE
    const key = `residuos_${responsable}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      setValores(parsed.valores || {});
      setObservaciones(parsed.observaciones || {});
    }
  }, [modoNuevaInspeccion]);


  useEffect(() => {
    const estado = localStorage.getItem("modo_nueva_inspeccion");
    if (estado === "true") {
      setModoNuevaInspeccion(true);
    }
  }, []);

  const finalizarInspeccion = async () => {
    setModoNuevaInspeccion(true);
    localStorage.setItem("modo_nueva_inspeccion", "true"); // 🔥 CLAVE
    localStorage.removeItem(`residuos_${responsable}`);
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
    if (editandoGrupo) return; // 🔥 CLAVE

    const nuevosValores: RegistroValores = {};
    const nuevasObservaciones: RegistroObservaciones = {};

    dataBackend.forEach((area) => {
      const filaKey = `${fechaSesion}__${responsable}__${area.id}`;

      const inspeccion = inspecciones
        .filter(
          (i) =>
            i.area_id === area.id &&
            i.responsable === responsable &&
            i.fecha?.split("T")[0] === fechaSesion
        )
        .slice(-1)[0];

      if (!inspeccion) return;

      nuevosValores[filaKey] = {
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

      nuevasObservaciones[filaKey] = inspeccion.observacion || "";
    });

    // 🔥 IMPORTANTE: NO REEMPLAZAR → MEZCLAR
    setValores((prev) => ({
      ...nuevosValores,
      ...prev,
    }));

    setObservaciones((prev) => ({
      ...nuevasObservaciones,
      ...prev,
    }));

  }, [dataBackend, inspecciones, responsable, fechaSesion, editandoGrupo]);

  useEffect(() => {
    const init = async () => {
      try {
        const guardado = localStorage.getItem("responsable");
        if (guardado) setResponsable(guardado);
        const key = `residuos_${responsable}`;
        const dataLocal = localStorage.getItem(key);
        if (dataLocal) {
          const parsed = JSON.parse(dataLocal);
          setValores(parsed.valores || {});
          setObservaciones(parsed.observaciones || {});
        }
        const [areasRes, inspeccionesRes] = await Promise.all([
          fetch("/api/areas"),
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
    filaKey: string,
    campo: number,
    tipo: "c" | "nc",
    value: string,
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

  const obtenerSemana = (fecha: string) => {
    const d = new Date(fecha);
    const inicio = new Date(d.getFullYear(), 0, 1);
    const dias = Math.floor((d.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((dias + inicio.getDay() + 1) / 7);
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

  const getFilaKey = (fecha: string, responsable: string, areaId: number | string) =>
    `${fecha}__${responsable}__${areaId}`;

  const normalizarFecha = (fecha: string) => {
    if (!fecha) return "";
    return fecha.split("T")[0]; // 🔥 quita la hora
  };

  const inspeccionesPorFecha = useMemo(() => {
    const grupos: Record<string, any[]> = {};

    inspecciones.forEach((item) => {
      const fecha = normalizarFecha(item.fecha);
      const responsable = item.responsable || "sin-responsable";

      const semana = obtenerSemana(fecha);
      const anio = new Date(fecha).getFullYear();

      const clave = `${anio}__semana${semana}__${responsable}`;

      if (!grupos[clave]) {
        grupos[clave] = [];
      }

      grupos[clave].push(item);
    });

    return grupos;
  }, [inspecciones]);

  const inspeccionesFiltradas = useMemo(() => {
    return Object.entries(inspeccionesPorFecha)
      .filter(([clave]) => {
        const [anio] = clave.split("__");

        const coincideAnio =
          anioFiltro === "Todos" || anio === anioFiltro;

        return coincideAnio;
      })
      .sort((a, b) => {
        return b[0].localeCompare(a[0]);
      });
  }, [inspeccionesPorFecha, anioFiltro]);


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
      const key = `${campos.find((c) => c.key === campo)?.nombre.toLowerCase()}_${tipo}`;
      return Number(registro[key] || 0);
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

      const responsableFinal = responsable;

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
        fecha: fechaSesion,
        responsable: responsableFinal,
        area_id: area.id,

        reciclables_c: obtenerValor(filaKey, 1, "c", registroSeguro),
        reciclables_nc: obtenerValor(filaKey, 1, "nc", registroSeguro),

        ordinarios_c: obtenerValor(filaKey, 2, "c", registroSeguro),
        ordinarios_nc: obtenerValor(filaKey, 2, "nc", registroSeguro),

        peligrosos_c: obtenerValor(filaKey, 3, "c", registroSeguro),
        peligrosos_nc: obtenerValor(filaKey, 3, "nc", registroSeguro),

        presintos_c: obtenerValor(filaKey, 4, "c", registroSeguro),
        presintos_nc: obtenerValor(filaKey, 4, "nc", registroSeguro),

        observacion:
          observaciones[filaKey] ||
          registroSeguro?.observacion ||
          "",
      };

      const total =
        body.reciclables_c +
        body.reciclables_nc +
        body.ordinarios_c +
        body.ordinarios_nc +
        body.peligrosos_c +
        body.peligrosos_nc +
        body.presintos_c +
        body.presintos_nc;

      // 🔥 SOLO GUARDAR SI HAY DATOS
      if (total > 0) {
        await fetch("/api/inspecciones-residuos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: registroSeguro?.id
            ? "Registro actualizado"
            : "Registro creado",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      // 🚫 YA NO ELIMINAMOS AUTOMÁTICO

      const res = await fetch("/api/inspecciones-residuos");
      const data = await res.json();
      setInspecciones(data);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
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

          reciclables_c: Number(valores?.[filaKey]?.[1]?.c || 0),
          reciclables_nc: Number(valores?.[filaKey]?.[1]?.nc || 0),

          ordinarios_c: Number(valores?.[filaKey]?.[2]?.c || 0),
          ordinarios_nc: Number(valores?.[filaKey]?.[2]?.nc || 0),

          peligrosos_c: Number(valores?.[filaKey]?.[3]?.c || 0),
          peligrosos_nc: Number(valores?.[filaKey]?.[3]?.nc || 0),

          presintos_c: Number(valores?.[filaKey]?.[4]?.c || 0),
          presintos_nc: Number(valores?.[filaKey]?.[4]?.nc || 0),

          observacion: observaciones[filaKey] || "",
        };

        const total =
          body.reciclables_c +
          body.reciclables_nc +
          body.ordinarios_c +
          body.ordinarios_nc +
          body.peligrosos_c +
          body.peligrosos_nc +
          body.presintos_c +
          body.presintos_nc;

        // 🔥 SOLO GUARDAR (NO BORRAR AUTOMÁTICAMENTE)
        if (total > 0) {
          promesas.push(
            fetch("/api/inspecciones-residuos", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            })
          );
        }

        // 🚨 IMPORTANTE:
        // YA NO BORRAMOS AUTOMÁTICAMENTE
        // SOLO se elimina con botón manual (si quieres luego lo agregamos)
      });

      await Promise.all(promesas);

      const res = await fetch("/api/inspecciones-residuos");
      const data = await res.json();
      setInspecciones(data);

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
      });
    }
  };


  const eliminarInspeccionGrupo = async (responsableGrupo: string, fecha: string) => {
    try {
      if (!responsableGrupo) return;

      const confirm = await Swal.fire({
        title: "¿Eliminar inspección?",
        text: `Se eliminarán los registros de ${responsableGrupo}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
      });

      if (!confirm.isConfirmed) return;

      // 🔥 ELIMINAR TODOS LOS REGISTROS DE ESE RESPONSABLE Y FECHA
      await fetch("/api/inspecciones-residuos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responsable: responsableGrupo,
          fecha: fecha,
        }),
      });

      // 🔄 RECARGAR DATOS
      const res = await fetch("/api/inspecciones-residuos");
      const data = await res.json();
      setInspecciones(data);

      Swal.fire({
        icon: "success",
        title: "Inspección eliminada",
        timer: 1200,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
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
          {/* 🔥 RESUMEN GENERAL PRO */}
          <div className="grid grid-cols-3 gap-3 mt-3 max-w-xl mx-auto">

            {(() => {
              let totalC = 0;
              let totalNC = 0;

              inspecciones.forEach((r) => {
                totalC +=
                  Number(r.reciclables_c || 0) +
                  Number(r.ordinarios_c || 0) +
                  Number(r.peligrosos_c || 0) +
                  Number(r.presintos_c || 0);

                totalNC +=
                  Number(r.reciclables_nc || 0) +
                  Number(r.ordinarios_nc || 0) +
                  Number(r.peligrosos_nc || 0) +
                  Number(r.presintos_nc || 0);
              });

              const totalGeneral = totalC + totalNC;

              const cards = [
                {
                  titulo: "Cumplen",
                  valor: totalC,
                  icono: CheckCircle,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                },
                {
                  titulo: "No cumplen",
                  valor: totalNC,
                  icono: XCircle,
                  color: "text-red-500",
                  bg: "bg-red-500/10",
                },
                {
                  titulo: "Total",
                  valor: totalGeneral,
                  icono: BarChart3,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
              ];

              return cards.map((c, i) => {
                const Icono = c.icono;

                return (
                  <div
                    key={i}
                    className={`rounded-xl px-3 py-3 border shadow-sm transition-all duration-300 
          hover:shadow-md hover:-translate-y-0.5 text-center
          ${modoNoche
                        ? "bg-[#1a1a1a] border-[#2e2e2e]"
                        : "bg-white border-gray-200"
                      }`}
                  >
                    {/* ICONO */}
                    <div className={`mx-auto w-fit p-2 rounded-lg ${c.bg}`}>
                      <Icono className={`w-4 h-4 ${c.color}`} />
                    </div>

                    {/* TEXTO */}
                    <p className={`text-[10px] mt-2 ${modoNoche ? "text-gray-400" : "text-gray-500"}`}>
                      {c.titulo}
                    </p>

                    <h3 className={`text-sm font-bold ${modoNoche ? "text-white" : "text-gray-800"}`}>
                      {c.valor}
                    </h3>
                  </div>
                );
              });
            })()}

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* 📅 FECHA */}
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
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold transition ${modoNoche
                ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md"
                : "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-sm"
                } hover:scale-105 active:scale-95`}
            >
              <Plus size={16} />
              Nueva inspección de residuos
            </button>

            {/* BOTÓN EXPORTAR PDF */}
            <button
              onClick={() => exportarResiduosPDF(inspecciones)}
              className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl text-sm font-semibold transition ${modoNoche
                ? "bg-gradient-to-r from-orange-700 to-orange-500 text-white shadow-md"
                : "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
                } hover:scale-105 active:scale-95`}
            >
              ♻️ Exportar PDF
            </button>
          </div>
        </div>


        {/* 🔥 FILTROS MEJORADOS */}
        <div className={`rounded-2xl p-4 ${estilos.inputSuave}`}>

          {/* HEADER */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <h3 className="text-sm sm:text-base font-semibold">
                Filtros de búsqueda
              </h3>
            </div>


          </div>

          {/* CONTROLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

            {/* BUSCAR */}
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

            {/* AÑO */}
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

            {/* MES */}
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

            {/* CREAR ÁREA */}
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
                      const res = await fetch("/api/areas", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nombre: valor }),
                      });

                      if (!res.ok) throw new Error();

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
                    } catch {
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

          {/* CHIPS */}
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
        {/*------------------ VISTA MOVIL -------------------------*/}
        <MovilReciclaje
          modoNoche={modoNoche ?? false}// ✅ CORRECTO
          dataBackend={dataBackend}
          setInspecciones={setInspecciones}
          mostrarModal={mostrarModal}
          setMostrarModal={setMostrarModal}
        />

        {/*------------------ VISTA DESKTOP------------------------ */}
        <div
          className={` lg:block p-4 rounded-2xl ${modoNoche ? "bg-[#0f0f0f]" : "bg-gray-100"
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

                    {/* 🗑️ ELIMINAR INSPECCIÓN */}
                    <button
                      onClick={() =>
                        eliminarInspeccionGrupo(
                          responsableGrupo,
                          registros[0]?.fecha?.split("T")[0]
                        )
                      }
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
    ${modoNoche
                          ? "bg-red-700 text-white"
                          : "bg-red-500 text-white"
                        } hover:scale-105`}
                    >
                      🗑️ Eliminar inspección
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

                              {/* ICONO */}
                              {(() => {
                                const Icono = c.icon;
                                return <Icono className={`w-6 h-6 ${c.color}`} />;
                              })()}

                              {/* TEXTO */}
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
                        const filaKey = `${registros[0]?.fecha?.split("T")[0]}__${responsableGrupo}__${area.id}`;
                        const registro = registros.find(
                          (r) =>
                            r.area_id === area.id &&
                            r.responsable === responsableGrupo &&
                            r.fecha?.split("T")[0] === registros[0]?.fecha?.split("T")[0]
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
                                disabled={editandoGrupo !== clave}
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
                                      {/* ✔ CUMPLE */}
                                      <input
                                        disabled={editandoGrupo !== clave}
                                        value={
                                          valores?.[filaKey]?.[c.key]?.c !== undefined
                                            ? valores[filaKey][c.key].c
                                            : registro
                                              ? String(registro[`${c.nombre.toLowerCase()}_c`] || "")
                                              : ""
                                        }
                                        onChange={(e) =>
                                          handleChange(filaKey, c.key, "c", e.target.value)
                                        }

                                        placeholder="0"
                                        className={`w-full text-center rounded-lg py-1 border font-semibold transition ${editandoGrupo === clave
                                          ? "ring-2 ring-green-500"
                                          : ""
                                          } ${modoNoche
                                            ? "bg-[#111] text-white border-[#2f2f2f]"
                                            : "bg-white text-gray-700 border-gray-200"
                                          }`}
                                      />

                                      {/* ❌ NO CUMPLE */}
                                      <input
                                        disabled={editandoGrupo !== clave}
                                        value={
                                          valores?.[filaKey]?.[c.key]?.nc !== undefined
                                            ? valores[filaKey][c.key].nc
                                            : registro
                                              ? String(registro[`${c.nombre.toLowerCase()}_nc`] || "")
                                              : ""
                                        }
                                        onChange={(e) =>
                                          handleChange(filaKey, c.key, "nc", e.target.value)
                                        }

                                        placeholder="0"
                                        className={`w-full text-center rounded-lg py-1 border font-semibold transition ${editandoGrupo === clave
                                          ? "ring-2 ring-red-500"
                                          : ""
                                          } ${modoNoche
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
                                  disabled={editandoGrupo !== clave || !registro}
                                  value={
                                    observaciones[filaKey] !== undefined
                                      ? observaciones[filaKey]
                                      : registro?.observacion || ""
                                  }
                                  onChange={(e) => handleObs(filaKey, e.target.value)}

                                  placeholder="Escribe una observación..."
                                  className={`w-full p-2 rounded-xl border transition ${editandoGrupo === clave
                                    ? "ring-2 ring-blue-500"
                                    : ""
                                    } ${modoNoche
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
                          ? "text-gray-300 bg-red-700 text-white"
                          : "text-gray-600 bg-red-600 text-white"
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

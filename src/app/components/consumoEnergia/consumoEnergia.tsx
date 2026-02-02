"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { Download, Droplets, Calendar, Filter, CalendarDays, Info, Zap, Tag, Hash, } from "lucide-react";
import { obtenerFestivosColombia } from "../../utils/festivosColombia";
import { exportarConsumoEnergiaExcel } from "../../utils/exportarConsumoEnergiaExcel";


interface LecturaDia {
  bodega2: string;
  bodega4: string;
  total2: number;
  total4: number;
}
interface EnergiaDBItem  {
  id: number;
  fecha: string;          // ✅ FALTA ESTO
  bodega1: number;
  bodega2: number;
  total_bodega1: number;
  total_bodega2: number;
  sumatoria: number;
  created_at: string;
  updated_at: string;

}
type LecturasPorAnio = Record<
  number, // año
  Record<
    number, // mes
    Record<number, LecturaDia> // día
  >
>;

interface Props {
  modoNoche: boolean;
}


export default function ConsumoEnergia({
  modoNoche,
}: Props) {

  /* ================= FECHA ================= */
const [lecturas, setLecturas] = useState<LecturasPorAnio>({});

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();
  const toast = Swal.mixin({ toast: true, position: "top-end", timerProgressBar: true, didOpen: (toast) => { toast.onmouseenter = Swal.stopTimer; toast.onmouseleave = Swal.resumeTimer; }, });
  /* ================= ESTADOS ================= */
  const [mesSeleccionado, setMesSeleccionado] = useState<number | "todos">(mesActual);
  const [metaMensual, setMetaMensual] = useState<number | null>(null);
  const [ultimaMetaValida, setUltimaMetaValida] = useState<number>(0);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [filtroDia, setFiltroDia] = useState("");
  const [filtroTipoDia, setFiltroTipoDia] = useState<"todos" | "domingos" | "festivos" | "habiles">("todos");
  const [energiaDB, setEnergiaDB] = useState<EnergiaDBItem[]>([]);

  /* ================= ESTILOS ================= */
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-[#ffffff] text-black",
    tarjeta: "bg-white border border-gray-200 shadow-sm",
    tarjetaDark: "bg-[#1a1a1a] border border-[#333]",
    tabla: modoNoche
      ? "bg-[#1a1a1a] border-gray-600 text-white"
      : "bg-white border-gray-300 text-black",
  };
  const tarjetaClase = modoNoche
    ? "bg-[#1a1a1a] border border-[#333] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
    : "bg-white border border-gray-200 text-black shadow-sm";
  /* ================= MESES ================= */
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",];
  /* ================= FESTIVOS ================= */
  const festivos = obtenerFestivosColombia(anioSeleccionado);
  const buscadorClase = modoNoche
    ? "bg-[#1a1a1a] border border-[#333] text-white"
    : "bg-white border border-gray-200 text-black";

  const inputClase = modoNoche
    ? "bg-[#2a2a2a] border border-[#444] text-white placeholder-gray-400"
    : "bg-gray-100 border border-gray-300 text-black";

  const tablaBase = modoNoche
    ? "bg-[#1f1f1f] border-[#3a3a3a] text-gray-100"
    : "bg-white border-gray-300 text-gray-800";

  const celdaBase = modoNoche
    ? "bg-[#2a2a2a] border-[#3a3a3a]"
    : "bg-gray-50 border-gray-300";
  const celdaVacia = modoNoche ? "bg-[#252525]" : "bg-gray-100";
  const totalDias =
    typeof mesSeleccionado === "number"
      ? new Date(anioSeleccionado, mesSeleccionado + 1, 0).getDate()
      : 31;
  const fechaColombia = new Date().toLocaleDateString("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const coloresDias = {
    D: modoNoche
      ? "bg-[#1a1a1a] text-violet-300"
      : "bg-violet-100 text-violet-800",
    F: modoNoche
      ? "bg-[#1f1f1f] text-rose-300"
      : "bg-rose-100 text-rose-800",
    NA: modoNoche
      ? "bg-[#121212] text-gray-300"
      : "bg-gray-100 text-gray-800",
  };


  const mesesARenderizar = mesSeleccionado === "todos" ? meses.map((_, i) => i) : [mesSeleccionado];

  const obtenerDiasDelMes = (mes: number) => {
    const totalDiasMes = new Date(anioSeleccionado, mes + 1, 0).getDate();
    return Array.from({ length: totalDiasMes }, (_, i) => {
      const dia = i + 1;
      const fecha = new Date(anioSeleccionado, mes, dia);
      const tipo: "D" | "F" | "NA" =
        fecha.getDay() === 0
          ? "D"
          : festivos.includes(formatearFechaLocal(fecha))
            ? "F"
            : "NA";

      return { dia, tipo };
    });
  };

  const obtenerDiaHabilAnterior = (
    mes: number,
    diaActual: number,
    lecturasMes: Record<number, LecturaDia>
  ) => {
    const diasMes = obtenerDiasDelMes(mes);
    for (let d = diaActual - 1; d >= 1; d--) {
      const info = diasMes.find((x) => x.dia === d);

      if (info?.tipo === "NA" && lecturasMes[d]) {
        return lecturasMes[d];
      }
    }
    return null;
  };
  const formatearFechaLocal = (fecha: Date) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };


  useEffect(() => {
  fetch("/api/energia", { cache: "no-store" })
    .then(res => res.json())
    .then(data => {
      setEnergiaDB(data);
    })
    .catch(() => {
      toast.fire({
        icon: "error",
        title: "Error cargando consumo de energía",
      });
    });
}, []);




 useEffect(() => {
  if (!energiaDB.length) return;

  const nuevasLecturas: any = {};

  energiaDB.forEach((item) => {
    const fecha = new Date(item.fecha + "T00:00:00");

    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    const dia = fecha.getDate();

    if (!nuevasLecturas[anio]) nuevasLecturas[anio] = {};
    if (!nuevasLecturas[anio][mes]) nuevasLecturas[anio][mes] = {};

    nuevasLecturas[anio][mes][dia] = {
      bodega2: String(item.bodega1),
      bodega4: String(item.bodega2),
      total2: item.total_bodega1,
      total4: item.total_bodega2,
    };
  });

  setLecturas(nuevasLecturas);
}, [energiaDB]);



 async function guardarEnergiaEnBD(
  mes: number,
  dia: number,
  data: LecturaDia
) {
  if (!data) return;
  if (!data.bodega2 || !data.bodega4) return;

  const fechaConsumo = new Date(
    anioSeleccionado,
    mes,
    dia
  ).toISOString().split("T")[0];

  const payload = {
    fecha: fechaConsumo,
    bodega1: Number(data.bodega2),
    bodega2: Number(data.bodega4),
    total_bodega1: data.total2,
    total_bodega2: data.total4,
  };

  try {
    await fetch("/api/energia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    toast.fire({
      icon: "success",
      title: "Consumo guardado",
    });
  } catch {
    toast.fire({
      icon: "error",
      title: "Error al guardar consumo",
    });
  }
}


  useEffect(() => {
  if (mesSeleccionado === "todos") return;

  setMetaMensual(null); // reset

  fetch(
    `/api/metas?tipo=energia&anio=${anioSeleccionado}&mes=${mesSeleccionado + 1}`,
    { cache: "no-store" }
  )
    .then(res => res.json())
    .then(data => {
      if (typeof data?.meta === "number") {
        setMetaMensual(data.meta);
      } else {
        setMetaMensual(null);
      }
    });
}, [anioSeleccionado, mesSeleccionado]);


  const obtenerUltimaLecturaMesAnterior = (
    mes: number,
    lecturas: Record<number, Record<number, LecturaDia>>
  ) => {
    if (mes === 0) return null; // enero no tiene mes anterior

    const mesAnterior = mes - 1;
    const lecturasMesAnterior = lecturas[mesAnterior];
    if (!lecturasMesAnterior) return null;

    const diasOrdenados = Object.keys(lecturasMesAnterior)
      .map(Number)
      .sort((a, b) => b - a); // del último al primero

    for (const dia of diasOrdenados) {
      const lectura = lecturasMesAnterior[dia];

      const b2 = Number(lectura?.bodega2);
      const b4 = Number(lectura?.bodega4);

      if (!isNaN(b2) && !isNaN(b4) && (b2 > 0 || b4 > 0)) {
        return lectura;
      }
    }

    return null;
  };




  async function guardarMetaMensual() {
    if (mesSeleccionado === "todos") return;

    const res = await fetch("/api/metas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "energia",
        anio: anioSeleccionado,
        mes: mesSeleccionado + 1,
        meta: metaMensual,
      }),
    });

    const data = await res.json();

    // ✅ NUNCA undefined
  setMetaMensual(
  typeof data?.meta === "number" ? data.meta : null
);

    toast.fire({
      icon: "success",
      title: "Meta actualizada",
    });
  }



  useEffect(() => {
    const anioInicio = 2025;   // ajusta si quieres empezar antes
    const anioFin = 2030;

   const aniosBD = energiaDB.map((item) =>
  new Date(item.fecha + "T00:00:00").getFullYear()
    );

    const aniosCompletos = Array.from(
      new Set([
        ...aniosBD,
        ...Array.from(
          { length: anioFin - anioInicio + 1 },
          (_, i) => anioInicio + i
        ),
      ])
    ).sort((a, b) => b - a);

    setAniosDisponibles(aniosCompletos);

    if (!aniosCompletos.includes(anioSeleccionado)) {
      setAnioSeleccionado(aniosCompletos[0]);
    }
  }, [energiaDB]);



  const obtenerDiasFiltrados = (mes: number) => {
    const diasMes = obtenerDiasDelMes(mes);

    return diasMes.filter(({ dia, tipo }) => {
      if (filtroDia && Number(filtroDia) !== dia) return false;
      if (filtroTipoDia === "domingos" && tipo !== "D") return false;
      if (filtroTipoDia === "festivos" && tipo !== "F") return false;
      if (filtroTipoDia === "habiles" && tipo !== "NA") return false;
      return true;
    });
  };



  const recalcularDiasSiguientes = (
  mes: number,
  diaInicial: number,
  lecturasMes: Record<number, LecturaDia>
) => {
  const diasMes = obtenerDiasDelMes(mes);

  let lecturaAnterior: LecturaDia | null = lecturasMes[diaInicial];

  diasMes.forEach(({ dia, tipo }) => {
    if (dia <= diaInicial) return;
    if (tipo !== "NA") return;

    const actual = lecturasMes[dia];
    if (!actual || !lecturaAnterior) return;

    actual.total2 =
      actual.bodega2 && lecturaAnterior.bodega2
        ? Math.max(
            0,
            Number(actual.bodega2) - Number(lecturaAnterior.bodega2)
          )
        : 0;

    actual.total4 =
      actual.bodega4 && lecturaAnterior.bodega4
        ? Math.max(
            0,
            Number(actual.bodega4) - Number(lecturaAnterior.bodega4)
          )
        : 0;

    lecturaAnterior = actual;
  });
};

  /* ================= LÓGICA ================= */
  const limpiarNumero = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  const calcularTotal = (actual: number, anterior: number) =>
    actual - anterior;

  const handleChange = (
  mes: number,
  dia: number,
  campo: "bodega2" | "bodega4",
  valor: string
) => {
  const limpio = limpiarNumero(valor);

  // ⛔ Bloquear domingos y festivos
  const diasMes = obtenerDiasDelMes(mes);
  const diaInfo = diasMes.find((d) => d.dia === dia);

  if (diaInfo?.tipo === "D" || diaInfo?.tipo === "F") {
    return;
  }

  let datoActualizado: LecturaDia | null = null;

  setLecturas((prev) => {
    const anioData = prev[anioSeleccionado] || {};
    const mesData: Record<number, LecturaDia> = {
      ...(anioData[mes] || {}),
    };

    const actual: LecturaDia = mesData[dia] || {
      bodega2: "",
      bodega4: "",
      total2: 0,
      total4: 0,
    };

    // 🔎 Buscar lectura anterior válida (solo días hábiles)
    let anterior = obtenerDiaHabilAnterior(mes, dia, mesData);

    if (!anterior) {
      anterior = obtenerUltimaLecturaGlobal(
        anioSeleccionado,
        mes,
        prev
      );
    }

    // 🧮 CÁLCULO EXACTO COMO EXCEL → = actual - anterior
    const nuevoDia: LecturaDia = {
      ...actual,
      [campo]: limpio,

      total2:
        campo === "bodega2" && anterior?.bodega2
          ? Math.max(
              0,
              Number(limpio) - Number(anterior.bodega2)
            )
          : actual.total2,

      total4:
        campo === "bodega4" && anterior?.bodega4
          ? Math.max(
              0,
              Number(limpio) - Number(anterior.bodega4)
            )
          : actual.total4,
    };

    // 📝 Guardar el día actual
    mesData[dia] = nuevoDia;

    // 🔁 Recalcular días hábiles siguientes (sin decimales)
    recalcularDiasSiguientes(mes, dia, mesData);

    // 👉 referencia para autosave
    datoActualizado = nuevoDia;

    return {
      ...prev,
      [anioSeleccionado]: {
        ...anioData,
        [mes]: mesData,
      },
    };
  });

  // 💾 AUTOSAVE (fuera del setState)
  if (datoActualizado) {
    guardarAutomatico(mes, dia, datoActualizado);
  }
};



  const guardarAutomatico = (
    mes: number,
    dia: number,
    data: LecturaDia
  ) => {
    const b2 = Number(data.bodega2 || 0);
    const b4 = Number(data.bodega4 || 0);

    const payload = {
      fecha: new Date(anioSeleccionado, mes, dia)
        .toISOString()
        .split("T")[0],
      bodega1: b2,
      bodega2: b4,
      total_bodega1: data.total2 || 0,
      total_bodega2: data.total4 || 0,
    };

    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

    const timeout = setTimeout(async () => {
      const res = await fetch("/api/energia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result?.deleted) {
        toast.fire({
          icon: "info",
          title: "Registro eliminado",
        });
      }
    }, 600);

    setAutoSaveTimeout(timeout);
  };




  const confirmarYGuardarMeta = async () => {
    const confirmado = await Swal.fire({
      title: "¿Cambiar meta mensual?",
      text: "Esta acción actualizará la meta del mes",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#dc2626",
    });

    if (!confirmado.isConfirmed) return;

    await guardarMetaMensual(); // guarda y actualiza estado

    toast.fire({
      icon: "success",
      title: "Meta actualizada",
    });
  };



  const totalMes = (mes: number) => {
    const lecturasMes =
      lecturas?.[anioSeleccionado]?.[mes] ?? {};

    return obtenerDiasDelMes(mes)
      .reduce((acc, { dia }) => {
        const d = lecturasMes[dia];
        return d ? acc + d.total2 + d.total4 : acc;
      }, 0)
      .toFixed(2);
  };


  const totalDia = (mes: number, dia: number) => {
    const d =
      lecturas?.[anioSeleccionado]?.[mes]?.[dia];

    if (!d) return "";
    const total = d.total2 + d.total4;
    return total > 0 ? total.toFixed(2) : "";
  };

  const resumenDias = (() => {
    if (mesSeleccionado === "todos") {
      return { D: 0, F: 0, NA: 0 };
    }

    const diasMes = obtenerDiasDelMes(mesSeleccionado);

    return diasMes.reduce(
      (acc, d) => {
        acc[d.tipo]++;
        return acc;
      },
      { D: 0, F: 0, NA: 0 } as Record<"D" | "F" | "NA", number>
    );
  })();


  const obtenerUltimaLecturaGlobal = (
    anio: number,
    mes: number,
    lecturas: LecturasPorAnio
  ): LecturaDia | null => {

    // 🔁 recorrer hacia atrás meses y años
    for (let y = anio; y >= 0; y--) {
      const meses = lecturas[y];
      if (!meses) continue;

      const mesInicio = y === anio ? mes - 1 : 11;

      for (let m = mesInicio; m >= 0; m--) {
        const lecturasMes = meses[m];
        if (!lecturasMes) continue;

        const diasOrdenados = Object.keys(lecturasMes)
          .map(Number)
          .sort((a, b) => b - a);

        for (const d of diasOrdenados) {
          const lectura = lecturasMes[d];
          const b2 = Number(lectura?.bodega2);
          const b4 = Number(lectura?.bodega4);

          if (!isNaN(b2) && !isNaN(b4) && (b2 > 0 || b4 > 0)) {
            return lectura;
          }
        }
      }
    }

    return null;
  };

  const handleExportarExcel = () => {
  exportarConsumoEnergiaExcel({
  lecturas,
    anio: anioSeleccionado,
    metaMensual: metaMensual ?? ultimaMetaValida ?? 0, // ✅ BLINDAJE
    fechaExportacion: fechaColombia.replace(/\//g, "-"),
  });
};

  /* ================= RENDER ================= */
  return (
    <div className={`w-full min-h-screen p-6 ${colores.fondo}`}>
      <div className="w-full max-w-[1400px] mx-auto space-y-8">

        {/* ======================= 4 CONTENEDORES · ENERGÍA ======================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* ================= META MENSUAL ENERGÍA ================= */}
          <div className={`p-6 rounded-xl ${tarjetaClase}`}>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-semibold opacity-80">
                Meta mensual de energía
              </h4>
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                <Zap size={30} />
              </div>
            </div>

            <input
              type="number"
             value={metaMensual ?? ""}
              onChange={(e) => setMetaMensual(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmarYGuardarMeta();
                }
              }}
              className="
        w-full text-3xl font-bold text-yellow-600 tracking-tight
        bg-transparent outline-none text-center
      "
            />

            <p className="text-xs mt-1 opacity-60 text-center">
              Consumo objetivo del mes (kWh)
            </p>
          </div>

          {/* ================= MES + FECHA ================= */}
          <div className={`p-6 rounded-xl ${tarjetaClase}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold opacity-80">
                Mes en seguimiento
              </h4>
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                <CalendarDays size={30} />
              </div>
            </div>

            <p className="text-xl font-bold text-yellow-600">
              {mesSeleccionado === "todos"
                ? "Todos los meses"
                : meses[mesSeleccionado]}{" "}
              {anioSeleccionado}
            </p>

            <p className="text-sm opacity-60 mt-1 capitalize">
              {fechaColombia}
            </p>
          </div>

          {/* ================= CLASIFICACIÓN DE DÍAS ================= */}
          <div className={`p-5 rounded-xl ${tarjetaClase}`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold opacity-80">
                Clasificación de días
              </h4>
              <div className="p-1.5 rounded-full bg-yellow-100 text-yellow-600">
                <Info size={16} />
              </div>
            </div>

            <div className="space-y-2 text-xs">

              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded-md ${coloresDias.D}`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  Domingos (D)
                </div>
                <span className="text-sm font-semibold">
                  {resumenDias.D}
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded-md ${coloresDias.F}`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Festivos (F)
                </div>
                <span className="text-sm font-semibold">
                  {resumenDias.F}
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded-md ${coloresDias.NA}`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  Hábiles
                </div>
                <span className="text-sm font-semibold">
                  {resumenDias.NA}
                </span>
              </div>

            </div>

            {mesSeleccionado === "todos" && (
              <p className="text-[11px] mt-2 opacity-60 text-center">
                Selecciona un mes para ver el resumen
              </p>
            )}
          </div>

          {/* ================= EXPORTAR ENERGÍA ================= */}
          <div className={`p-6 rounded-xl ${tarjetaClase}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold opacity-80">
                Exportar energía
              </h4>
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                <Download size={30} />
              </div>
            </div>

            <button
              onClick={handleExportarExcel}
              className="
        w-full py-3 px-4 rounded-xl
        bg-gradient-to-r from-yellow-400 to-amber-500
        hover:from-yellow-500 hover:to-amber-600
        active:scale-[0.98]
        text-white font-semibold tracking-wide
        flex items-center justify-center gap-2
        transition-all duration-200
        shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
      "
            >
              <Download size={18} />
              <span>Exportar Datos</span>
            </button>
          </div>

        </div>


        {/* ======================= BUSCADOR AVANZADO · ENERGÍA ======================= */}
        <div className={`p-6 rounded-xl ${buscadorClase}`}>

          {/* TÍTULO */}
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <Filter size={18} />
            </div>
            <div>
              <h3 className="font-semibold">
                Buscador avanzado
              </h3>
              <p className="text-sm opacity-70">
                Filtra el consumo de energía por mes, año, día o tipo de día
              </p>
            </div>
          </div>

          {/* CAMPOS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* MES */}
            <div className="flex flex-col text-sm">
              <label className="mb-1 font-medium flex items-center gap-2">
                <Calendar size={14} className="text-yellow-600" />
                Mes
              </label>

              <div className="relative">
                <select
                  className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
                  value={mesSeleccionado}
                  onChange={(e) =>
                    setMesSeleccionado(
                      e.target.value === "todos"
                        ? "todos"
                        : Number(e.target.value)
                    )
                  }
                >
                  <option value="todos">Todos los meses</option>
                  {meses.map((mes, i) => (
                    <option key={i} value={i}>
                      {mes}
                    </option>
                  ))}
                </select>

                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* AÑO */}
            <div className="flex flex-col text-sm">
              <label className="mb-1 font-medium flex items-center gap-2">
                <Calendar size={14} className="text-yellow-600" />
                Año
              </label>

              <div className="relative">
                <select
                  className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
                  value={anioSeleccionado}
                  onChange={(e) =>
                    setAnioSeleccionado(Number(e.target.value))
                  }
                >
                  {aniosDisponibles.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* DÍA */}
            <div className="flex flex-col text-sm">
              <label className="mb-1 font-medium flex items-center gap-2">
                <Hash size={14} className="text-yellow-600" />
                Día (opcional)
              </label>

              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ej: 15"
                  className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
                  value={filtroDia}
                  onChange={(e) =>
                    setFiltroDia(e.target.value)
                  }
                />

                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* TIPO DE DÍA */}
            <div className="flex flex-col text-sm">
              <label className="mb-1 font-medium flex items-center gap-2">
                <Tag size={14} className="text-yellow-600" />
                Tipo de día
              </label>

              <div className="relative">
                <select
                  className={`w-full p-3 pl-10 rounded-lg ${inputClase}`}
                  value={filtroTipoDia}
                  onChange={(e) =>
                    setFiltroTipoDia(e.target.value as any)
                  }
                >
                  <option value="todos">Todos</option>
                  <option value="domingos">Domingos</option>
                  <option value="festivos">Festivos</option>
                  <option value="habiles">Hábiles</option>
                </select>

                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

          </div>
        </div>


        {/* ======================= PRIMERA TABLA (RESUMEN + CALENDARIO) ======================= */}
        {mesesARenderizar.map((mes) => {
          const diasMes = obtenerDiasDelMes(mes);

          const diasFiltradosMes = diasMes.filter(({ dia, tipo }) => {
            if (filtroDia && Number(filtroDia) !== dia) return false;
            if (filtroTipoDia === "domingos" && tipo !== "D") return false;
            if (filtroTipoDia === "festivos" && tipo !== "F") return false;
            if (filtroTipoDia === "habiles" && tipo !== "NA") return false;
            return true;
          });

          return (
            <div key={mes} className="space-y-6 mt-12">
              <div
                className={`
          rounded-xl border overflow-hidden font-sans
          ${modoNoche ? "border-gray-700 bg-[#0d0d0d]" : "border-gray-300 bg-white"}
        `}
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>

                      {/* ===== TOTAL DEL MES ===== */}
                      <tr>
                        <td
                          colSpan={diasMes.length}
                          className={`
                    text-center font-semibold tracking-wide
                    text-sm md:text-base p-3
                    border-b
                    ${modoNoche
                              ? "bg-[#141414] border-gray-700 text-emerald-400"
                              : "bg-yellow-50 border-gray-300 text-yellow-700"
                            }
                  `}
                        >
                          {meses[mes]} {anioSeleccionado} · Total consumido:{" "}
                          <span className="font-bold">
                            {totalMes(mes)} m³
                          </span>
                        </td>
                      </tr>

                      {/* ===== FILA DÍAS ===== */}
                      <tr>
                        {diasMes.map(({ dia, tipo }) => {
                          const color =
                            tipo === "D"
                              ? modoNoche
                                ? "bg-[#1a1a1a] text-gray-300"
                                : "bg-violet-100 text-violet-800"
                              : tipo === "F"
                                ? modoNoche
                                  ? "bg-[#1f1f1f] text-gray-300"
                                  : "bg-rose-100 text-rose-800"
                                : modoNoche
                                  ? "bg-[#121212] text-gray-200"
                                  : "bg-gray-100 text-gray-800";

                          return (
                            <td
                              key={dia}
                              className={`
                        text-center text-xs font-semibold
                        p-2 border
                        ${modoNoche ? "border-gray-700" : "border-gray-300"}
                        ${color}
                      `}
                            >
                              {dia}
                            </td>
                          );
                        })}
                      </tr>

                      {/* ===== FILA CONSUMO POR DÍA ===== */}
                      <tr>
                        {diasMes.map(({ dia, tipo }) => {
                          const color =
                            tipo === "D"
                              ? modoNoche
                                ? "bg-[#161616] text-gray-300"
                                : "bg-violet-100 text-violet-900"
                              : tipo === "F"
                                ? modoNoche
                                  ? "bg-[#1b1b1b] text-gray-300"
                                  : "bg-rose-100 text-rose-900"
                                : modoNoche
                                  ? "bg-[#0b0b0b] text-gray-200"
                                  : "bg-white text-gray-800";

                          return (
                            <td
                              key={dia}
                              className={`
                        h-8 text-center text-xs font-medium
                        border
                        ${modoNoche ? "border-gray-700" : "border-gray-300"}
                        ${color}
                      `}
                            >
                              {totalDia(mes, dia) || "—"}
                            </td>
                          );
                        })}
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>




              {/* ======================= SEGUNDA TABLA ======================= */}
              <div
                className={`
    overflow-x-auto rounded-xl
    border
    ${modoNoche
                    ? "border-[#2a2a2a] bg-[#0d0d0d]"
                    : "border-gray-300 bg-white"}
    font-sans
  `}
              >
                <table className="w-full text-sm border-collapse">

                  {/* ===== HEADER ===== */}
                  <thead
                    className={
                      modoNoche
                        ? "bg-[#141414] text-gray-200"
                        : "bg-yellow-50 text-yellow-800"
                    }
                  >
                    <tr>
                      {[
                        "Día",
                        "Tipo",
                        "Bodega 2",
                        "Bodega 4",
                        "Total Bodega 2",
                        "Total Bodega 4",
                      ].map((h) => (
                        <th
                          key={h}
                          className={`
              p-3 text-center font-semibold
              border
              ${modoNoche ? "border-gray-700" : "border-gray-300"}
            `}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* ===== BODY ===== */}
                  <tbody>
                    {diasFiltradosMes.map(({ dia, tipo }) => {
                      const esBloqueado = tipo === "D" || tipo === "F";

                      const d = lecturas[anioSeleccionado]?.[mes]?.[dia] ?? {
                        bodega2: "",
                        bodega4: "",
                        total2: 0,
                        total4: 0,
                      };

                      return (
                        <tr
                          key={dia}
                          className={
                            tipo === "F"
                              ? modoNoche
                                ? "bg-[#3a1f2b] hover:bg-[#4a2736]"
                                : "bg-rose-100 hover:bg-rose-200"
                              : modoNoche
                                ? "odd:bg-[#0f0f0f] even:bg-[#151515] hover:bg-[#1f1f1f]"
                                : "odd:bg-white even:bg-gray-50 hover:bg-yellow-50"
                          }
                        >
                          {/* DÍA */}
                          <td
                            className={`border p-2 text-center ${modoNoche
                                ? "border-gray-700 text-gray-200"
                                : "border-gray-300 text-gray-800"
                              }`}
                          >
                            {dia}
                          </td>

                          {/* TIPO */}
                          <td
                            className={`border p-2 text-center font-semibold ${modoNoche
                                ? "border-gray-700 text-gray-200"
                                : "border-gray-300 text-gray-800"
                              }`}
                          >
                            {tipo}
                          </td>

                          {/* BODEGA 2 */}
                          <td className={`border p-2 ${modoNoche ? "border-gray-700" : "border-gray-300"}`}>
                            <input
                              value={d.bodega2}
                              disabled={esBloqueado}
                              onChange={(e) =>
                                handleChange(mes, dia, "bodega2", e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  guardarEnergiaEnBD(
                                    mes,
                                    dia,
                                    lecturas[anioSeleccionado]?.[mes]?.[dia]
                                  );
                                }
                              }}
                              className={`
                  w-full p-1 text-center rounded border
                  ${esBloqueado
                                  ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                                  : modoNoche
                                    ? "bg-[#0b0b0b] text-gray-200 border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }
                  focus:ring-2 focus:ring-yellow-400 outline-none
                `}
                            />
                          </td>

                          {/* BODEGA 4 */}
                          <td className={`border p-2 ${modoNoche ? "border-gray-700" : "border-gray-300"}`}>
                            <input
                              value={d.bodega4}
                              disabled={esBloqueado}
                              onChange={(e) =>
                                handleChange(mes, dia, "bodega4", e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  guardarEnergiaEnBD(
                                    mes,
                                    dia,
                                    lecturas[anioSeleccionado]?.[mes]?.[dia]
                                  );
                                }
                              }}
                              className={`
                  w-full p-1 text-center rounded border
                  ${esBloqueado
                                  ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                                  : modoNoche
                                    ? "bg-[#0b0b0b] text-gray-200 border-gray-600"
                                    : "bg-white text-gray-800 border-gray-300"
                                }
                  focus:ring-2 focus:ring-yellow-400 outline-none
                `}
                            />
                          </td>

                          {/* TOTALES */}
                          <td
                            className={`border p-2 text-center font-semibold ${modoNoche
                                ? "border-gray-700 text-emerald-400"
                                : "border-gray-300 text-yellow-700"
                              }`}
                          >
                            {d.total2}
                          </td>

                          <td
                            className={`border p-2 text-center font-semibold ${modoNoche
                                ? "border-gray-700 text-emerald-400"
                                : "border-gray-300 text-yellow-700"
                              }`}
                          >
                            {d.total4}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div >
          );
        })}
      </div>
    </div>
  );
}

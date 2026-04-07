"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, CalendarRange, Files, Building2, XCircle, Loader2, RefreshCcw, PencilLine, Trash2, Save, BarChart3, } from "lucide-react";
import Swal from "sweetalert2";
import React from "react";

interface Props {
  modoNoche: boolean;
}

type Area = {
  id: number;
  nombre: string;
};

type ResmaRegistro = {
  id?: number;
  area_id: number;
  anio: number;
  mes: number;
  cantidad: number;
  
};

type ValorFila = {
  mes: number;
  cantidad: string;
  registroId?: number;
};

type FilaTabla = {
  id: number;
  nombre: string;
  valores: ValorFila[];
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",];

export default function TablaResmasAvanzada({ modoNoche }: Props) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [resmas, setResmas] = useState<ResmaRegistro[]>([]);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [nuevaArea, setNuevaArea] = useState("");
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [cargando, setCargando] = useState(false);
  const [guardandoCelda, setGuardandoCelda] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [editandoAreaId, setEditandoAreaId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [confirmarEliminarId, setConfirmarEliminarId] = useState<number | null>(null);
  const inputEditarRef = useRef<HTMLInputElement>(null);
 

 const estilos = useMemo(
  () => ({
    fondo: modoNoche
      ? "bg-[#0f0f0f] text-white border border-white/10"
      : "bg-white text-gray-900 border border-gray-200",

    tarjeta: modoNoche
      ? "bg-[#121212] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      : "bg-white border border-gray-200 shadow-[0_10px_25px_rgba(0,0,0,0.06)]",

    tarjetaSuave: modoNoche
      ? "bg-[#161616] border border-white/10"
      : "bg-white border border-gray-200",

    input: modoNoche
      ? "bg-[#121212] border border-white/10 text-white placeholder:text-gray-400"
      : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400",

    headerTabla: modoNoche
      ? "bg-[#141414]"
      : "bg-gray-100",

    bordeTabla: modoNoche
      ? "border-white/10"
      : "border-gray-200",

    textoSecundario: modoNoche
      ? "text-gray-400"
      : "text-gray-500",

    hoverFila: modoNoche
      ? "hover:bg-white/5"
      : "hover:bg-gray-50",

    botonSecundario: modoNoche
      ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
      : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300",

    fondoSticky: modoNoche
      ? "bg-[#121212]"
      : "bg-white",
  }),
  [modoNoche]
);

  const toast = (icon: "success" | "error" | "warning", title: string) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
      background: "#ffffff",
      color: "#111",
      customClass: {
        popup: "rounded-xl shadow-lg",
        title: "text-sm font-semibold",
      },
    });
  };



  const generarAnios = useCallback((): number[] => {
    const anios: number[] = [];

    for (let i = 2025; i <= 2031; i++) {
      anios.push(i);
    }

    return anios;
  }, []);



  const obtenerAniosDesdeRegistros = useCallback((registros: ResmaRegistro[]): number[] => {
    const anios = [
      ...new Set(
        registros
          .map((item) => Number(item?.anio))
          .filter((anio) => Number.isFinite(anio) && anio > 0)
      ),
    ].sort((a, b) => b - a);

    return anios;
  }, []);

  const refreshData = useCallback(
    async (anioActual = anioSeleccionado) => {
      setCargando(true);
      setErrorGeneral("");

      try {
        const [areasRes, resmasRes] = await Promise.all([
          fetch("/api/areas-resmas", { cache: "no-store" }),
          fetch(`/api/resmas?anio=${anioActual}`, { cache: "no-store" }),
        ]);

        if (!areasRes.ok) {
          throw new Error("No se pudieron consultar las áreas");
        }

        if (!resmasRes.ok) {
          throw new Error("No se pudieron consultar los datos de resmas");
        }

        const areasData = await areasRes.json();
        const resmasData = await resmasRes.json();

        const areasLimpias: Area[] = Array.isArray(areasData) ? areasData : [];
        const resmasLimpias: ResmaRegistro[] = Array.isArray(resmasData) ? resmasData : [];

        setAreas((prev) => {
          return areasLimpias.length ? areasLimpias : prev;
        });
        setResmas(resmasLimpias);

        const aniosBase = generarAnios();
        const aniosDB = obtenerAniosDesdeRegistros(resmasLimpias);

        const aniosFinales = [...new Set([...aniosBase, ...aniosDB, anioActual])].sort(
          (a, b) => b - a
        );

        setAniosDisponibles(aniosFinales);
      } catch (error) {
        console.error(error);
        setErrorGeneral("No fue posible cargar la información. Revisa las rutas del backend.");
        setAreas([]);
        setResmas([]);
        setAniosDisponibles(generarAnios());
      } finally {
        setCargando(false);
      }
    },
    [anioSeleccionado, generarAnios, obtenerAniosDesdeRegistros]
  );

  useEffect(() => {
    refreshData(anioSeleccionado);
  }, [anioSeleccionado, refreshData]);

  useEffect(() => {
    if (editandoAreaId && inputEditarRef.current) {
      inputEditarRef.current.focus();
      inputEditarRef.current.select();
    }
  }, [editandoAreaId]);

  const filas: FilaTabla[] = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return areas
      .filter((area) => String(area?.nombre || "").toLowerCase().includes(texto))
      .map((area) => {
        const valores = MESES.map((_, indice) => {
          const mes = indice + 1;
          const registro = resmas.find(
            (item) => Number(item?.area_id) === Number(area.id) && Number(item?.mes) === mes
          );

          return {
            mes,
            cantidad:
              registro && Number.isFinite(Number(registro.cantidad))
                ? String(registro.cantidad)
                : "",
            registroId: registro?.id,
          };
        });

        return {
          id: area.id,
          nombre: area.nombre,
          valores,
        };
      });
  }, [areas, resmas, busqueda]);

  const resumen = useMemo(() => {
    const totalAreas = filas.length;
    const totalRegistros = filas.reduce(
      (acc, fila) => acc + fila.valores.filter((valor) => valor.cantidad !== "").length,
      0
    );
    const totalCantidad = filas.reduce(
      (acc, fila) => acc + fila.valores.reduce((suma, v) => suma + Number(v.cantidad || 0), 0),
      0
    );

    return { totalAreas, totalRegistros, totalCantidad };
  }, [filas]);

  const crearArea = async () => {
    const nombre = nuevaArea.trim();
    if (!nombre) {
      toast("warning", "Escribe un nombre");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch("/api/areas-resmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) throw new Error("Error creando área");

      setNuevaArea("");
      await refreshData(anioSeleccionado);
      toast("success", "Área creada");
    } catch (error) {
      console.error(error);
      toast("error", "No se pudo crear");
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicionArea = (area: Area) => {
    setEditandoAreaId(area.id);
    setNombreEditado(area.nombre);
    setConfirmarEliminarId(null);
  };

  const cancelarEdicionArea = () => {
    setEditandoAreaId(null);
    setNombreEditado("");
  };

  const guardarEdicionArea = async () => {
    const nombre = nombreEditado.trim();
    if (!editandoAreaId || !nombre) return;

    setCargando(true);

    try {
      const res = await fetch("/api/areas-resmas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editandoAreaId,
          nombre,
        }),
      });

      if (!res.ok) throw new Error("Error actualizando área");

      setEditandoAreaId(null);
      setNombreEditado("");
      await refreshData(anioSeleccionado);
      toast("success", "Área actualizada");
    } catch (error) {
      console.error(error);
      toast("error", "Error al editar");
    } finally {
      setCargando(false);
    }
  };

  const eliminarArea = async (id: number) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar área?",
      text: "Se borrarán todos los datos",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    setCargando(true);

    try {
      const res = await fetch(`/api/areas-resmas?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error eliminando área");

      await refreshData(anioSeleccionado);
      toast("success", "Área eliminada");
    } catch (error) {
      console.error(error);
      toast("error", "Error al eliminar");
    } finally {
      setCargando(false);
    }
  };

const eliminarDato = async (areaId: number, mes: number) => {
  try {
    const registro = resmas.find(
      (r) =>
        Number(r.area_id) === Number(areaId) &&
        Number(r.mes) === Number(mes)
    );

    if (!registro?.id) return;

    const res = await fetch(`/api/resmas?id=${registro.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error eliminando");

    // 🔥 ELIMINA SOLO LOCAL (SIN REFRESH)
    setResmas((prev) =>
      prev.filter((r) => r.id !== registro.id)
    );

    toast("success", "Eliminado");
  } catch (error) {
    console.error(error);
    toast("error", "No se pudo eliminar");
  }
};

  const guardarDato = async ({
  areaId,
  mes,
  cantidad,
}: {
  areaId: number;
  mes: number;
  cantidad: number;
}) => {
  const clave = `${areaId}-${mes}`;
  setGuardandoCelda(clave);

  try {
    const res = await fetch("/api/resmas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        area_id: areaId,
        anio: anioSeleccionado,
        mes,
        cantidad,
      }),
    });

    if (!res.ok) throw new Error("Error al guardar");

    // 🔥 ACTUALIZA SOLO ESA CELDA (SIN REFRESH)
    setResmas((prev) => {
      const existe = prev.find(
        (r) =>
          Number(r.area_id) === Number(areaId) &&
          Number(r.mes) === Number(mes)
      );

      if (existe) {
        return prev.map((r) =>
          Number(r.area_id) === Number(areaId) &&
          Number(r.mes) === Number(mes)
            ? { ...r, cantidad }
            : r
        );
      }

      return [
        ...prev,
        {
          area_id: areaId,
          anio: anioSeleccionado,
          mes,
          cantidad,
        },
      ];
    });

    toast("success", "Guardado");
  } catch (error) {
    console.error(error);
    toast("error", "Error al guardar");
  } finally {
    setGuardandoCelda(null); // 🔥 SIEMPRE se apaga el loader
  }
};

  const manejarFlechas = (
    e: React.KeyboardEvent<HTMLInputElement>,
    filaIndex: number,
    colIndex: number
  ) => {
    const key = e.key;

    const siguiente = (f: number, c: number) => {
      const id = `celda-${f}-${c}`;
      const el = document.getElementById(id);
      if (el) el.focus();
    };

    if (key === "ArrowRight") {
      e.preventDefault();
      siguiente(filaIndex, colIndex + 1);
    }

    if (key === "ArrowLeft") {
      e.preventDefault();
      siguiente(filaIndex, colIndex - 1);
    }

    if (key === "ArrowDown") {
      e.preventDefault();
      siguiente(filaIndex + 1, colIndex);
    }

    if (key === "ArrowUp") {
      e.preventDefault();
      siguiente(filaIndex - 1, colIndex);
    }
  };

 const manejarEnterCantidad = async (
  e: React.KeyboardEvent<HTMLInputElement>,
  areaId: number,
  mes: number
) => {
  if (e.key !== "Enter") return;

  const valor = e.currentTarget.value.replace(/[^0-9]/g, "");
  const cantidad = Number(valor || 0);

  // 🔥 eliminar si vacío
  if (!valor || cantidad === 0) {
    await eliminarDato(areaId, mes);
    return;
  }



  // 🔥 guardar
  await guardarDato({
    areaId,
    mes,
    cantidad,
  });
};
const comparar = (valor: number, referencia: number) => {
  if (valor === referencia) return "=";
  if (valor < referencia) return "↑";
  return "↓";
};

const totalesPorMes = useMemo(() => {
  return MESES.map((_, index) => {
    const mes = index + 1;

    return filas.reduce((total, fila) => {
      const valor = fila.valores.find(v => v.mes === mes);
      return total + Number(valor?.cantidad || 0);
    }, 0);
  });
}, [filas]);

const mesActual = new Date().getMonth(); // 0-11

const totalMesActual = useMemo(() => {
  return totalesPorMes[mesActual] || 0;
}, [totalesPorMes]);

const nombreMesActual = MESES[mesActual];

  const manejarCambioVisualCantidad = (areaId: number, mes: number, valor: string) => {
    const limpio = valor.replace(/[^0-9]/g, "");

    setResmas((prev) => {
      const existente = prev.find(
        (item) => Number(item.area_id) === Number(areaId) && Number(item.mes) === Number(mes)
      );

      if (existente) {
        return prev.map((item) =>
          Number(item.area_id) === Number(areaId) && Number(item.mes) === Number(mes)
            ? { ...item, cantidad: Number(limpio || 0) }
            : item
        );
      }

      

      return [
        ...prev,
        {
          area_id: areaId,
          anio: anioSeleccionado,
          mes,
          cantidad: Number(limpio || 0),
          
        },
      ];
    });
  };



  const renderBloqueMeses = (inicio: number, fin: number) => (
   <div
  className={`overflow-x-auto rounded-3xl ${estilos.tarjeta} touch-pan-x scroll-smooth`}
  style={{
    WebkitOverflowScrolling: "touch",
    scrollSnapType: "x mandatory",
  }}
>
      <div className="min-w-[900px] sm:min-w-[1100px] lg:min-w-[1280px] p-2 sm:p-3 md:p-4">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className={estilos.headerTabla}>
              <th
                className={`sticky left-0 z-20 min-w-[320px] rounded-l-2xl border px-4 py-4 text-left text-sm font-semibold ${estilos.bordeTabla} ${estilos.headerTabla}`}
              >
                Área / Gestión rápida
              </th>

              {MESES.slice(inicio, fin).map((mes) => (
                <React.Fragment key={mes}>
                  <th
                    className={`min-w-[110px] border px-3 py-4 text-center text-sm font-semibold ${estilos.bordeTabla} ${estilos.headerTabla}`}
                  >
                    {mes}
                  </th>
                  <th
                    className={`min-w-[58px] border px-2 py-4 text-center text-sm font-bold text-blue-500 ${estilos.bordeTabla} ${estilos.headerTabla}`}
                  >
                   Comp
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + (fin - inicio) * 2}
                  className={`border px-4 py-10 text-center ${estilos.bordeTabla} ${estilos.textoSecundario}`}
                >
                  No hay áreas para mostrar con el filtro actual.
                </td>
              </tr>
            ) : (
              filas.map((fila, filaIndex) => (
                <tr key={fila.id} className={`${estilos.hoverFila} transition`}>
                  <td
                    className={`sticky left-0 z-10 border px-4 py-3 align-top ${estilos.bordeTabla} ${estilos.fondoSticky}`}
                  >
                    {editandoAreaId === fila.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            ref={inputEditarRef}
                            value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") guardarEdicionArea();
                              if (e.key === "Escape") cancelarEdicionArea();
                            }}
                            className={`w-full rounded-2xl px-3 py-2.5 outline-none ${estilos.input}`}
                            placeholder="Nombre del área"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={guardarEdicionArea}
                            disabled={cargando}
                            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600"
                          >
                            <Save size={14} /> Guardar
                          </button>

                          <button
                            onClick={cancelarEdicionArea}
                            className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600"
                          >
                            <XCircle size={14} /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-500">
                                <Building2 size={18} />
                              </div>
                              <div>
                                <p className="truncate text-sm font-semibold">{fila.nombre}</p>
                                <p className={`text-xs ${estilos.textoSecundario}`}>
                                  Enter para editar, Enter para guardar datos
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              iniciarEdicionArea({ id: fila.id, nombre: fila.nombre })
                            }
                            className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600"
                          >
                            <PencilLine size={14} /> Editar
                          </button>

                          {confirmarEliminarId === fila.id ? (
                            <>
                              <button
                                onClick={() => eliminarArea(fila.id)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600"
                              >
                                <Trash2 size={14} /> Confirmar borrar
                              </button>

                              <button
                                onClick={() => setConfirmarEliminarId(null)}
                                className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ${estilos.botonSecundario}`}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmarEliminarId(fila.id)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {fila.valores.slice(inicio, fin).map((valor) => {
                    const clave = `${fila.id}-${valor.mes}`;
                    const guardando = guardandoCelda === clave;

                    return (
                      <React.Fragment key={clave}>
                        <td className={`border px-2 py-2 align-middle ${estilos.bordeTabla}`}>
                          <div className="relative">
                            <input
                              id={`celda-${filaIndex}-${valor.mes}`}
                              inputMode="numeric"
                              value={valor.cantidad}
                              onChange={(e) =>
                                manejarCambioVisualCantidad(
                                  fila.id,
                                  valor.mes,
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) => {
                                manejarEnterCantidad(e, fila.id, valor.mes);
                                manejarFlechas(e, filaIndex, valor.mes);
                              }}
                              placeholder="0"
                              className={`w-full rounded-xl px-3 py-2 text-center text-sm font-bold outline-none ${estilos.input}`}
                            />
                            {guardando ? (
                              <Loader2
                                size={14}
                                className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
                              />
                            ) : null}
                          </div>
                        </td>

                       <td className={`border px-2 py-2 text-center align-middle ${estilos.bordeTabla}`}>
  {(() => {
    const valorActual = Number(valor.cantidad || 0);

    const valorAnterior =
      fila.valores[valor.mes - 2]?.cantidad
        ? Number(fila.valores[valor.mes - 2].cantidad)
        : 0;

    const referencia = valorAnterior || valorActual;

    const resultado = comparar(valorActual, referencia);

    return (
      <span
        className={`text-lg font-bold ${
          resultado === "="
            ? "text-gray-500"
            : resultado === "↑"
            ? "text-emerald-500"
            : "text-rose-500"
        }`}
      >
        {resultado}
      </span>
    );
  })()}
</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))
            )}

            <tr className="bg-blue-500/10 font-bold">
  <td
    className={`sticky left-0 z-10 border px-4 py-3 ${estilos.bordeTabla} ${estilos.fondoSticky}`}
  >
    TOTAL MES
  </td>

  {totalesPorMes.slice(inicio, fin).map((total, i) => (
    <React.Fragment key={i}>
      <td
        className={`border px-2 py-2 text-center text-blue-600 font-extrabold ${estilos.bordeTabla}`}
      >
        {total}
      </td>

      {/* columna comparación vacía */}
      <td className={`border ${estilos.bordeTabla}`} />
    </React.Fragment>
  ))}
</tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section className={`w-full rounded-[28px] p-4 md:p-6 ${estilos.fondo}`}>
      <div className="space-y-6">
        <div className={`rounded-[28px] p-4 md:p-5 ${estilos.tarjeta}`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-3xl bg-blue-600/10 p-3 text-blue-500">
                <Files size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold md:text-2xl">Gestión avanzada de resmas</h2>
                <p className={`mt-1 text-sm ${estilos.textoSecundario}`}>
                  Consulta por año, busca áreas, crea nuevas dependencias y guarda valores con Enter.
                </p>
              </div>
            </div>


          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className={`flex items-center gap-3 rounded-3xl px-4 py-3 ${estilos.tarjetaSuave}`}>
                <Search className="text-blue-500" size={18} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar área..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className={`flex items-center gap-3 rounded-3xl px-4 py-3 ${estilos.tarjetaSuave}`}>
                <CalendarRange className="text-emerald-500" size={18} />
                <select
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  {aniosDisponibles.map((anio) => (
                    <option key={anio} value={anio} className="text-slate-900">
                      Año {anio}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className={`flex items-center gap-3 rounded-3xl px-4 py-3 ${estilos.tarjetaSuave}`}>
                <Plus className="text-violet-500" size={18} />
                <input
                  type="text"
                  value={nuevaArea}
                  onChange={(e) => setNuevaArea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") crearArea();
                  }}
                  placeholder="Crear área y guardar con Enter..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* ÁREAS */}
            <div className={`relative overflow-hidden rounded-3xl p-5 ${estilos.tarjetaSuave}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${estilos.textoSecundario}`}>
                    Áreas visibles
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-blue-500">
                    {resumen.totalAreas}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-500/15 p-3">
                  <Building2 className="text-blue-500" size={22} />
                </div>
              </div>

              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl" />
            </div>

            {/* REGISTROS */}
            <div className={`relative overflow-hidden rounded-3xl p-5 ${estilos.tarjetaSuave}`}>
              <div className="flex items-center justify-between">
                <div>
    <p className={`text-xs font-semibold uppercase tracking-wide ${estilos.textoSecundario}`}>
  Total mes actual ({nombreMesActual})
</p>

<p className="mt-2 text-3xl font-extrabold text-emerald-500">
  {totalMesActual}
</p>

                </div>

                <div className="rounded-2xl bg-emerald-500/15 p-3">
                  <Files className="text-emerald-500" size={22} />
                </div>
              </div>

              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-2xl" />
            </div>

            {/* TOTAL */}
            <div className={`relative overflow-hidden rounded-3xl p-5 ${estilos.tarjetaSuave}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${estilos.textoSecundario}`}>
                    Total general
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-violet-500">
                    {resumen.totalCantidad}
                  </p>
                </div>

                <div className="rounded-2xl bg-violet-500/15 p-3">
                  <BarChart3 className="text-violet-500" size={22} />
                </div>
              </div>

              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-500/10 blur-2xl" />
            </div>

          </div>

          {errorGeneral ? (
            <div className="mt-4 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
              {errorGeneral}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold uppercase tracking-wide">Meses 1 a 6</h3>
            </div>
            {renderBloqueMeses(0, 6)}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              <h3 className="text-sm font-bold uppercase tracking-wide">Meses 7 a 12</h3>
            </div>
            {renderBloqueMeses(6, 12)}
          </div>
        </div>

        {cargando ? (
          <div className="fixed bottom-5 right-5 z-50 rounded-full border border-white/10 bg-slate-900 p-3 text-white shadow-xl">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

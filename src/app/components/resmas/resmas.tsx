"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  CalendarRange,
  Files,
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCcw,
  Hash,
  PencilLine,
  Trash2,
  Save,
} from "lucide-react";
import Swal from "sweetalert2";

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
  cumple: boolean;
};

type FilaTabla = {
  id: number;
  nombre: string;
  valores: {
    mes: number;
    cantidad: string;
    cumple: number;
    registroId?: number;
  }[];
};

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const BLOQUES_MESES = [MESES.slice(0, 6), MESES.slice(6, 12)];

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
        ? "bg-[#121212] text-white border border-white/10"
        : "bg-white text-slate-800 border border-slate-200",
      tarjeta: modoNoche
        ? "bg-[#121212] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        : "bg-white border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
      tarjetaSuave: modoNoche
        ? "bg-[#121212] border border-white/10"
        : "bg-slate-50 border border-slate-200",
      input: modoNoche
        ? "bg-[#121212] border border-white/10 text-white placeholder:text-slate-400"
        : "bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400",
      headerTabla: modoNoche ? "bg-[#121212]" : "bg-slate-100",
      bordeTabla: modoNoche ? "border-white/10" : "border-slate-200",
      miniCelda: modoNoche
        ? "bg-[#121212] border border-white/10"
        : "bg-white border border-slate-200",
      textoSecundario: modoNoche ? "text-slate-300" : "text-slate-500",
      hoverFila: modoNoche ? "hover:bg-white/5" : "hover:bg-slate-50",
      botonPrimario:
        "bg-black-600 hover:bg-blue-700 text-white border border-blue-500/60",
      botonSecundario: modoNoche
        ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300",
    }),
    [modoNoche]
  );

  const obtenerAniosDesdeRegistros = useCallback((registros: ResmaRegistro[]) => {
    const anios = [...new Set(registros.map((item) => Number(item?.anio)).filter(Boolean))].sort(
      (a, b) => b - a
    );

    if (!anios.length) {
      const actual = new Date().getFullYear();
      return [actual];
    }

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

        const areasLimpias = Array.isArray(areasData) ? areasData : [];
        const resmasLimpias = Array.isArray(resmasData) ? resmasData : [];

        setAreas(areasLimpias);
        setResmas(resmasLimpias);

        const anios = obtenerAniosDesdeRegistros(resmasLimpias);
        setAniosDisponibles((prev) => {
          const combinados = [...new Set([...prev, ...anios, anioActual])].sort((a, b) => b - a);
          return combinados;
        });
      } catch (error) {
        console.error(error);
        setErrorGeneral("No fue posible cargar la información. Revisa las rutas del backend.");
        setAreas([]);
        setResmas([]);
      } finally {
        setCargando(false);
      }
    },
    [anioSeleccionado, obtenerAniosDesdeRegistros]
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
            cumple: registro?.cumple ? 1 : 0,
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

    return {
      totalAreas,
      totalRegistros,
      totalCantidad,
    };
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
    });

    if (!res.ok) throw new Error("Error creando área");

    setNuevaArea("");
    await refreshData(anioSeleccionado);

    toast("success", "Área creada");
  } catch (error) {
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editandoAreaId,
        nombre,
      }),
    });

    if (!res.ok) throw new Error();

    setEditandoAreaId(null);
    setNombreEditado("");

    await refreshData(anioSeleccionado);

    toast("success", "Área actualizada");
  } catch {
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
  });

  if (!confirm.isConfirmed) return;

  setCargando(true);

  try {
    const res = await fetch(`/api/areas-resmas?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error();

    await refreshData(anioSeleccionado);

    toast("success", "Área eliminada");
  } catch {
    toast("error", "Error al eliminar");
  } finally {
    setCargando(false);
  }
};

 const guardarDato = async ({ areaId, mes, cantidad, cumple }: any) => {
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
        cumple,
      }),
    });

    if (!res.ok) throw new Error();

    await refreshData(anioSeleccionado);

    toast("success", "Guardado");
  } catch {
    toast("error", "Error al guardar");
  } finally {
    setGuardandoCelda(null);
  }
};

 const manejarEnterCantidad = async (
  e: React.KeyboardEvent<HTMLInputElement>,
  areaId: number,
  mes: number,
  cumpleActual: number
) => {
  if (e.key !== "Enter") return;

  const valor = e.currentTarget.value.replace(/[^0-9]/g, "");
  const cantidad = Number(valor || 0);

  await guardarDato({
    areaId,
    mes,
    cantidad,
    cumple: cumpleActual === 1,
  });
};

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

  const manejarCambioVisualCantidad = (
    areaId: number,
    mes: number,
    valor: string
  ) => {
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
          cumple: false,
        },
      ];
    });
  };

  const toggleCumple = async (
  areaId: number,
  mes: number,
  cantidadActual: number,
  cumpleActual: number
) => {
  await guardarDato({
    areaId,
    mes,
    cantidad: cantidadActual,
    cumple: cumpleActual !== 1,
  });

  toast("success", "Estado actualizado");
};

  const renderBloqueMeses = (inicio: number, fin: number) => (
    <div className={`overflow-x-auto rounded-3xl ${estilos.tarjeta}`}>
      <div className="min-w-[1040px] p-3 md:p-4">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className={estilos.headerTabla}>
              <th
                className={`sticky left-0 z-20 min-w-[320px] rounded-l-2xl border px-4 py-4 text-left text-sm font-semibold ${estilos.bordeTabla} ${estilos.headerTabla}`}
              >
                Área / Gestión rápida
              </th>
              {MESES.slice(inicio, fin).map((mes) => (
                <th
                  key={mes}
                  className={`min-w-[120px] border px-3 py-4 text-center text-sm font-semibold ${estilos.bordeTabla} ${estilos.headerTabla}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{mes}</span>
                    <span className={`text-[11px] font-medium ${estilos.textoSecundario}`}>
                      Cantidad + estado
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className={`border px-4 py-10 text-center ${estilos.bordeTabla} ${estilos.textoSecundario}`}
                >
                  No hay áreas para mostrar con el filtro actual.
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className={`${estilos.hoverFila} transition`}>
                  <td
                    className={`sticky left-0 z-10 border px-4 py-3 align-top ${estilos.bordeTabla} ${modoNoche ? "bg-[#101a2d]" : "bg-white"}`}
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
                            onClick={() => iniciarEdicionArea({ id: fila.id, nombre: fila.nombre })}
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
                      <td
                        key={clave}
                        className={`border px-3 py-3 align-top ${estilos.bordeTabla}`}
                      >
                        <div className={`rounded-2xl p-3 ${estilos.miniCelda}`}>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className={`text-[11px] font-semibold uppercase ${estilos.textoSecundario}`}>
                              Cantidad
                            </span>
                            {guardando ? (
                              <Loader2 size={14} className="animate-spin text-blue-500" />
                            ) : (
                              <Hash size={14} className="text-blue-500" />
                            )}
                          </div>

                          <input
                            inputMode="numeric"
                            value={valor.cantidad}
                            onChange={(e) =>
                              manejarCambioVisualCantidad(fila.id, valor.mes, e.target.value)
                            }
                            onKeyDown={(e) =>
                              manejarEnterCantidad(e, fila.id, valor.mes, valor.cumple)
                            }
                            placeholder="0"
                            className={`w-full rounded-2xl px-3 py-2.5 text-center text-sm font-bold outline-none ${estilos.input}`}
                          />

                          <button
                            onClick={() =>
                              toggleCumple(
                                fila.id,
                                valor.mes,
                                Number(valor.cantidad || 0),
                                valor.cumple
                              )
                            }
                            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                              valor.cumple === 1
                                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                : "border border-rose-500/30 bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {valor.cumple === 1 ? (
                              <>
                                <CheckCircle2 size={15} /> Cumple
                              </>
                            ) : (
                              <>
                                <XCircle size={15} /> No cumple
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
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

            <button
              onClick={() => refreshData(anioSeleccionado)}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${estilos.botonSecundario}`}
            >
              <RefreshCcw size={16} /> Recargar
            </button>
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
                    if (e.key === "Enter") {
                      crearArea();
                    }
                  }}
                  placeholder="Crear área y guardar con Enter..."
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button
                  onClick={crearArea}
                  disabled={cargando}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${estilos.botonPrimario}`}
                >
                  <Plus size={15} /> Crear
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className={`rounded-3xl p-4 ${estilos.tarjetaSuave}`}>
              <p className={`text-xs font-semibold uppercase ${estilos.textoSecundario}`}>
                Áreas visibles
              </p>
              <p className="mt-2 text-2xl font-bold">{resumen.totalAreas}</p>
            </div>
            <div className={`rounded-3xl p-4 ${estilos.tarjetaSuave}`}>
              <p className={`text-xs font-semibold uppercase ${estilos.textoSecundario}`}>
                Registros con dato
              </p>
              <p className="mt-2 text-2xl font-bold">{resumen.totalRegistros}</p>
            </div>
            <div className={`rounded-3xl p-4 ${estilos.tarjetaSuave}`}>
              <p className={`text-xs font-semibold uppercase ${estilos.textoSecundario}`}>
                Total general
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-500">{resumen.totalCantidad}</p>
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

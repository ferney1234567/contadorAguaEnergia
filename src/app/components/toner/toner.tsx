"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Printer, Layers, Pencil, Trash2, Save, CalendarDays, Package, User, ScanLine, Filter, RefreshCcw, FileText, Settings, } from "lucide-react";
import Swal from "sweetalert2";
import ModalAreasTonner from "./ModalAreasTonner";

interface Area {
  id: number;
  nombre: string;
}

interface Tonner {
  id?: number;
  area_id: number;
  responsable: string;
  modelo_tonner: string;
  modelo_impresora: string;
  cantidad: number;
  fecha: string;
  created_at?: string; // 🔥 nuevo
  updated_at?: string; // 🔥 nuevo
}

export default function TablaTonners({ modoNoche }: { modoNoche: boolean }) {
  const hoy = () => new Date().toISOString().split("T")[0];
  const [areas, setAreas] = useState<Area[]>([]);
  const [tonners, setTonners] = useState<Tonner[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [nuevaArea, setNuevaArea] = useState("");
  const [mostrarModalAreas, setMostrarModalAreas] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes, setFiltroMes] = useState("");

  const [nuevo, setNuevo] = useState<Tonner>({
    area_id: 0,
    responsable: "",
    modelo_tonner: "",
    modelo_impresora: "",
    cantidad: 1,
    fecha: hoy(),
  });

  const estilos = useMemo(
    () => ({
      fondo: modoNoche ? "bg-[#0b0b0b] text-white" : "bg-[#ffffff] text-gray-900",

      card: modoNoche
        ? "bg-[#121212] border border-white/10 shadow-xl"
        : "bg-white border border-gray-200 shadow-md",

      input: modoNoche
        ? "bg-[#191919] border border-white/10 text-white placeholder:text-gray-400"
        : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400",

      subCard: modoNoche
        ? "bg-[#161616] border border-white/10"
        : "bg-gray-50 border border-gray-200",

      headerTable: modoNoche
        ? "bg-white/5 text-white"
        : "bg-gray-100 text-gray-700",
    }),
    [modoNoche]
  );

  const toast = (
    icon: "success" | "error" | "warning" | "info",
    title: string
  ) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
      background: modoNoche ? "#121212" : "#ffffff",
      color: modoNoche ? "#ffffff" : "#111827",
      customClass: {
        popup: "rounded-2xl shadow-xl text-sm",
      },
    });
  };

  const limpiarFormulario = () => {
    setNuevo({
      area_id: 0,
      responsable: "",
      modelo_tonner: "",
      modelo_impresora: "",
      cantidad: 1,
      fecha: hoy(),
    });
    setEditandoId(null);
  };

  const cargar = async () => {
    try {
      const [resAreas, resTonners] = await Promise.all([
        fetch("/api/areas-tonners"),
        fetch("/api/tonners"),
      ]);

      const dataAreas = await resAreas.json();
      const dataTonners = await resTonners.json();

      setAreas(Array.isArray(dataAreas) ? dataAreas : []);
      setTonners(Array.isArray(dataTonners) ? dataTonners : []);
    } catch (error) {
      console.error(error);
      toast("error", "Error cargando datos");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crearArea = async () => {
    if (!nuevaArea.trim()) {
      return toast("warning", "Escribe un nombre para el área");
    }

    try {
      const res = await fetch("/api/areas-tonners", {
        method: "POST",
        body: JSON.stringify({ nombre: nuevaArea.trim() }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        return toast("error", data?.error || "No se pudo crear el área");
      }

      setNuevaArea("");
      await cargar();
      toast("success", "Área creada correctamente");
    } catch (error) {
      console.error(error);
      toast("error", "Error de conexión al crear área");
    }
  };

  const guardar = async () => {
    if (!nuevo.area_id) {
      return toast("warning", "Selecciona un área");
    }

    if (!nuevo.responsable.trim()) {
      return toast("warning", "Escribe el responsable");
    }

    try {
      const body = {
        ...nuevo,
        responsable: nuevo.responsable.trim(),
        modelo_tonner: nuevo.modelo_tonner.trim(),
        modelo_impresora: nuevo.modelo_impresora.trim(),
        fecha: nuevo.fecha || hoy(),
      };

      const res = await fetch("/api/tonners", {
        method: editandoId ? "PUT" : "POST", // 🔥 ahora sí correcto
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editandoId ? { ...body, id: editandoId } : body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return toast("error", data?.error || "Error guardando");
      }

      await cargar();
      limpiarFormulario();

      toast(
        "success",
        editandoId
          ? "Tonner actualizado correctamente"
          : "Tonner creado correctamente"
      );

    } catch (error) {
      console.error(error);
      toast("error", "Error de conexión");
    }
  };

  const editar = (t: Tonner) => {
    setEditandoId(t.id || null);
    setNuevo({
      area_id: t.area_id,
      responsable: t.responsable || "",
      modelo_tonner: t.modelo_tonner || "",
      modelo_impresora: t.modelo_impresora || "",
      cantidad: t.cantidad || 1,
      fecha: t.fecha || hoy(),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const eliminar = async (id?: number) => {
    if (!id) return;

    const confirmacion = await Swal.fire({
      title: "¿Eliminar tonner?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      background: modoNoche ? "#121212" : "#ffffff",
      color: modoNoche ? "#ffffff" : "#111827",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        confirmButton: "rounded-xl px-4 py-2",
        cancelButton: "rounded-xl px-4 py-2",
      },
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`/api/tonners?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return toast("error", data?.error || "No se pudo eliminar");
      }

      if (editandoId === id) {
        limpiarFormulario();
      }

      await cargar();
      toast("success", "Tonner eliminado correctamente");
    } catch (error) {
      console.error(error);
      toast("error", "Error de conexión al eliminar");
    }
  };

  const filtrados = tonners.filter((t) => {
    const nombreArea = areas.find((a) => a.id === t.area_id)?.nombre || "";
    const q = busqueda.toLowerCase();

    const anio = t.fecha?.split("-")[0];
    const mes = t.fecha?.split("-")[1];

    const cumpleBusqueda =
      (t.modelo_impresora || "").toLowerCase().includes(q) ||
      (t.responsable || "").toLowerCase().includes(q) ||
      nombreArea.toLowerCase().includes(q);

    const cumpleArea = filtroArea ? String(t.area_id) === filtroArea : true;
    const cumpleAnio = filtroAnio ? anio === filtroAnio : true;
    const cumpleMes = filtroMes ? mes === filtroMes : true;

    return cumpleBusqueda && cumpleArea && cumpleAnio && cumpleMes;
  });

  const totalRegistros = tonners.length;
  const totalCantidad = tonners.reduce((acc, item) => acc + (item.cantidad || 0), 0);
  const totalAreasConUso = new Set(tonners.map((t) => t.area_id)).size;

  return (
    <div className={`p-4 sm:p-6 rounded-3xl ${estilos.fondo}`}>
      {/* HEADER PRINCIPAL */}
      <div
        className={`rounded-3xl p-5 sm:p-6 mb-6 ${estilos.card} bg-gradient-to-r ${modoNoche
          ? "from-[#161616] to-[#101010]"
          : "from-white to-gray-50"
          }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/10 shadow-sm">
                <Printer className="text-red-500" size={28} />
              </div>
              Gestión de Tonners
            </h2>
            <p className="mt-2 text-sm sm:text-base opacity-70">
              Administra, registra, edita y controla el inventario de tonners de
              forma moderna y rápida.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setMostrarModalAreas(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:scale-105 transition"
            >
              <Layers size={18} />
              Editar áreas
            </button>
          </div>
        </div>
      </div>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`rounded-2xl p-5 ${estilos.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">Registros totales</p>
              <h3 className="text-3xl font-extrabold mt-1">{totalRegistros}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10">
              <FileText className="text-blue-500" size={28} />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${estilos.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">Cantidad total</p>
              <h3 className="text-3xl font-extrabold mt-1">{totalCantidad}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-green-500/10">
              <Package className="text-green-500" size={28} />
            </div>
          </div>
        </div>


        <div className={`rounded-2xl p-5 ${estilos.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">Áreas con uso</p>
              <h3 className="text-3xl font-extrabold mt-1">{totalAreasConUso}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-red-500/10">
              <Layers className="text-red-500" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* GESTIÓN DE ÁREAS */}
      <div className={`p-5 sm:p-6 mb-6 rounded-3xl ${estilos.card}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Layers className="text-blue-500" />
              Gestión de áreas
            </h3>
            <p className="text-sm opacity-70 mt-1">
              Crea nuevas áreas y administra las existentes.
            </p>
          </div>


        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <input
            value={nuevaArea}
            onChange={(e) => setNuevaArea(e.target.value)}
            placeholder="Escribe el nombre del área"
            className={`w-full p-4 rounded-2xl text-base outline-none transition ${estilos.input} focus:ring-2 focus:ring-blue-500`}
          />

          <button
            onClick={crearArea}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:scale-105 active:scale-95 transition"
          >
            <Plus size={18} />
            Crear área
          </button>
        </div>
      </div>



      {/* FORMULARIO */}
      <div className={`p-5 sm:p-6 mb-6 rounded-3xl ${estilos.card}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Package className="text-green-500" />
              {editandoId ? "Editar tonner" : "Registrar tonner"}
            </h3>
            <p className="text-sm opacity-70 mt-1">
              La fecha se guarda automáticamente, pero también puedes ajustarla si
              lo necesitas.
            </p>
          </div>

          {editandoId && (
            <button
              onClick={limpiarFormulario}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-500 text-white shadow-md hover:scale-105 transition"
            >
              <RefreshCcw size={18} />
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl ${estilos.subCard}`}>
            <label className="text-sm font-semibold opacity-80 flex items-center gap-2 mb-2">
              <Layers size={16} className="text-blue-500" />
              Área
            </label>
            <select
              value={nuevo.area_id || ""}
              className={`w-full p-3 rounded-2xl text-sm sm:text-base outline-none transition ${estilos.input} focus:ring-2 focus:ring-blue-500`}
              onChange={(e) =>
                setNuevo({ ...nuevo, area_id: Number(e.target.value) })
              }
            >
              <option value="">Seleccionar área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={`p-4 rounded-2xl ${estilos.subCard}`}>
            <label className="text-sm font-semibold opacity-80 flex items-center gap-2 mb-2">
              <User size={16} className="text-blue-500" />
              Responsable
            </label>
            <input
              value={nuevo.responsable}
              placeholder="Nombre del responsable"
              className={`w-full p-3 rounded-2xl text-sm sm:text-base outline-none transition ${estilos.input} focus:ring-2 focus:ring-blue-500`}
              onChange={(e) =>
                setNuevo({ ...nuevo, responsable: e.target.value })
              }
            />
          </div>

          <div className={`p-4 rounded-2xl ${estilos.subCard}`}>
            <label className="text-sm font-semibold opacity-80 flex items-center gap-2 mb-2">
              <ScanLine size={16} className="text-purple-500" />
              Modelo tonner
            </label>
            <input
              value={nuevo.modelo_tonner}
              placeholder="Modelo del tonner"
              className={`w-full p-3 rounded-2xl text-sm sm:text-base outline-none transition ${estilos.input} focus:ring-2 focus:ring-purple-500`}
              onChange={(e) =>
                setNuevo({ ...nuevo, modelo_tonner: e.target.value })
              }
            />
          </div>

          <div className={`p-4 rounded-2xl ${estilos.subCard}`}>
            <label className="text-sm font-semibold opacity-80 flex items-center gap-2 mb-2">
              <Printer size={16} className="text-green-500" />
              Modelo impresora
            </label>
            <input
              value={nuevo.modelo_impresora}
              placeholder="Ej: HP LaserJet Pro"
              className={`w-full p-3 rounded-2xl text-sm sm:text-base outline-none transition ${estilos.input} focus:ring-2 focus:ring-green-500`}
              onChange={(e) =>
                setNuevo({ ...nuevo, modelo_impresora: e.target.value })
              }
            />
          </div>

          <div className={`p-4 rounded-2xl ${estilos.subCard}`}>
            <label className="text-sm font-semibold opacity-80 flex items-center gap-2 mb-2">
              <Package size={16} className="text-amber-500" />
              Cantidad
            </label>
            <input
              type="number"
              min="1"
              value={nuevo.cantidad}
              className={`w-full p-3 rounded-2xl text-sm sm:text-base outline-none transition ${estilos.input} focus:ring-2 focus:ring-amber-500`}
              onChange={(e) =>
                setNuevo({
                  ...nuevo,
                  cantidad: Number(e.target.value) || 1,
                })
              }
            />
          </div>


          <div className={`p-4 rounded-2xl ${estilos.subCard}`}>
            <label className="text-sm font-semibold opacity-80 flex items-center gap-2 mb-2">
              <CalendarDays size={16} className="text-blue-500" />
              Fecha del registro
            </label>

            <input
              type="date"
              value={nuevo.fecha}
              className={`w-full p-3 rounded-2xl outline-none ${estilos.input}`}
              onChange={(e) =>
                setNuevo({ ...nuevo, fecha: e.target.value })
              }
            />

            <p className="text-xs opacity-60 mt-1">
              Puedes cambiar la fecha manualmente
            </p>
          </div>


          <div className="flex items-end">
            <button
              onClick={guardar}
              className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-white font-bold shadow-lg transition hover:scale-[1.02] active:scale-95 ${editandoId
                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                : "bg-gradient-to-r from-green-600 to-green-500"
                }`}
            >
              <Save size={18} />
              {editandoId ? "Actualizar tonner" : "Guardar tonner"}
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className={`p-5 sm:p-6 mb-6 rounded-3xl ${estilos.card}`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-red-500/10">
            <Filter className="text-red-500" size={22} />
          </div>
          <div>
            <h3 className="font-bold text-xl">Filtros avanzados</h3>
            <p className="text-sm opacity-70">
              Filtra por búsqueda, área, año y mes (formato BD).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* BUSCADOR */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl ${estilos.subCard}`}>
            <Search className="text-blue-500" size={20} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-transparent outline-none"
            />
          </div>

          {/* ÁREA */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl ${estilos.subCard}`}>
            <Layers className="text-red-500" size={20} />
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="w-full bg-transparent outline-none"
            >
              <option value="">Todas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* AÑO */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl ${estilos.subCard}`}>
            <CalendarDays className="text-purple-500" size={20} />
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="w-full bg-transparent outline-none"
            >
              <option value="">Año</option>

              {[2026, 2027, 2028, 2029, 2030, 2031, 2032].map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>

          {/* MES NUMÉRICO */}
         {/* MES */}
<div className={`flex items-center gap-3 p-4 rounded-2xl ${estilos.subCard}`}>
  <CalendarDays className="text-green-500" size={20} />
  <select
    value={filtroMes}
    onChange={(e) => setFiltroMes(e.target.value)}
    className="w-full bg-transparent outline-none"
  >
    <option value="">Todos los meses</option>

    {[
      { valor: "01", nombre: "Enero" },
      { valor: "02", nombre: "Febrero" },
      { valor: "03", nombre: "Marzo" },
      { valor: "04", nombre: "Abril" },
      { valor: "05", nombre: "Mayo" },
      { valor: "06", nombre: "Junio" },
      { valor: "07", nombre: "Julio" },
      { valor: "08", nombre: "Agosto" },
      { valor: "09", nombre: "Septiembre" },
      { valor: "10", nombre: "Octubre" },
      { valor: "11", nombre: "Noviembre" },
      { valor: "12", nombre: "Diciembre" },
    ].map((mes) => (
      <option key={mes.valor} value={mes.valor}>
        {mes.nombre}
      </option>
    ))}
  </select>
</div>

        </div>
      </div>

      {/* TABLA */}
      {/* TABLA TONNERS ENVÍA */}
      <div className={`rounded-3xl overflow-hidden shadow-xl border ${modoNoche ? "border-[#333]" : "border-gray-200"} ${estilos.card}`}>

        {/* HEADER ROJO */}
        <div className="px-6 py-5 bg-[#C40000] text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h3 className="font-bold text-2xl flex items-center gap-3 tracking-wide">
                <Printer size={22} />
                Inventario de Tonners
              </h3>

              <p className="text-xs opacity-80 mt-1">
                Control y gestión de suministros de impresión
              </p>
            </div>

            <span className="text-sm bg-white/20 px-4 py-1 rounded-full font-semibold backdrop-blur-sm">
              {filtrados.length} registros
            </span>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">

            {/* HEADER */}
            <thead>
              <tr
                className={`uppercase tracking-wider text-xs 
        ${modoNoche
                    ? "bg-[#1a1a1a] text-gray-300 border-b border-white/10"
                    : "bg-gray-100 text-gray-700 border-b border-gray-200"}`}
              >
                <th className="px-5 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-red-500" />
                    <span>Área</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    <span>Responsable</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <ScanLine size={16} className="text-purple-500" />
                    <span>Tonner</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Printer size={16} className="text-green-500" />
                    <span>Impresora</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Package size={16} className="text-amber-500" />
                    <span>Cantidad</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CalendarDays size={16} className="text-cyan-500" />
                    <span>Fecha</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={16} className="text-emerald-500" />
                    <span>Creado</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCcw size={16} className="text-yellow-500" />
                    <span>Editado</span>
                  </div>
                </th>

                <th className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Settings size={16} className="text-gray-500" />
                    <span>Acciones</span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm opacity-60"
                  >
                    🚫 No se encontraron registros de tonners
                  </td>
                </tr>
              ) : (
                filtrados.map((t, index) => (
                  <tr
                    key={t.id}
                    className={`transition border-b
              ${modoNoche
                        ? "border-white/10 hover:bg-[#1f1f1f]"
                        : "border-gray-200 hover:bg-red-50"}
              
              ${index % 2 === 0
                        ? (modoNoche ? "bg-[#121212]" : "bg-white")
                        : (modoNoche ? "bg-[#161616]" : "bg-gray-50")}
            `}
                  >

                    {/* ÁREA */}
                    <td className="px-5 py-4 font-semibold">
                      {areas.find((a) => a.id === t.area_id)?.nombre || "-"}
                    </td>

                    {/* RESPONSABLE */}
                    <td className="px-5 py-4">
                      {t.responsable || "-"}
                    </td>

                    {/* TONNER */}
                    <td className="px-5 py-4">
                      {t.modelo_tonner || "-"}
                    </td>

                    {/* IMPRESORA */}
                    <td className="px-5 py-4">
                      {t.modelo_impresora || "-"}
                    </td>

                    {/* CANTIDAD */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full font-bold
                  ${modoNoche
                            ? "bg-green-500/20 text-green-400"
                            : "bg-green-500/10 text-green-600"}`}
                      >
                        {t.cantidad}
                      </span>
                    </td>
                    {/* FECHA */}
                    <td className="px-5 py-4 text-center">
                      {t.fecha || "-"}
                    </td>

                    {/* CREATED */}
                    <td className="px-5 py-4 text-center text-xs">
                      {t.created_at
                        ? new Date(t.created_at).toLocaleString()
                        : "-"}
                    </td>

                    {/* UPDATED */}
                    <td className="px-5 py-4 text-center text-xs">
                      {t.updated_at ? (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          {new Date(t.updated_at).toLocaleString()}
                        </span>
                      ) : "-"}
                    </td>

                    {/* ACCIONES */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">

                        {/* EDITAR */}
                        <button
                          onClick={() => editar(t)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition
                    ${modoNoche
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                              : "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white"}`}
                        >
                          <Pencil size={16} />
                          Editar
                        </button>

                        {/* ELIMINAR */}
                        <button
                          onClick={() => eliminar(t.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition
                    ${modoNoche
                              ? "bg-red-500/20 text-red-400 hover:bg-red-600 hover:text-white"
                              : "bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white"}`}
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className={`px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between
  ${modoNoche
              ? "bg-[#121212] border-t border-white/10 text-gray-300"
              : "bg-gray-100 border-t border-gray-200 text-gray-700"}`}
        >

          {/* TOTAL REGISTROS */}
          <span className="text-sm flex items-center gap-2">
            📊 Total mostrado:
            <strong className={`${modoNoche ? "text-white" : "text-gray-900"}`}>
              {filtrados.length}
            </strong>
            registros
          </span>

          {/* TOTAL CANTIDAD */}
          <span className="text-sm flex items-center gap-2">
            📦 Cantidad acumulada:
            <strong className={`${modoNoche ? "text-red-400" : "text-red-600"} text-base`}>
              {filtrados.reduce((a, b) => a + (b.cantidad || 0), 0)}
            </strong>
          </span>

        </div>
      </div>

      <ModalAreasTonner
        abierto={mostrarModalAreas}
        onClose={() => setMostrarModalAreas(false)}
        areas={areas}
        cargar={cargar}
      />
    </div>
  );
}
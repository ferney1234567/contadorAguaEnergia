"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Droplet,
  Zap,
  BookOpen,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

import Image from "next/image";

import DashboardInicio from "./components/dashboard/dasboard";
import ConsumoAgua from "./components/consumoAgua/consumoAgua";
import ConsumoEnergia from "./components/consumoEnergia/consumoEnergia";
import Lecturas from "./components/lecturas/lecturas";

/* =========================
   TIPOS
========================= */
interface LecturaDia {
  bodega2: string;
  bodega4: string;
  total2: number;
  total4: number;
}

type LecturasPorMes = Record<number, Record<number, LecturaDia>>;

export default function MenuPrincipal() {
  /* =========================
     ESTADOS GENERALES
  ========================= */
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");

  const [lecturasAgua, setLecturasAgua] = useState<LecturasPorMes>({});
  const [lecturasEnergia, setLecturasEnergia] = useState<LecturasPorMes>({});

  const [anioActual, setAnioActual] = useState<number>(
    new Date().getFullYear()
  );

  /* =========================
     DETECTAR MÓVIL
  ========================= */
  useEffect(() => {
    const verificarTamano = () => setEsMovil(window.innerWidth < 768);
    verificarTamano();
    window.addEventListener("resize", verificarTamano);
    return () => window.removeEventListener("resize", verificarTamano);
  }, []);

  /* =========================
     ACTUALIZAR AÑO AUTOMÁTICO
  ========================= */
  useEffect(() => {
    const intervalo = setInterval(() => {
      const anioSistema = new Date().getFullYear();
      setAnioActual((prev) => (prev !== anioSistema ? anioSistema : prev));
    }, 60 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  /* =========================
     MODO NOCHE
  ========================= */
  const [modoNoche, setModoNoche] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("modoNoche") === "true") {
      setModoNoche(true);
    }
  }, []);

  const toggleModoNoche = () => {
    const nuevo = !modoNoche;
    setModoNoche(nuevo);
    localStorage.setItem("modoNoche", nuevo.toString());
  };

  /* =========================
     COLORES
  ========================= */
  // const colores = {
  //   header: modoNoche ? "bg-[#1e1e1e] text-white" : "bg-[#E30613] text-white",
  //   sidebar: modoNoche ? "bg-[#2a2a2a] text-white" : "bg-[#F0F0F0] text-black",
  //   sidebarHover: modoNoche ? "hover:bg-[#3a3a3a]" : "hover:bg-[#e1e1e1]",
  //   sidebarActivo: modoNoche
  //     ? "bg-[#3a3a3a] shadow-inner"
  //     : "bg-[#d6d6d6] shadow-inner",
  //   contenido: modoNoche ? "bg-[#121212] text-white" : "bg-white text-black",
  // };


  const colores = {
  /* ================= HEADER ================= */
  header: modoNoche
    ? "bg-[#1e1e1e] text-white"
    : "bg-[#C40000] text-white", // 🔴 Rojo Envia

  /* ================= SIDEBAR ================= */
  sidebar: modoNoche
    ? "bg-[#2a2a2a] text-white"
    : "bg-[#1f1f1f] text-white", // ⚫ Sidebar oscuro corporativo

  sidebarHover: modoNoche
    ? "hover:bg-[#3a3a3a]"
    : "hover:bg-[#2f2f2f]",

  sidebarActivo: modoNoche
    ? "bg-[#3a3a3a] shadow-inner"
    : "bg-[#3a3a3a] shadow-inner border-l-4 border-red-600",

  /* ================= CONTENIDO ================= */
  contenido: modoNoche
    ? "bg-[#121212] text-white"
    : "bg-[#f5f5f5] text-black",
};

  /* =========================
     MENÚ
  ========================= */
  const opciones = [
    { nombre: "Inicio", icono: <Home size={26} /> },
    { nombre: "Agua", icono: <Droplet size={26} /> },
    { nombre: "Energía", icono: <Zap size={26} /> },
    { nombre: "Lecturas", icono: <BookOpen size={26} /> },
  ];

  const handleClickOpcion = () => {
    if (esMovil) setSidebarAbierto(false);
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className={`w-full flex flex-col ${colores.contenido}`}>
      {/* ================= HEADER ================= */}
      <header className={`w-full flex items-center justify-between px-4 md:px-6 py-4 shadow-lg ${colores.header}`}>
        <div className="flex items-center gap-3">
          <Image src="/img/envia3.png" alt="Envia logo" width={60} height={40} />

          <button
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className={`p-2 md:p-3 rounded transition ${
              modoNoche ? "hover:bg-[#333]" : "hover:bg-[#c10510]"
            }`}
          >
            <Menu size={30} />
          </button>
        </div>

        <h1 className="text-xl md:text-3xl font-extrabold tracking-wide text-center flex-1">
          Consumo de agua y energía {anioActual}
        </h1>

        <button
          onClick={toggleModoNoche}
          className={`p-2 md:p-3 rounded transition ${
            modoNoche ? "hover:bg-[#333]" : "hover:bg-[#c10510]"
          }`}
        >
          {modoNoche ? <Sun size={30} /> : <Moon size={30} />}
        </button>
      </header>

      {/* ================= CONTENEDOR ================= */}
      <div className="flex w-full h-full relative">
        {/* ================= SIDEBAR ================= */}
        <aside
          className={`
            absolute md:static top-0 left-0 min-h-full z-40
            transition-all duration-300 pt-20 md:pt-10
            ${colores.sidebar}
            ${
              esMovil
                ? sidebarAbierto
                  ? "w-56 translate-x-0 shadow-xl"
                  : "w-56 -translate-x-full"
                : sidebarAbierto
                ? "w-60"
                : "w-20"
            }
          `}
        >
          <nav className="flex flex-col space-y-8 px-2">
            {opciones.map((op, i) => {
              const activa = vistaActual === op.nombre.toLowerCase();

              return (
                <button
                  key={i}
                  onClick={() => {
                    setVistaActual(op.nombre.toLowerCase());
                    handleClickOpcion();
                  }}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition
                    ${sidebarAbierto ? "justify-start" : "justify-center"}
                    ${activa ? colores.sidebarActivo : colores.sidebarHover}
                  `}
                >
                  <div className="w-8 flex justify-center">{op.icono}</div>
                  {sidebarAbierto && (
                    <span className="ml-4 text-lg font-medium">
                      {op.nombre}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ================= CONTENIDO ================= */}
        <main className={`flex-1 p-5 md:p-10 transition-all ${colores.contenido}`}>
          {vistaActual === "inicio" && <DashboardInicio modoNoche={modoNoche} />}
          {vistaActual === "agua" && (
            <ConsumoAgua modoNoche={modoNoche} lecturas={lecturasAgua} setLecturas={setLecturasAgua} />
          )}
          {vistaActual === "energía" && (
            <ConsumoEnergia modoNoche={modoNoche} lecturas={lecturasEnergia} setLecturas={setLecturasEnergia} />
          )}
          {vistaActual === "lecturas" && <Lecturas modoNoche={modoNoche} />}

          <footer
  className={`
    mt-12 py-6
    border-t
    ${modoNoche
      ? "bg-[#1a1a1a] border-[#2f2f2f] text-gray-300"
      : "bg-[#f2f2f2] border-gray-300 text-gray-700"}
  `}
>
  <div className="max-w-6xl mx-auto flex flex-col gap-4 text-center px-4">

    {/* NOMBRE EMPRESA */}
    <h2
      className={`
        text-lg md:text-xl font-bold tracking-wide
        ${modoNoche ? "text-gray-100" : "text-gray-800"}
      `}
    >
      Envia Mensajería y Transporte
    </h2>

    {/* LEMA */}
    <p
      className={`
        text-sm md:text-base font-medium
        ${modoNoche ? "text-gray-400" : "text-gray-600"}
      `}
    >
      Movemos el país con eficiencia, responsabilidad y compromiso sostenible
    </p>

    {/* INFO SISTEMA */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm mt-2">
      <div>
        <span className="font-semibold">Sistema</span><br />
        Gestión de Consumo de Agua y Energía
      </div>

      <div>
        <span className="font-semibold">Año</span><br />
        {new Date().getFullYear()}
      </div>

      <div>
        <span className="font-semibold">Versión</span><br />
        v1.0 · Producción
      </div>
    </div>

    {/* COPYRIGHT */}
    <div
      className={`
        mt-3 text-[11px]
        ${modoNoche ? "text-gray-500" : "text-gray-500"}
      `}
    >
      © {new Date().getFullYear()} Envia · Uso interno corporativo
    </div>
  </div>
</footer>

        </main>

        
      </div>
    </div>
  );
}

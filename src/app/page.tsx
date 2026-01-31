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

export default function MenuPrincipal() {
  /* ================= ESTADOS GENERALES ================= */
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");
  const [modoNoche, setModoNoche] = useState(false);

  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  /* ================= DETECTAR MÓVIL ================= */
  useEffect(() => {
    const verificarTamano = () => setEsMovil(window.innerWidth < 768);
    verificarTamano();
    window.addEventListener("resize", verificarTamano);
    return () => window.removeEventListener("resize", verificarTamano);
  }, []);

  /* ================= ACTUALIZAR AÑO ================= */
  useEffect(() => {
    const intervalo = setInterval(() => {
      const anioSistema = new Date().getFullYear();
      setAnioActual((prev) => (prev !== anioSistema ? anioSistema : prev));
    }, 60 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  /* ================= MODO NOCHE ================= */
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

  /* ================= COLORES ================= */
  const colores = {
    header: modoNoche
      ? "bg-[#1e1e1e] text-white"
      : "bg-[#C40000] text-white",

    sidebar: modoNoche
      ? "bg-[#2a2a2a] text-white"
      : "bg-[#1f1f1f] text-white",

    sidebarHover: modoNoche
      ? "hover:bg-[#3a3a3a]"
      : "hover:bg-[#2f2f2f]",

    sidebarActivo: modoNoche
      ? "bg-[#3a3a3a] shadow-inner"
      : "bg-[#3a3a3a] shadow-inner border-l-4 border-red-600",

    contenido: modoNoche
      ? "bg-[#121212] text-white"
      : "bg-[#f5f5f5] text-black",
  };

  /* ================= MENÚ ================= */
  const opciones = [
    { nombre: "Inicio", icono: <Home size={26} /> },
    { nombre: "Agua", icono: <Droplet size={26} /> },
    { nombre: "Energía", icono: <Zap size={26} /> },
    { nombre: "Lecturas", icono: <BookOpen size={26} /> },
  ];

  const handleClickOpcion = () => {
    if (esMovil) setSidebarAbierto(false);
  };

  /* ================= RENDER ================= */
  return (
    <div className={`w-full flex flex-col ${colores.contenido}`}>
      {/* ================= HEADER ================= */}
      <header
        className={`w-full flex items-center justify-between px-4 md:px-6 py-4 shadow-lg ${colores.header}`}
      >
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
        <main className={`flex-1 p-5 md:p-10 ${colores.contenido}`}>
          {vistaActual === "inicio" && (
            <DashboardInicio modoNoche={modoNoche} />
          )}

          {vistaActual === "agua" && <ConsumoAgua modoNoche={modoNoche} />}

          {vistaActual === "energía" && (
            <ConsumoEnergia modoNoche={modoNoche} />
          )}

          {vistaActual === "lecturas" && (
            <Lecturas modoNoche={modoNoche} />
          )}
        </main>
      </div>
    </div>
  );
}

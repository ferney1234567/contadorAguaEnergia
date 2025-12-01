"use client";

import { useState, useEffect } from "react";
import { 
  Home, 
  Droplet, 
  Zap, 
  BookOpen, 
  LogOut, 
  Sun, 
  Moon, 
  Menu 
} from "lucide-react";

import DashboardInicio from "./components/dashboard/dasboard";
import ConsumoAgua from "./components/consumoAgua/consumoAgua";
import ConsumoEnergia from "./components/consumoEnergia/consumoEnergia";
import Lecturas from "./components/lecturas/lecturas";


export default function MenuPrincipal() {

  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio"); // <-- control de vistas

  // Detectar tamaño de pantalla
  useEffect(() => {
    const verificarTamano = () => {
      setEsMovil(window.innerWidth < 768);
    };
    verificarTamano();
    window.addEventListener("resize", verificarTamano);
    return () => window.removeEventListener("resize", verificarTamano);
  }, []);

  // ======== MODO NOCHE PERSISTENTE ========
  const [modoNoche, setModoNoche] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem("modoNoche");
    if (guardado === "true") setModoNoche(true);
  }, []);

  const toggleModoNoche = () => {
    const nuevoEstado = !modoNoche;
    setModoNoche(nuevoEstado);
    localStorage.setItem("modoNoche", nuevoEstado.toString());
  };

  // ======== COLORES SEGÚN MODO ========
  const colores = {
    header: modoNoche ? "bg-[#1e1e1e] text-white" : "bg-[#E30613] text-white",
    sidebar: modoNoche ? "bg-[#2a2a2a] text-white" : "bg-[#F0F0F0] text-black",
    sidebarHover: modoNoche ? "hover:bg-[#3a3a3a]" : "hover:bg-[#e1e1e1]",
    contenido: modoNoche ? "bg-[#121212] text-white" : "bg-white text-black",
  };

  // Opciones del menú
  const opciones = [
    { nombre: "Inicio", icono: <Home size={26} /> },
    { nombre: "Agua", icono: <Droplet size={26} /> },
    { nombre: "Energía", icono: <Zap size={26} /> },
    { nombre: "Lecturas", icono: <BookOpen size={26} /> },
  ];

  // Cerrar menú automáticamente SOLO en móvil
  const handleClickOpcion = () => {
    if (esMovil) setSidebarAbierto(false);
  };

  return (
    <div className={`w-full  flex flex-col ${colores.contenido}`}>

      {/* --------------------------- HEADER --------------------------- */}
      <header 
        className={`w-full flex items-center justify-between px-4 md:px-6 py-4 shadow-lg ${colores.header}`}
      >
        {/* Botón menú - SIEMPRE visible */}
        <button 
          onClick={() => setSidebarAbierto(!sidebarAbierto)} 
          className={`p-2 md:p-3 rounded transition ${modoNoche ? "hover:bg-[#333]" : "hover:bg-[#c10510]"}`}
        >
          <Menu size={30} />
        </button>

        {/* Título */}
        <h1 className="text-xl md:text-3xl font-extrabold tracking-wide text-center flex-1">
          Consumo de agua y energía 2025
        </h1>

        {/* Botón modo noche */}
        <button 
          onClick={toggleModoNoche}
          className={`p-2 md:p-3 rounded transition ${modoNoche ? "hover:bg-[#333]" : "hover:bg-[#c10510]"}`}
        >
          {modoNoche ? <Sun size={30} /> : <Moon size={30} />}
        </button>
      </header>


      {/* --------------------------- CONTENEDOR --------------------------- */}
      <div className="flex w-full h-full relative">

        {/* --------------------------- SIDEBAR --------------------------- */}
<aside
  className={`
    absolute md:static top-0 left-0 min-h-full h-auto z-40
    transition-all duration-300 pt-20 md:pt-10
    ${colores.sidebar}

    ${
      esMovil
        ? sidebarAbierto
          ? "w-56 translate-x-0 shadow-xl"
          : "w-56 -translate-x-full shadow-none"
        : sidebarAbierto
        ? "w-60 translate-x-0 shadow-xl"
        : "w-20 translate-x-0 shadow-xl"
    }
  `}
>



          <nav className="flex flex-col space-y-8 w-full pl-2 pr-2">

            {opciones.map((op, i) => (
              <button
                key={i}
                onClick={() => {
                  setVistaActual(op.nombre.toLowerCase()); 
                  handleClickOpcion();
                }}
                className={`
                  flex items-center px-4 py-3 cursor-pointer rounded-lg transition
                  ${sidebarAbierto ? "justify-start" : "justify-center"}
                  ${colores.sidebarHover}
                `}
              >
                <div className="w-8 flex justify-center">{op.icono}</div>
                {sidebarAbierto && (
                  <span className="ml-4 text-lg font-medium">{op.nombre}</span>
                )}
              </button>
            ))}

            {/* Cerrar sesión */}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className={`
                flex items-center px-4 py-3 mt-10 mb-4 rounded-lg cursor-pointer transition
                ${sidebarAbierto ? "justify-start" : "justify-center"}
                ${colores.sidebarHover}
              `}
            >
              <LogOut size={26} />
              {sidebarAbierto && (
                <span className="ml-4 text-lg font-medium">Cerrar sesión</span>
              )}
            </button>
          </nav>
        </aside>


        {/* --------------------------- CONTENIDO --------------------------- */}
    <main
  className={`
    flex-1 p-5 md:p-10 transition-all duration-300 relative z-10
    ${colores.contenido}

    ${
      esMovil
        ? "ml-0"
        : sidebarAbierto
        ? "ml-[0px]"
        : "ml-[10px]"
    }
  `}
>


          {/* === CAMBIO DE VISTAS === */}
          {vistaActual === "inicio" && <DashboardInicio modoNoche={modoNoche} />}
          {vistaActual === "agua" && <ConsumoAgua modoNoche={modoNoche} />}
         {vistaActual === "energía" && <ConsumoEnergia modoNoche={modoNoche} />}
        {vistaActual === "lecturas" && <Lecturas modoNoche={modoNoche} />}


        

        </main>

      </div>
    </div>
  );
}

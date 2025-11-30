// themeStyles.ts

export type ThemeTokens = {
  fondo: string;          // fondo global
  bg: string;             // fondo general
  card: string;           // tarjetas / contenedores
  text: string;           // texto principal
  textMuted: string;      // texto secundario
  input: string;          // inputs / buscador
  nav: string;            // links de navegación
  navActive: string;      // link activo
  divider: string;        // bordes / divisores
  button: string;         // botón neutro
  primaryButton: string;  // botón primario
  successButton: string;  // botón éxito
  badge: string;          // chips / badges

   // 🔹 extras usados en el login
  titulo: string;         
  icono: string;          
  boton: string;          
  textoSecundario: string;
  link: string;
};


export function getThemeStyles(modoOscuro: boolean): ThemeTokens {
  if (modoOscuro) {
    return {
    fondo: "bg-[#0b1220] text-gray-200", // 👈 azul oscuro en lugar de negro plano
 // 👈 negro en modo noche
      bg: "bg-[#111827] text-gray-200",
      card: "bg-[#121a2b] border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
      text: "text-gray-100",
      textMuted: "text-gray-300/80",
      input:
        "bg-[#0e1626] border border-white/10 text-gray-100 placeholder:text-gray-400 focus:ring-emerald-400/30 focus:border-emerald-400/60",
      nav: "text-gray-300 hover:text-white transition",
      navActive:
        "text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-1",
      divider: "border-white/10",
      button:
        "bg-[#0e1626] text-gray-100 border border-white/10 hover:bg-[#121a2b]",
      primaryButton: "bg-emerald-600 hover:bg-emerald-500 text-white",
      successButton: "bg-[#39A900] hover:bg-[#2d8a00] text-white",
      badge: "bg-yellow-400 text-black",

      // 🔹 extras usados en el login
 // 🔹 extras
      titulo: "bg-gradient-to-r from-emerald-400 to-blue-400", 
      icono: "text-gray-400",
      boton: "bg-emerald-600 hover:bg-emerald-500",
      textoSecundario: "text-gray-400",
      link: "text-emerald-400",

    };
  }

  // ☀️ Modo claro → blanco en toda la pantalla
  return {
    fondo: "bg-white tzext-gray-800", // 👈 blanco en modo claro
    bg: "bg-[#E8E5E5FF] text-gray-800",
    card: "bg-white border border-gray-200 shadow-sm",
    text: "text-[#0f172a]",
    textMuted: "text-gray-600",
    input:
      "bg-white border-2 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:ring-blue-200 focus:border-blue-400",
    nav: "text-gray-700 hover:text-[#39A900] transition",
    navActive: "text-[#39A900] border-b-2 border-[#39A900] pb-1",
    divider: "border-gray-200",
    button: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
    primaryButton: "bg-[#00324D] hover:bg-[#004267] text-white",
    successButton: "bg-[#39A900] hover:bg-lime-600 text-white",
    badge: "bg-yellow-400 text-black",

    // 🔹 extras
    titulo: "bg-gradient-to-r from-[#00324D] to-[#39A900]", 
    icono: "text-gray-500",
    boton: "bg-[#00324D] hover:bg-[#004267]",
    textoSecundario: "text-gray-500",
    link: "text-[#39A900]",
  };

}
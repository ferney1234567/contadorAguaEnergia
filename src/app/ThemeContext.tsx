'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeContextType = {
  modoOscuro: boolean;
  toggleModoOscuro: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  modoOscuro: false,
  toggleModoOscuro: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [modoOscuro, setModoOscuro] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);

  // Cargar preferencia inicial: localStorage -> prefers-color-scheme -> false
  useEffect(() => {
    try {
      const stored = localStorage.getItem('modoOscuro');
      if (stored !== null) {
        setModoOscuro(stored === 'true');
      } else if (typeof window !== 'undefined' && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        setModoOscuro(mql.matches);
      }
    } catch {
      // ignore
    } finally {
      setIsReady(true); // ✅ solo después de cargar preferencia
    }
  }, []);

  // Persistir y opcionalmente aplicar clase global
  useEffect(() => {
    try {
      localStorage.setItem('modoOscuro', String(modoOscuro));
    } catch {
      // ignore
    }
    // Si usas Tailwind con dark mode global:
    // if (modoOscuro) document.documentElement.classList.add('dark');
    // else document.documentElement.classList.remove('dark');
  }, [modoOscuro]);

  const toggleModoOscuro = () => setModoOscuro((v) => !v);

  const value = useMemo(() => ({ modoOscuro, toggleModoOscuro }), [modoOscuro]);

  // 🚨 Importante: no renderizar hasta que esté listo
  if (!isReady) {
    return <div className="min-h-screen w-full bg-black" />; 
    // o un loader con fondo oscuro para que nunca se vea blanco
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface FontSizeContextType {
  fontSize: number;
  aumentarTexto: () => void;
  disminuirTexto: () => void;
  resetTexto: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontSize');
      return saved ? Number(saved) : 16;
    }
    return 16;
  });

  const aumentarTexto = () => setFontSize((prev) => Math.min(prev + 2, 28));
  const disminuirTexto = () => setFontSize((prev) => Math.max(10, prev - 2));
  const resetTexto = () => setFontSize(16);

  useEffect(() => {
    localStorage.setItem('fontSize', String(fontSize));
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, aumentarTexto, disminuirTexto, resetTexto }}>
      {/* 🔹 Aplica el tamaño global de texto a toda la app */}
      <div style={{ fontSize: `${fontSize}px`, transition: 'font-size 0.3s ease' }}>
        {children}
      </div>
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) throw new Error('useFontSize debe usarse dentro de FontSizeProvider');
  return context;
}

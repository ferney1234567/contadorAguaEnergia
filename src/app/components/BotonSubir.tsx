"use client";

import { useEffect, useState } from "react";

export default function BotonesScroll() {
  const [scrollY, setScrollY] = useState(0);
  const [alturaTotal, setAlturaTotal] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setAlturaTotal(document.body.scrollHeight);
    };

    handleScroll(); // ejecutar una vez
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const subirArriba = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const bajarAbajo = () => {
    window.scrollTo({
      top: alturaTotal,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-5 right-2 flex flex-col gap-3 z-50">

      {/* 🔼 SUBIR */}
      <button
        onClick={subirArriba}
        className={`
          p-3 rounded-full shadow-md transition-all duration-300
          ${scrollY > 100
            ? "bg-red-600 hover:bg-red-700 text-white scale-100"
            : "bg-gray-400 text-white opacity-60 scale-90"}
        `}
      >
        ↑
      </button>

      {/* 🔽 BAJAR */}
      <button
        onClick={bajarAbajo}
        className={`
          p-3 rounded-full shadow-md transition-all duration-300
          ${scrollY < alturaTotal - 800
            ? "bg-red-600 hover:bg-red-700 text-white scale-100"
            : "bg-gray-400 text-white opacity-60 scale-90"}
        `}
      >
        ↓
      </button>

    </div>
  );
}
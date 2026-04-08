"use client";

import { X, Trash2, Pencil, Check } from "lucide-react";
import Swal from "sweetalert2";
import { useState } from "react";

interface Area {
  id: number;
  nombre: string;
}

export default function ModalAreasTonner({
  abierto,
  onClose,
  areas,
  cargar
}: {
  abierto: boolean;
  onClose: () => void;
  areas: Area[];
  cargar: () => void;
}) {

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  if (!abierto) return null;

  /* =========================
     ❌ ELIMINAR
  ========================= */
  const eliminar = async (id: number) => {

    const confirmacion = await Swal.fire({
      title: "¿Eliminar área?",
      text: "No se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`/api/areas-tonners?id=${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Área eliminada",
        showConfirmButton: false,
        timer: 2000
      });

      cargar();

    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error eliminando",
        showConfirmButton: false,
        timer: 2500
      });
    }
  };

  /* =========================
     ✏️ EDITAR
  ========================= */
  const editar = async (id: number) => {
    if (!nuevoNombre.trim()) return;

    try {
      const res = await fetch("/api/areas-tonners", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          nombre: nuevoNombre
        })
      });

      if (!res.ok) throw new Error();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Área actualizada",
        showConfirmButton: false,
        timer: 2000
      });

      setEditandoId(null);
      setNuevoNombre("");
      cargar();

    } catch {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Error actualizando",
        showConfirmButton: false,
        timer: 2500
      });
    }
  };

  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-3">

    {/* 🔥 MODAL RESPONSIVE */}
    <div className="
      w-full max-w-md mx-auto
      max-w-md 
      sm:max-w-lg 
      md:max-w-xl 
      lg:max-w-md
      bg-white dark:bg-[#121212]
      rounded-2xl 
      shadow-2xl 
      overflow-hidden
      animate-fadeIn
    ">

      {/* 🔴 HEADER */}
      <div className="bg-gradient-to-r from-red-700 to-red-500 text-white px-4 sm:px-5 py-3 flex justify-between items-center">

        <div className="flex items-center gap-2 sm:gap-3">

          <img
            src="/img/logo.png"
            alt="logo"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain  p-1"
          />

          <h2 className="font-bold text-sm sm:text-lg">
            Gestión de Áreas
          </h2>

        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/20 transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* 📋 LISTA */}
      <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">

        {areas.length === 0 && (
          <p className="text-center text-sm opacity-60">
            No hay áreas registradas
          </p>
        )}

        {areas.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:shadow-md transition"
          >

            {/* INPUT / TEXTO */}
            {editandoId === a.id ? (
              <input
                autoFocus
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") editar(a.id);
                }}
                className="flex-1 p-2 rounded-lg border outline-none text-sm"
              />
            ) : (
              <span className="font-medium text-sm sm:text-base truncate">
                {a.nombre}
              </span>
            )}

            {/* BOTONES */}
            <div className="flex gap-1 sm:gap-2">

              {editandoId === a.id ? (
                <button
                  onClick={() => editar(a.id)}
                  className="p-2 rounded-lg bg-green-500 text-white hover:scale-105 transition"
                >
                  <Check size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditandoId(a.id);
                    setNuevoNombre(a.nombre);
                  }}
                  className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition"
                >
                  <Pencil size={14} />
                </button>
              )}

              <button
                onClick={() => eliminar(a.id)}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 size={14} />
              </button>

            </div>
          </div>
        ))}

      </div>

      {/* 🔥 FOOTER BONITO */}
      <div className="
        px-4 sm:px-5 py-3 
        bg-gray-100 dark:bg-[#1a1a1a] 
        border-t border-gray-200 dark:border-white/10 
        flex justify-between items-center
      ">

        <span className="text-xs sm:text-sm text-gray-500">
          Total: {areas.length} áreas
        </span>

        <button
          onClick={onClose}
          className="
            px-4 py-2 
            rounded-xl 
            bg-gray-300 dark:bg-white/10 
            hover:bg-gray-400 dark:hover:bg-white/20 
            transition text-sm font-medium
          "
        >
          Cerrar
        </button>

      </div>

    </div>
  </div>
);
}
"use client";

import { useMemo, useState } from "react";
import { CheckCircle, XCircle, Files } from "lucide-react";

interface Props {
  modoNoche: boolean;
}

export default function TablaResmas({ modoNoche }: Props) {

  const meses = [
    "Ene","Feb","Mar","Abr","May","Jun",
    "Jul","Ago","Sep","Oct","Nov","Dic"
  ];

  const [data, setData] = useState([
    {
      nombre: "Tecnología",
      valores: meses.map(() => ({ cantidad: "", cumple: 1 })),
    },
    {
      nombre: "Facturación",
      valores: meses.map(() => ({ cantidad: "", cumple: 0 })),
    },
  ]);

  const estilos = {
    fondo: modoNoche
      ? "bg-[#0f0f0f] text-white"
      : "bg-[#f9fafb] text-gray-800",

    tabla: modoNoche
      ? "bg-[#181818] border border-[#2e2e2e]"
      : "bg-white border border-gray-300",

    header: modoNoche
      ? "bg-[#1f1f1f]"
      : "bg-gray-100",

    input: modoNoche
      ? "bg-[#222] text-white border border-gray-600"
      : "bg-white text-black border border-gray-300",

    miniTabla: modoNoche
      ? "border border-gray-600 bg-[#202020]"
      : "border border-gray-300 bg-gray-50",
  };

  // 🔥 SOLO NÚMEROS
  const handleNumero = (e: any, i: number, j: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    const copia = [...data];
    copia[i].valores[j].cantidad = value;
    setData(copia);
  };

  // 🔥 TOGGLE VISUAL (SIN BOTÓN)
  const toggleCumple = (i: number, j: number) => {
    const copia = [...data];
    copia[i].valores[j].cumple = copia[i].valores[j].cumple === 1 ? 0 : 1;
    setData(copia);
  };

  // 🔥 TOTAL GENERAL
  const totalGeneral = useMemo(() => {
    return data.reduce((acc, fila) => {
      return acc + fila.valores.reduce((a, v) => a + Number(v.cantidad || 0), 0);
    }, 0);
  }, [data]);

  return (
    <div className={`w-full p-6 rounded-3xl ${estilos.fondo}`}>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <Files className="text-blue-500" size={28} />
        <h2 className="text-xl font-bold">Control por Mes</h2>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className={`overflow-auto rounded-2xl shadow-md ${estilos.tabla}`}>
        <table className="w-full text-sm border-collapse">

          {/* HEADER */}
          <thead>
            <tr className={`${estilos.header}`}>
              <th className="p-4 border border-gray-300 text-left">
                Dependencia
              </th>

              {meses.map((mes) => (
                <th key={mes} className="p-3 border border-gray-300 text-center">
                  {mes}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.map((fila, i) => (
              <tr key={i} className="text-center">

                {/* NOMBRE */}
                <td className="p-3 font-semibold text-left border border-gray-300">
                  {fila.nombre}
                </td>

                {/* MESES */}
                {fila.valores.map((val, j) => (
                  <td key={j} className="p-2 border border-gray-300">

                    {/* 🔥 MINI TABLA POR MES */}
                    <div className={`rounded-xl p-2 ${estilos.miniTabla}`}>

                      {/* INPUT */}
                      <input
                        value={val.cantidad}
                        onChange={(e) => handleNumero(e, i, j)}
                        placeholder="0"
                        className={`w-full text-center py-1 mb-2 rounded-lg text-sm font-semibold outline-none ${estilos.input}`}
                      />

                      {/* ESTADO VISUAL */}
                      <div
                        onClick={() => toggleCumple(i, j)}
                        className="flex items-center justify-center gap-1 cursor-pointer transition hover:scale-105"
                      >
                        {val.cumple === 1 ? (
                          <>
                            <CheckCircle className="text-green-500" size={18} />
                            <span className="text-green-500 text-xs font-bold">
                              Cumple
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="text-red-500" size={18} />
                            <span className="text-red-500 text-xs font-bold">
                              No cumple
                            </span>
                          </>
                        )}
                      </div>

                    </div>

                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="mt-6 text-center">
        <div className="text-sm opacity-70">Total General</div>
        <div className="text-2xl font-bold text-blue-500">
          {totalGeneral}
        </div>
      </div>
    </div>
  );
}
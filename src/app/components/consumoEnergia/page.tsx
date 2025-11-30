"use client";

import { useState } from "react";

// Tipado correcto para Next.js
interface Props {
  modoNoche: boolean;
}

export default function ConsumoEnergia({ modoNoche }: Props) {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("Noviembre");

  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-white text-black",
    tarjeta: modoNoche ? "bg-[#1e1e1e]" : "bg-[#f5f5f5]",
    borde: modoNoche ? "border-[#333]" : "border-[#ddd]",

    // Colores del área de energía
    diaD: "bg-yellow-300",
    diaF: "bg-red-400",
    diaNA: "bg-purple-400",
  };

  const meses: string[] = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const dias: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={`w-full ${colores.fondo}`}>
      
      <div className="w-full max-w-[1900px] mx-auto pt-5">

        {/* === TARJETAS SUPERIORES === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Meta */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg shadow`}>
            <h3 className="font-bold text-lg">Meta diaria</h3>
            <p className="text-sm mt-2">Meta: 120 kWh por día</p>
          </div>

          {/* Selector */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg shadow`}>
            <h3 className="font-bold mb-2">Seleccione un mes</h3>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="w-full p-2 rounded bg-white text-black"
            >
              {meses.map((mes) => (
                <option key={mes}>{mes}</option>
              ))}
            </select>
          </div>

          {/* Leyenda */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg shadow`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className={`w-5 h-5 ${colores.diaD} inline-block rounded-sm`} />
                <span>D</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-5 h-5 ${colores.diaF} inline-block rounded-sm`} />
                <span>F</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-5 h-5 ${colores.diaNA} inline-block rounded-sm`} />
                <span>NA</span>
              </div>
            </div>
          </div>

        </div>

        {/* === CALENDARIO === */}
        <div className="w-full overflow-x-auto mb-10">
          
          <h2 className="text-center text-2xl font-bold mb-4">{mesSeleccionado}</h2>

          <div className="grid grid-cols-31 min-w-[900px] border border-gray-300">
            {dias.map((d) => (
              <div 
                key={d}
                className="border border-gray-300 p-2 text-center text-sm font-bold text-yellow-600"
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* === TABLA DE LECTURAS === */}
        <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full text-center">
            <thead className={modoNoche ? "bg-[#222]" : "bg-gray-100"}>
              <tr>
                <th className="p-3 border">{mesSeleccionado}</th>
                <th className="p-3 border">Medidor A</th>
                <th className="p-3 border">Medidor B</th>
                <th className="p-3 border">Total A</th>
                <th className="p-3 border">Total B</th>
              </tr>
            </thead>

            <tbody>
              {[1,2,3,4,5,6].map((dia) => (
                <tr key={dia}>
                  <td className="p-3 border">{dia}</td>
                  <td className="p-3 border"></td>
                  <td className="p-3 border"></td>
                  <td className="p-3 border"></td>
                  <td className="p-3 border"></td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}

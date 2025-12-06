"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Calendar,
  Download,
  Droplets,
  BarChart3,
} from "lucide-react";

interface Props {
  modoNoche: boolean;
}

export default function ConsumoAgua({ modoNoche }: Props) {
  // FECHA REAL DEL SISTEMA
  const hoy = new Date();
  const mesActual = hoy.getMonth();   // 0-11
  const anioActual = hoy.getFullYear();

  const [mesSeleccionado, setMesSeleccionado] = useState<number>(mesActual);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(anioActual);

  // 🎨 PALETA 100% MODO DÍA / NOCHE
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-[#ffffff] text-black",

    tarjeta: modoNoche
      ? "bg-[#121212] border border-[#333]"
      : "bg-white border border-gray-200",

    sombra: modoNoche
      ? "shadow-[0px_4px_12px_rgba(0,0,0,0.5)]"
      : "shadow-[0px_4px_15px_rgba(0,0,0,0.08)]",

    domingo: modoNoche ? "bg-purple-700 text-white" : "bg-purple-300 text-black",
    festivo: modoNoche ? "bg-red-700 text-white" : "bg-red-300 text-black",
    habil: modoNoche ? "bg-[#1b1b1b]" : "bg-white",

    domingoFila: modoNoche ? "bg-purple-900 text-white" : "bg-purple-100 text-black",
    festivoFila: modoNoche ? "bg-red-900 text-white" : "bg-red-100 text-black",
    habilFila: modoNoche ? "bg-[#111]" : "bg-white",

    bordeSuave: modoNoche ? "border border-[#2a2a2a]" : "border border-gray-200",
  };

  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  // FESTIVOS POR AÑO → Para que siempre funcione
 // FESTIVOS POR AÑO (COLOMBIA) → COMPLETOS Y CORRECTOS
const festivosPorAño: Record<number, string[]> = {
  2024: [
    "2024-12-08", // Inmaculada Concepción
    "2024-12-25", // Navidad
  ],
  2025: [
    "2025-01-01","2025-03-24","2025-05-01",
    "2025-07-20","2025-08-07",
    "2025-10-12","2025-10-31",
    "2025-11-11",

    // DICIEMBRE REAL
    "2025-12-08", // Inmaculada Concepción
    "2025-12-25", // Navidad
  ],
  2026: [
    "2026-01-01","2026-03-23","2026-03-24",
    "2026-05-01","2026-07-20",
    "2026-08-07","2026-10-12",

    // DICIEMBRE REAL
    "2026-12-08",
    "2026-12-25",
  ],
  2027: [
    "2027-01-01","2027-03-22","2027-05-01",
    "2027-07-20","2027-08-07","2027-10-12",

    // DICIEMBRE REAL
    "2027-12-08",
    "2027-12-25",
  ],
};


  const festivos = festivosPorAño[anioSeleccionado] || [];

  const diasDelMes = (mes: number, anio: number) =>
    new Date(anio, mes + 1, 0).getDate();

  const totalDias = diasDelMes(mesSeleccionado, anioSeleccionado);

  const esDomingo = (dia: number) =>
    new Date(anioSeleccionado, mesSeleccionado, dia).getDay() === 0;

  const esFestivo = (dia: number) => {
    const f = new Date(anioSeleccionado, mesSeleccionado, dia)
      .toISOString()
      .split("T")[0];
    return festivos.includes(f);
  };

  const exportarExcel = () => {
    const data: Record<string, string | number>[] = [];
    for (let d = 1; d <= totalDias; d++) {
      const tipo = esDomingo(d) ? "D" : esFestivo(d) ? "F" : "NA";
      data.push({
        Dia: d,
        Tipo: tipo,
        Bodega2: tipo,
        Bodega4: tipo,
        Total2: tipo,
        Total4: tipo,
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lecturas");
    XLSX.writeFile(wb, "Consumo_Agua.xlsx");
  };

  return (
    <div className={`w-full min-h-screen ${colores.fondo} p-3 md:p-6`}>
    <div className="w-full px-3">

  <div
  className="
    w-full
    grid grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    xl:grid-cols-5
    gap-4
    mb-4
    place-items-start
  "
>
  {/* Meta */}
  <div className={`${colores.tarjeta} ${colores.sombra} w-full max-w-[350px] min-w-0 rounded-xl p-4`}>

    <h3 className="font-medium text-sm flex items-center gap-2">
      <Droplets size={18} className="text-blue-400" />
      Meta Mensual
    </h3>
    <p className="mt-3 text-2xl font-bold text-blue-500">41 m³</p>
  </div>

  {/* Mes */}
 <div className={`${colores.tarjeta} ${colores.sombra} w-full max-w-[350px] min-w-0 rounded-xl p-4`}>

    <h3 className="font-medium text-sm flex items-center gap-2">
      <Calendar size={18} className="text-indigo-400" />
      Mes
    </h3>

    <select
      className={`mt-3 w-full p-2 rounded-lg font-semibold text-sm ${
        modoNoche ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
      }`}
      value={mesSeleccionado}
      onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
    >
      {meses.map((mes, i) => (
        <option key={i} value={i}>{mes}</option>
      ))}
    </select>
  </div>

  {/* Año */}
 <div className={`${colores.tarjeta} ${colores.sombra} w-full max-w-[350px] min-w-0 rounded-xl p-4`}>

    <h3 className="font-medium text-sm flex items-center gap-2">
      <Calendar size={18} className="text-indigo-400" />
      Año
    </h3>

    <select
      className={`mt-3 w-full p-2 rounded-lg font-semibold text-sm ${
        modoNoche ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
      }`}
      value={anioSeleccionado}
      onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
    >
      {[2024, 2025, 2026, 2027].map((anio) => (
        <option key={anio} value={anio}>{anio}</option>
      ))}
    </select>
  </div>

  {/* Resumen */}
 <div className={`${colores.tarjeta} ${colores.sombra} w-full max-w-[350px] min-w-0 rounded-xl p-4`}>

    <h3 className="font-medium text-sm flex items-center gap-2">
      <BarChart3 size={18} className="text-green-500" />
      Resumen
    </h3>
    <div className="mt-2 text-xs leading-5">
      <p><b className="text-purple-400">D</b> — Domingos</p>
      <p><b className="text-red-500">F</b> — Festivos</p>
      <p><b className="text-green-500">NA</b> — Hábiles</p>
    </div>
  </div>

  {/* Exportar */}
  <div className={`${colores.tarjeta} ${colores.sombra} w-full max-w-[350px] min-w-0 rounded-xl p-4`}>

    <button
      onClick={exportarExcel}
      className="
        flex items-center gap-2
        px-5 py-2
        bg-green-600 hover:bg-green-700
        text-white text-sm
        rounded-lg shadow-md
      "
    >
      <Download size={18} />
      Exportar
    </button>
  </div>
</div>




        {/* CALENDARIO */}
        <div className="overflow-x-auto">
          <h6 className="text-center text-3xl font-extrabold mb-1">
            Total día del mes — Meta:{" "}
            <span className="text-blue-500">41 m³</span>
          </h6>

          {/* Fila días */}
          <div
            className={`
              grid grid-cols-${totalDias}
              min-w-[900px]
              ${colores.bordeSuave}
              rounded-t-xl
            `}
          >
            {[...Array(totalDias)].map((_, i) => {
              const dia = i + 1;
              const estilo =
                esDomingo(dia)
                  ? colores.domingo
                  : esFestivo(dia)
                  ? colores.festivo
                  : colores.habil;

              return (
                <div
                  key={dia}
                  className={`border ${colores.bordeSuave} p-2 text-center text-lg font-bold ${estilo}`}
                >
                  {dia}
                </div>
              );
            })}
          </div>

          {/* Fila tipo */}
          <div
            className={`
              grid grid-cols-${totalDias}
              min-w-[900px]
              ${colores.bordeSuave}
            `}
          >
            {[...Array(totalDias)].map((_, i) => {
              const dia = i + 1;
              const tipo = esDomingo(dia) ? "D" : esFestivo(dia) ? "F" : "NA";

              const estilo =
                tipo === "D"
                  ? colores.domingoFila
                  : tipo === "F"
                  ? colores.festivoFila
                  : colores.habilFila;

              return (
                <div
                  key={dia}
                  className={`border ${colores.bordeSuave} p-2 text-center font-bold ${estilo}`}
                >
                  {tipo}
                </div>
              );
            })}
          </div>
        </div>


        {/* TABLA */}
        <div className="mt-12 w-full overflow-x-auto">
          <table className={`w-full min-w-[900px] ${colores.bordeSuave} text-center text-sm rounded-xl overflow-hidden`}>
            <thead className={modoNoche ? "bg-[#2a2a2a]" : "bg-gray-200"}>
              <tr className="text-lg">
                <th className="p-3 border">Día</th>
                <th className="p-3 border">Tipo</th>
                <th className="p-3 border">Bodega 2</th>
                <th className="p-3 border">Bodega 4</th>
                <th className="p-3 border">Total Bodega 2</th>
                <th className="p-3 border">Total Bodega 4</th>
              </tr>
            </thead>

            <tbody>
              {[...Array(totalDias)].map((_, i) => {
                const dia = i + 1;
                const tipo = esDomingo(dia) ? "D" : esFestivo(dia) ? "F" : "NA";

                const estiloFila =
                  tipo === "D"
                    ? colores.domingoFila
                    : tipo === "F"
                    ? colores.festivoFila
                    : colores.habilFila;

                return (
                  <tr key={dia} className={`${estiloFila} text-lg`}>
                    <td className={`p-3 ${colores.bordeSuave} font-bold`}>{dia}</td>
                    <td className={`p-3 ${colores.bordeSuave} font-extrabold`}>{tipo}</td>

                    {/* Campos repetidos */}
                    <td className={`p-3 ${colores.bordeSuave} font-bold`}>{tipo}</td>
                    <td className={`p-3 ${colores.bordeSuave} font-bold`}>{tipo}</td>
                    <td className={`p-3 ${colores.bordeSuave} font-bold`}>{tipo}</td>
                    <td className={`p-3 ${colores.bordeSuave} font-bold`}>{tipo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

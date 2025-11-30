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
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(10);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(2025);

  // 🎨 PALETA 100% MODO DÍA / NOCHE
  const colores = {
    fondo: modoNoche ? "bg-[#0d0d0d] text-white" : "bg-[#ffffff] text-black",

    tarjeta: modoNoche
      ? "bg-[#1a1a1a] border border-[#333]"
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

  const festivos = [
    "2025-01-01","2025-03-24","2025-05-01",
    "2025-07-20","2025-08-07",
    "2025-10-12","2025-10-31",
    "2025-11-11","2025-12-25"
  ];

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
      <div className="max-w-[2000px] mx-auto">

        {/* ==== TÍTULO ==== */}
        <h2 className="text-center text-xl mb-10 font-semibold opacity-80">
          {meses[mesSeleccionado]} {anioSeleccionado}
        </h2>

        {/* ==== TARJETAS RESPONSIVAS ==== */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-5
            gap-4
            mb-10
          "
        >

          {/* Meta Mensual */}
          <div className={`${colores.tarjeta} ${colores.sombra} p-5 rounded-2xl`}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Droplets size={22} className="text-blue-400" />
              Meta Mensual
            </h3>
            <p className="mt-4 text-2xl font-bold text-blue-500">41 m³</p>
          </div>

          {/* Mes */}
          <div className={`${colores.tarjeta} ${colores.sombra} p-5 rounded-2xl`}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar size={22} className="text-indigo-400" />
              Mes
            </h3>
            <select
              className={`mt-3 w-full p-3 rounded-lg font-bold ${
                modoNoche ? "bg-[#2a2a2a] text-white" : "bg-gray-100"
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
          <div className={`${colores.tarjeta} ${colores.sombra} p-5 rounded-2xl`}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar size={22} className="text-indigo-400" />
              Año
            </h3>
            <select
              className={`mt-3 w-full p-3 rounded-lg font-bold ${
                modoNoche ? "bg-[#2a2a2a] text-white" : "bg-gray-100"
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
          <div className={`${colores.tarjeta} ${colores.sombra} p-5 rounded-2xl`}>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BarChart3 size={22} className="text-green-500" />
              Resumen
            </h3>
            <div className="mt-4 text-sm leading-7">
              <p><b className="text-purple-400 text-lg">D</b> — Domingos</p>
              <p><b className="text-red-500 text-lg">F</b> — Festivos</p>
              <p><b className="text-green-500 text-lg">NA</b> — Hábiles</p>
            </div>
          </div>

          {/* Exportar */}
          <div className={`${colores.tarjeta} ${colores.sombra} p-5 rounded-2xl flex items-center justify-center`}>
            <button
              onClick={exportarExcel}
              className="flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg rounded-xl shadow-lg"
            >
              <Download size={24} />
              Exportar
            </button>
          </div>
        </div>

        {/* ===== CALENDARIO ===== */}
        <div className="overflow-x-auto">
          <h6 className="text-center text-3xl font-extrabold mb-3">
            Total día del mes — Meta:{" "}
            <span className="text-blue-500">41 m³</span>
          </h6>

          {/* FILA 1 — Días */}
          <div
            className={`
              grid
              grid-cols-8
              sm:grid-cols-12
              lg:grid-cols-31
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

          {/* FILA 2 — TIPOS */}
          <div
            className={`
              grid
              grid-cols-8
              sm:grid-cols-12
              lg:grid-cols-31
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

        {/* ===== TABLA ===== */}
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
                    <td className="p-3 border font-bold">{dia}</td>
                    <td className="p-3 border font-extrabold">{tipo}</td>

                    {/* TODA la fila coloreada */}
                    <td className="p-3 border font-bold">{tipo}</td>
                    <td className="p-3 border font-bold">{tipo}</td>
                    <td className="p-3 border font-bold">{tipo}</td>
                    <td className="p-3 border font-bold">{tipo}</td>
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

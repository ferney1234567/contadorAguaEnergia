"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

// Tipado correcto de props
interface Props {
  modoNoche: boolean;
}

export default function ConsumoAgua({ modoNoche }: Props) {

  // ======= ESTADOS =======
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(10); // Octubre
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(2025);

  // ======= DISEÑO =======
  const colores = {
    fondo: modoNoche ? "bg-[#121212] text-white" : "bg-white text-black",
    tarjeta: modoNoche ? "bg-[#1e1e1e]" : "bg-[#f5f5f5]",
    borde: modoNoche ? "border-[#333]" : "border-[#ddd]",
  };

  // ======= DATOS =======
  const meses: string[] = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const festivos: string[] = [
    "2025-01-01", "2025-03-24", "2025-05-01",
    "2025-07-20", "2025-08-07",
    "2025-10-12", "2025-10-31",
    "2025-11-11", "2025-12-25"
  ];

  // ======= FUNCIONES =======
  const diasDelMes = (mes: number, anio: number): number => {
    return new Date(anio, mes + 1, 0).getDate();
  };

  const esDomingo = (dia: number): boolean => {
    const fecha = new Date(anioSeleccionado, mesSeleccionado, dia);
    return fecha.getDay() === 0;
  };

  const esFestivo = (dia: number): boolean => {
    const f = new Date(anioSeleccionado, mesSeleccionado, dia)
      .toISOString()
      .split("T")[0];

    return festivos.includes(f);
  };

  // ======= CONTADORES =======
  const totalDias = diasDelMes(mesSeleccionado, anioSeleccionado);
  let totalD = 0, totalF = 0, totalNA = 0;

  for (let i = 1; i <= totalDias; i++) {
    if (esDomingo(i)) totalD++;
    if (esFestivo(i)) totalF++;
    if (!esDomingo(i) && !esFestivo(i)) totalNA++;
  }

  // ======= EXPORTAR A EXCEL =======
  const exportarExcel = (): void => {
    const data: any[] = [];

    for (let d = 1; d <= totalDias; d++) {
      data.push({
        Dia: d,
        Tipo: esDomingo(d) ? "D" : esFestivo(d) ? "F" : "NA",
        Bodega2: "",
        Bodega4: "",
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lecturas");
    XLSX.writeFile(wb, "Consumo_Agua.xlsx");
  };

  // ============================================
  // ================== UI =======================
  // ============================================

  return (
    <div className={`w-full ${colores.fondo}`}>
      <div className="w-full max-w-[1900px] mx-auto pt-5">

        {/* TARJETAS SUPERIORES */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">

          {/* Meta */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg`}>
            <h3 className="font-bold text-lg">Meta diaria</h3>
            <p className="text-sm mt-2">41 metros cúbicos</p>
          </div>

          {/* Mes */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg`}>
            <h3 className="font-bold mb-2">Mes</h3>
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
              className="w-full p-2 rounded bg-white text-black"
            >
              {meses.map((mes, i) => (
                <option key={mes} value={i}>{mes}</option>
              ))}
            </select>
          </div>

          {/* Año */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg`}>
            <h3 className="font-bold mb-2">Año</h3>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
              className="w-full p-2 rounded bg-white text-black"
            >
              {[2024, 2025, 2026, 2027].map((anio) => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>

          {/* Totales */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg`}>
            <h3 className="font-bold mb-2">Resumen</h3>
            <p>D (Domingos): <b className="text-purple-400">{totalD}</b></p>
            <p>F (Festivos): <b className="text-red-400">{totalF}</b></p>
            <p>NA (Hábiles): <b className="text-green-500">{totalNA}</b></p>
          </div>

          {/* Exportar */}
          <div className={`${colores.tarjeta} border ${colores.borde} p-4 rounded-lg flex items-center justify-center`}>
            <button
              onClick={exportarExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
            >
              Exportar datos
            </button>
          </div>
        </div>

        {/* CALENDARIO */}
        <h2 className="text-center text-2xl font-bold mb-4">
          {meses[mesSeleccionado]} {anioSeleccionado}
        </h2>

        <div className="grid grid-cols-31 min-w-[900px] border border-gray-300 mb-12">
          {[...Array(totalDias)].map((_, i) => {
            const dia = i + 1;

            const color =
              esDomingo(dia) ? "bg-purple-300 text-black" :
              esFestivo(dia) ? "bg-red-300 text-black" :
              "text-blue-700";

            return (
              <div
                key={dia}
                className={`border border-gray-300 p-2 text-center font-bold ${color}`}
              >
                {dia}
              </div>
            );
          })}
        </div>

        {/* TABLA */}
        <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-center text-sm">
            <thead className={modoNoche ? "bg-[#989494]" : "bg-gray-100"}>
              <tr>
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

                const fondo =
                  tipo === "D" ? "bg-purple-100" :
                  tipo === "F" ? "bg-red-100" : "";

                return (
                  <tr key={dia} className={fondo}>
                    <td className="p-3 border">{dia}</td>
                    <td className="p-3 border font-bold">{tipo}</td>
                    <td className="p-3 border"></td>
                    <td className="p-3 border"></td>
                    <td className="p-3 border"></td>
                    <td className="p-3 border"></td>
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

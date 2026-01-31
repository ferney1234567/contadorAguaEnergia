// utils/festivosColombia.ts
import Holidays from "date-holidays";

/**
 * Instancia para Colombia
 * Incluye automáticamente:
 * - Festivos fijos
 * - Ley Emiliani
 * - Semana Santa
 * - Festivos móviles
 * - Años futuros (2026, 2027, etc.)
 */
const hd = new Holidays("CO");

/**
 * Retorna los festivos oficiales de Colombia
 * en formato YYYY-MM-DD
 */
export const obtenerFestivosColombia = (anio: number): string[] => {
  return hd
    .getHolidays(anio)
    .filter((h) => h.type === "public") // solo festivos oficiales
    .map((h) => h.date.split(" ")[0]); // YYYY-MM-DD
};

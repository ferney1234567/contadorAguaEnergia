// utils/festivosColombia.ts

const moverALunes = (fecha: Date) => {
  const dia = fecha.getDay();
  if (dia === 1) return fecha; // ya es lunes
  const diff = dia === 0 ? 1 : 8 - dia;
  fecha.setDate(fecha.getDate() + diff);
  return fecha;
};

const formatear = (f: Date) =>
  `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(
    f.getDate()
  ).padStart(2, "0")}`;

const calcularPascua = (anio: number) => {
  const f = Math.floor,
    G = anio % 19,
    C = f(anio / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (anio + f(anio / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    mes = 3 + f((L + 40) / 44),
    dia = L + 28 - 31 * f(mes / 4);

  return new Date(anio, mes - 1, dia);
};

export const obtenerFestivosColombia = (anio: number): string[] => {
  const festivos: Date[] = [];

  // Fijos
  festivos.push(new Date(anio, 0, 1));   // Año nuevo
  festivos.push(new Date(anio, 4, 1));   // Día del trabajo
  festivos.push(new Date(anio, 6, 20));  // Independencia
  festivos.push(new Date(anio, 7, 7));   // Batalla de Boyacá
  festivos.push(new Date(anio, 11, 8));  // Inmaculada
  festivos.push(new Date(anio, 11, 25)); // Navidad

  // Emiliani (se mueven al lunes)
  festivos.push(moverALunes(new Date(anio, 0, 6)));  // Reyes
  festivos.push(moverALunes(new Date(anio, 2, 19))); // San José
  festivos.push(moverALunes(new Date(anio, 5, 29))); // San Pedro y San Pablo
  festivos.push(moverALunes(new Date(anio, 7, 15))); // Asunción
  festivos.push(moverALunes(new Date(anio, 9, 12))); // Raza
  festivos.push(moverALunes(new Date(anio, 10, 1))); // Todos los santos
  festivos.push(moverALunes(new Date(anio, 10, 11))); // Cartagena

  // Semana Santa
  const pascua = calcularPascua(anio);
  const jueves = new Date(pascua);
  jueves.setDate(pascua.getDate() - 3);
  const viernes = new Date(pascua);
  viernes.setDate(pascua.getDate() - 2);

  festivos.push(jueves);
  festivos.push(viernes);

  return festivos.map(formatear);
};

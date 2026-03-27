"use client";

import { useEffect, useState } from "react";
import React from "react";
import Swal from "sweetalert2";
import {Search,Filter,Droplets,TrendingUp,Building2,DollarSign,MapPin,Calendar,CheckSquare, CheckCircle,  User} from "lucide-react";
import {CreditCard } from "lucide-react";
import { generarReciboPDF } from "../../utils/recibo";
interface Props {
modoNoche: boolean;
}

const meses = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL","MAYO", "JUNIO", "JULIO", "AGOSTO","SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

export default function ComparativoAgua({ modoNoche }: Props) {
const [datosEnergia, setDatosEnergia] = useState<any[]>([]);
const currentYear = new Date().getFullYear();
const [anio, setAnio] = useState(currentYear.toString());
const [mes, setMes] = useState("");
const [sedeSeleccionada, setSedeSeleccionada] = useState("");
const [mostrarTotales, setMostrarTotales] = useState(true);
const [consumoMin, setConsumoMin] = useState("");
const [busqueda, setBusqueda] = useState("");
const startYear = 2025;
const futureYears = 6; // hasta 2031 inicialmente
const sedes = Array.from(new Set(datosEnergia.map((d) => d.nombre)));
const inputsRef = React.useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
const years = Array.from({ length: (currentYear - startYear + 1) + futureYears },(_, i) => startYear + i);
const [nuevaFila, setNuevaFila] = useState({nombre: "",ubicacion: "",cuenta: "",datos: Array.from({ length: 12 }, () => ({M3: 0,valor: 0,cumple: true}))});
const editarNuevaFila = (campo: string, valor: any) => {setNuevaFila(prev => ({...prev,[campo]: valor}));};
const editarFila = (filaIndex: number, campo: string, valor: any) => {
const nuevosDatos = [...datosEnergia];nuevosDatos[filaIndex] = {...nuevosDatos[filaIndex],[campo]: valor};setDatosEnergia(nuevosDatos); };
const editarNuevaCelda = (mesIndex: number, campo: string, valor: any) => {
const nuevosDatos = [...nuevaFila.datos];
    if (campo === "M3") {
      nuevosDatos[mesIndex].M3 = Number(valor);
    }
    if (campo === "valor") {
      nuevosDatos[mesIndex].valor = Number(valor);
    }
    if (campo === "cumple") {
      nuevosDatos[mesIndex].cumple = valor === "true";
    }
    setNuevaFila({
      ...nuevaFila,
      datos: nuevosDatos
    });
  };

 useEffect(() => {


  cargarDatos();

}, []);


const cargarDatos = async () => {

  try {
    const res = await fetch("/api/comparativoAgua");
    const data = await res.json();

    const mapa: any = {};

    data.forEach((item: any) => {

      // 🔥 CLAVE ÚNICA (NOMBRE + AÑO)
      const key = `${item.nombre}_${item.anio}`;

      if (!mapa[key]) {
        mapa[key] = {
          id: item.id,
          nombre: item.nombre,
          ubicacion: item.ubicacion || "",
          cuenta: item.cuenta || "",
          anio: item.anio,
          datos: Array.from({ length: 12 }, () => ({
            M3: 0,
            valor: 0,
            cumple: true
          }))
        };
      }

      // 🔥 LLENAR MES
      mapa[key].datos[item.mes - 1] = {
        M3: Number(item.m3_consumidos ?? 0),
        valor: Number(item.valor_consumo_agua ?? 0),
        cumple: item.cumple ?? true
      };

    });

    // 🔥 ORDENAR POR AÑO
    const resultado = Object.values(mapa).sort(
      (a: any, b: any) => b.anio - a.anio
    );

    setDatosEnergia(resultado);

  } catch (error) {
    console.error("Error cargando datos:", error);

    Swal.fire({
      icon: "error",
      title: "Error cargando datos"
    });
  }

};

  const agregarFila = () => {
    const nuevaFila = {
      nombre: "NUEVA SEDE",
      ubicacion: "",
      cuenta: "",
      datos: Array.from({ length: 12 }, () => ({
        M3: 0,
        valor: 0,
        cumple: true
      }))
    };

    setDatosEnergia([...datosEnergia, nuevaFila]);

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Fila agregada",
      showConfirmButton: false,
      timer: 1200
    });

  };


  const manejarTeclas = (
  e: React.KeyboardEvent,
  fila: number,
  col: number
) => {

  const totalFilas = inputsRef.current.length;
  const totalCols = inputsRef.current[0]?.length || 0;

  let nuevaFila = fila;
  let nuevaCol = col;

  switch (e.key) {

    case "ArrowRight":
      nuevaCol = col + 1;
      break;

    case "ArrowLeft":
      nuevaCol = col - 1;
      break;

    case "ArrowDown":
      nuevaFila = fila + 1;
      break;

    case "ArrowUp":
      nuevaFila = fila - 1;
      break;

    default:
      return;
  }

  e.preventDefault();

  // evitar salir del rango
  if (
    nuevaFila >= 0 &&
    nuevaFila < totalFilas &&
    nuevaCol >= 0 &&
    nuevaCol < totalCols
  ) {
    inputsRef.current[nuevaFila][nuevaCol]?.focus();
  }

};


const editarCelda = (filaIndex: number, mesIndex: number, campo: string, valor: any) => {

  setDatosEnergia(prev =>
    prev.map((fila, i) => {

      if (i !== filaIndex) return fila;

      return {
        ...fila,
        datos: fila.datos.map((celda: any, j: number) => {

          if (j !== mesIndex) return celda;

          return {
            ...celda,
           [campo]:
  campo === "cumple"
    ? (valor === true || valor === "true")
    : valor === "" ? null : Number(valor)
          };

        })
      };

    })
  );

};
  const fondo = modoNoche
    ? "bg-[#0f0f0f] text-white"
    : "bg-[#ffffff] text-gray-800";

  const card = modoNoche
    ? "bg-[#1b1b1b] border border-gray-700"
    : "bg-white border border-gray-200 shadow";

const datosFiltrados = datosEnergia.filter((d) => {

  const texto = busqueda.toLowerCase();

  const matchBusqueda =
    (d.nombre || "").toLowerCase().includes(texto) ||
    (d.ubicacion || "").toLowerCase().includes(texto);

  const matchMes =
    mes === "" ||
    (d.datos?.[Number(mes)]?.M3 ?? 0) > 0;

  const matchConsumo =
    consumoMin === "" ||
    d.datos.some((m: any) => (m.M3 ?? 0) >= Number(consumoMin));

  const matchAnio =
    anio === "" ||
    Number(d.anio) === Number(anio);

  const matchSede =
    sedeSeleccionada === "" ||
    d.nombre === sedeSeleccionada;

  // 🔥 IMPORTANTE: si hay año seleccionado, SOLO filtra por año y sede
  if (anio !== "") {
    return matchAnio && matchSede;
  }

  // 🔥 si NO hay año, aplica todo
  return matchBusqueda && matchMes && matchConsumo && matchSede;
});

  const crearRegistro = async () => {

  try {

    await guardarRegistro(nuevaFila, 0);

    setDatosEnergia(prev => [...prev, { ...nuevaFila }]);

    setNuevaFila({
      nombre: "",
      ubicacion: "",
      cuenta: "",
      datos: Array.from({ length: 12 }, () => ({
        M3: 0,
        valor: 0,
        cumple: true
      }))
    });

    await cargarDatos();

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Registro creado",
      showConfirmButton: false,
      timer: 1200
    });

  } catch {

    Swal.fire({
      icon: "error",
      title: "Error creando registro"
    });

  }

};

  const calcularTotales = (tipo: string, mes: number): number => {

    return datosEnergia
      .filter((d: any) => d.tipo === tipo)
      .reduce((acc: number, d: any) => {

        if (!d.datos[mes]) return acc;

        return acc + (d.datos[mes].M3 || 0);

      }, 0);

  };
const guardarRegistro = async (fila: any, mesIndex: number, filaIndex?: number) => {
  try {
    const mesData = fila.datos?.[mesIndex];
    if (!mesData) return;

   const payload = {
  id: fila.id, // 🔥 SIEMPRE USAR ID
  nombre: fila.nombre,
  ubicacion: fila.ubicacion,
  cuenta: fila.cuenta,
  anio: Number(anio),
  mes: mesIndex + 1,
  m3_consumidos: mesData.M3 === null ? null : Number(mesData.M3),
  valor_consumo_agua: mesData.valor === null ? null : Number(mesData.valor),
  cumple: mesData.cumple,
};

    const res = await fetch(`http://localhost:8000/comparativoAgua`, {
      method: payload.id ? "PUT" : "POST", // 🔥 CLAVE
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Error guardando");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: payload.id ? "Actualizado" : "Guardado",
      showConfirmButton: false,
      timer: 1000
    });

    await cargarDatos(); // 🔥 refresca datos reales

  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Error guardando datos"
    });
  }
};

const eliminarRegistro = async (fila: any, mesIndex: number) => {
  try {
    const res = await fetch(`http://localhost:8000/comparativoAgua/${fila.id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Error eliminando");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Dato eliminado",
      showConfirmButton: false,
      timer: 1000
    });

    await cargarDatos();

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error eliminando"
    });
  }
};



const inicio = mes === "" ? 0 : Number(mes);
const fin = mes === "" ? 12 : Number(mes) + 1;

const renderTabla = (inicio: number, fin: number) => (

<div className={`overflow-x-auto rounded-xl shadow-sm border 
${modoNoche ? "border-[#333]" : "border-gray-300"}`}>

<table className={`w-full text-xs border-collapse table-auto
${modoNoche ? "text-white" : "text-gray-800"}`}>

<thead>

  <tr>
  <th
    colSpan={3 + (meses.slice(inicio, fin).length * 3)}
    className={`p-4 text-center text-lg font-bold tracking-wide
    ${modoNoche
      ? "bg-[#111] text-cyan-400 border border-[#333]"
      : "bg-blue-400 text-white border border-gray-300"}
    `}
  >
    REGISTRO CONSUMO DE AGUA SEGÚN FACTURACIÓN
  </th>
</tr>

<tr className={`text-sm
${modoNoche
? "bg-[#1f1f1f] text-white"
: "bg-blue-200 text-gray-800"}`}>

<th rowSpan={2} className={`p-3 border ${modoNoche ? "border-[#333]" : "border-gray-300"} text-left`}>
<div className="flex items-center gap-2">
<User size={16}/> Nombre
</div>
</th>

<th rowSpan={2} className={`p-3 border ${modoNoche ? "border-[#333]" : "border-gray-300"} text-left`}>
<div className="flex items-center gap-2">
<MapPin size={16}/> Ubicación
</div>
</th>

<th rowSpan={2} className={`p-3 border ${modoNoche ? "border-[#333]" : "border-gray-300"} text-center`}>
<div className="flex items-center justify-center gap-2">
<CreditCard size={16}/> Cuenta
</div>
</th>

{meses.slice(inicio, fin).map((mes, i) => (
<th key={i}
className={`border p-2 text-center font-semibold
${modoNoche ? "border-[#333]" : "border-gray-300"}`}
colSpan={3}>
{mes}
</th>
))}

</tr>

<tr className={`${modoNoche ? "bg-[#2a2a2a]" : "bg-blue-100"} text-xs`}>

{meses.slice(inicio, fin).map((_, i) => (

<React.Fragment key={i}>

<th className={`border p-2 ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<div className="flex justify-center gap-1 items-center">
<Droplets size={14}/> M³
</div>
</th>

<th className={`border p-2 ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<div className="flex justify-center gap-1 items-center">
<DollarSign size={14}/> Valor
</div>
</th>

<th className={`border p-2 ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<div className="flex justify-center gap-1 items-center">
<CheckCircle size={14}/> C
</div>
</th>

</React.Fragment>

))}

</tr>

</thead>
<tbody>

{/* FILAS */}
{datosFiltrados.map((fila: any, i: number) => (

<tr key={i} className={`transition
${modoNoche
? i % 2 === 0
? "bg-[#141414] hover:bg-[#1e1e1e]"
: "bg-[#181818] hover:bg-[#222]"
: i % 2 === 0
? "bg-white hover:bg-blue-50"
: "bg-gray-50 hover:bg-blue-50"}`}>



{/* NOMBRE */}
<td className={`"border px-2 py-1 min-w-[180px]"${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<input
value={fila.nombre ?? ""}
ref={(el)=>{
if(!inputsRef.current[i]) inputsRef.current[i]=[];
inputsRef.current[i][0]=el;
}}
onKeyDown={(e)=>{
manejarTeclas(e,i,0);

if(e.key==="Enter"){
guardarRegistro(fila,0,i);
}
}}
className={`w-full outline-none font-semibold ${modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"}`}
onChange={(e)=>editarFila(i,"nombre",e.target.value)}
/>
</td>

{/* UBICACION */}
<td className={`border p-2 ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<input
value={fila.ubicacion ?? ""}
ref={(el)=>{
if(!inputsRef.current[i]) inputsRef.current[i]=[];
inputsRef.current[i][1]=el;
}}
onKeyDown={(e)=>{
manejarTeclas(e,i,1);

if(e.key==="Enter"){
guardarRegistro(fila,0,i);
}
}}
className={`w-full outline-none ${modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"}`}
onChange={(e)=>editarFila(i,"ubicacion",e.target.value)}
/>
</td>

{/* CUENTA */}
<td className={`border p-2 text-center ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<input
value={fila.cuenta ?? ""}
ref={(el)=>{
if(!inputsRef.current[i]) inputsRef.current[i]=[];
inputsRef.current[i][2]=el;
}}
onKeyDown={(e)=>{
manejarTeclas(e,i,2);

if(e.key==="Enter"){
guardarRegistro(fila,0,i);
}
}}
className={`w-full outline-none text-center ${modoNoche ? "bg-transparent text-white" : "bg-transparent text-gray-800"}`}
onChange={(e)=>editarFila(i,"cuenta",e.target.value)}
/>
</td>

{fila.datos.slice(inicio,fin).map((d:any,j:number)=>{

const colBase = 3 + j*3;

return (

<React.Fragment key={j}>

{/* M3 */}
<td className={`border p-1 text-center ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<div className="flex items-center justify-center gap-1">

<input
value={d.M3 ?? ""}
type="text"
inputMode="decimal"
ref={(el)=>{
if(!inputsRef.current[i]) inputsRef.current[i]=[];
inputsRef.current[i][colBase]=el;
}}
onKeyDown={(e)=>{
manejarTeclas(e,i,colBase);

if(e.key==="Enter"){
guardarRegistro(datosEnergia[i],inicio+j,i);
}

// 🔥 borrar con teclado
if(e.key==="Delete" || e.key==="Backspace"){
editarCelda(i, inicio+j, "M3", "");
}
}}
className={`w-20 text-center rounded-md border outline-none
${modoNoche ? "bg-[#2a2a2a] border-[#444] text-white" : "bg-gray-100 border-gray-300 text-gray-800"}`}
onChange={(e)=>{
const valor = e.target.value.replace(/[^0-9.]/g, "");
editarCelda(i, inicio+j, "M3", valor);
}}
/>



</div>
</td>

{/* VALOR */}
<td className={`border p-1 text-center ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<input
value={d.valor ?? ""}
type="text"
inputMode="numeric"
ref={(el)=>{
if(!inputsRef.current[i]) inputsRef.current[i]=[];
inputsRef.current[i][colBase+1]=el;
}}
onKeyDown={(e)=>{
manejarTeclas(e,i,colBase+1);

if(e.key==="Enter"){
guardarRegistro(datosEnergia[i],inicio+j,i);
}

// 🔥 borrar con teclado
if(e.key==="Delete" || e.key==="Backspace"){
editarCelda(i, inicio+j, "valor", "");
}
}}
className={`w-24 text-center rounded-md border outline-none
${modoNoche ? "bg-[#2a2a2a] border-[#444] text-white" : "bg-gray-100 border-gray-300 text-gray-800"}`}
onChange={(e)=>{
const valor = e.target.value.replace(/[^0-9]/g, "");
editarCelda(i, inicio+j, "valor", valor);
}}
/>
</td>

{/* CUMPLE */}
<td className={`border p-1 text-center ${modoNoche ? "border-[#333]" : "border-gray-300"}`}>
<select
value={d.cumple ? "true":"false"}
ref={(el)=>{
if(!inputsRef.current[i]) inputsRef.current[i]=[];
inputsRef.current[i][colBase+2]=el;
}}
onKeyDown={(e)=>manejarTeclas(e,i,colBase+2)}
className={`text-lg font-bold cursor-pointer
${d.cumple ? "text-green-500":"text-red-500"}
${modoNoche ? "bg-[#1f1f1f]" : "bg-white"}`}
onChange={(e)=>{
const nuevoValor = e.target.value === "true";

editarCelda(i, inicio+j, "cumple", nuevoValor);

// 🔥 guardar inmediato
guardarRegistro({
...datosEnergia[i],
datos: datosEnergia[i].datos.map((item:any, idx:number) =>
idx === (inicio+j)
? { ...item, cumple: nuevoValor }
: item
)
}, inicio+j, i);
}}
>
<option value="true">✔</option>
<option value="false">✖</option>
</select>
</td>

</React.Fragment>

);

})}

</tr>

))}

{/* NUEVA FILA */}
<tr
  className={`${
    modoNoche ? "bg-[#202020]" : "bg-blue-50"
  
  }`}
>
  {/* NOMBRE */}
  <td className="border border-gray-300 p-3">
    <input
      value={nuevaFila.nombre}
      placeholder="Nombre sede"
      className={`w-full rounded-md px-3 py-2 border ${
        modoNoche
          ? "bg-[#202020] border-gray-500 text-white placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-700"
      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      onChange={(e) => editarNuevaFila("nombre", e.target.value)}
    />
  </td>

  {/* UBICACIÓN */}
  <td className="border border-gray-300 p-3">
    <input
      value={nuevaFila.ubicacion}
      placeholder="Ubicación"
      className={`w-full rounded-md px-3 py-2 border ${
        modoNoche
          ? "bg-[#202020] border-gray-500 text-white placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-700"
      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      onChange={(e) => editarNuevaFila("ubicacion", e.target.value)}
    />
  </td>

  {/* CUENTA */}
  <td className="border border-gray-300 p-3 text-center">
    <input
      value={nuevaFila.cuenta}
      placeholder="Cuenta"
      className={`w-full rounded-md px-3 py-2 text-center border ${
        modoNoche
          ? "bg-[#202020] border-gray-500 text-white placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-700"
      } focus:outline-none focus:ring-2 focus:ring-blue-400`}
      onChange={(e) => editarNuevaFila("cuenta", e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          crearRegistro();
        }
      }}
    />
  </td>
</tr>
{/* TOTAL PRINCIPAL */}
{mostrarTotales && (
<tr
  className={`font-bold ${
    modoNoche
      ? "bg-[#181818] text-white"
      : "bg-blue-100 text-blue-800"
  }`}
>
  <td colSpan={3} className="border border-gray-300 p-3">
    TOTAL SEDE PRINCIPAL
  </td>

  {meses.slice(inicio, fin).map((_, i) => (
    <td
      key={i}
      colSpan={3}
      className="border border-gray-300 text-center p-3"
    >
      {datosEnergia
        .filter((d) =>
          d.nombre?.toUpperCase().includes("SEDE PPAL")
        )
        .reduce(
          (acc: any, d: any) =>
            acc + Number(d.datos?.[inicio + i]?.M3 || 0),
          0
        )}{" "}
      m³
    </td>
  ))}
</tr>
)}

{/* TOTAL RECEPTORIAS */}
<tr
  className={`font-bold ${
    modoNoche
      ? "bg-[#202020] text-gray-200"
      : "bg-blue-50 text-blue-700"
  }`}
>
  <td colSpan={3} className="border border-gray-300 p-3">
    TOTAL SOLO RECEPTORIAS
  </td>

  {meses.slice(inicio, fin).map((_, i) => (
    <td
      key={i}
      colSpan={3}
      className="border border-gray-300 text-center p-3"
    >
      {datosEnergia
        .filter((d) =>
          d.nombre?.toUpperCase().includes("RECEPTORIA")
        )
        .reduce(
          (acc: any, d: any) =>
            acc + Number(d.datos?.[inicio + i]?.M3 || 0),
          0
        )}{" "}
      m³
    </td>
  ))}
</tr>

</tbody>

</table>

</div>

);


  return (

    <div className={`min-h-screen p-8 ${fondo}`}>

      <div className="max-w-[1700px] mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex items-center gap-1">


          <div>



          </div>

        </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

{/* CONSUMO TOTAL */}

<div className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

<div>
<p className="text-sm opacity-70 flex items-center gap-2">
💧 Consumo total
</p>

<h2 className="text-3xl font-bold text-blue-500 mt-2">
{datosEnergia.reduce((acc, d) => acc +
d.datos.reduce((a:any,b:any)=>a+b.M3,0),0)} m³
</h2>
</div>

<div className="p-4 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
<Droplets size={30}/>
</div>

{/* Glow */}
<div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-2xl"></div>

</div>


{/* EXPORTAR */}

<div className={`p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

<div>
<p className="text-sm opacity-70 flex items-center gap-2">
📄 Comparativo general
</p>

<p className="text-xs opacity-60 mt-1">
Exporta un resumen completo en PDF
</p>
</div>

<button
onClick={() => generarReciboPDF(datosEnergia)}
className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition"
>
📥 Descargar PDF
</button>

<div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-500 opacity-20 rounded-full blur-2xl"></div>

</div>


{/* SEDES */}

<div className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

<div>
<p className="text-sm opacity-70 flex items-center gap-2">
🏢 Sedes activas
</p>

<h2 className="text-3xl font-bold text-emerald-500 mt-2">
{datosEnergia.length}
</h2>
</div>

<div className="p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg">
<Building2 size={30}/>
</div>

<div className="absolute -left-10 -bottom-10 w-32 h-32 bg-green-500 opacity-20 rounded-full blur-2xl"></div>

</div>


{/* TOTAL A PAGAR */}

<div className={`p-6 rounded-2xl flex items-center justify-between relative overflow-hidden
${card} shadow-lg hover:scale-[1.02] transition`}>

<div>
<p className="text-sm opacity-70 flex items-center gap-2">
💰 Total agua
</p>

<h2 className="text-3xl font-bold text-blue-600 mt-2">
$
{datosEnergia.reduce((acc,d)=>acc+
d.datos.reduce((a:any,b:any)=>a+b.valor,0),0)
.toLocaleString()}
</h2>
</div>

<div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
<DollarSign size={30}/>
</div>

<div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>

</div>

</div>

{/* BUSCADOR AVANZADO */}

<div className={`p-6 rounded-2xl ${card} shadow-md border ${modoNoche ? "border-[#333]" : "border-gray-200"}`}>

{/* HEADER */}
<div className="flex items-center gap-3 mb-6">

<div className="p-2 rounded-xl bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
<Filter size={20} className="text-blue-500"/>
</div>

<div>
<h3 className="font-semibold text-lg tracking-wide">
Filtros Avanzados
</h3>
<p className="text-xs opacity-60">
Filtra el consumo de agua por diferentes criterios
</p>
</div>

</div>

<div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">

{/* BUSCAR */}
<div className="relative group">

<Search size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition"/>

<input
value={busqueda}
onChange={(e)=>setBusqueda(e.target.value)}
placeholder="Buscar sede o ubicación..."
className={`w-full p-3 pl-10 rounded-xl border text-sm transition shadow-sm
${modoNoche
? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-blue-500"
: "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400"}
`}
/>

</div>


{/* AÑO */}
<div className="relative group">

<Calendar size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition"/>

<select
value={anio}
onChange={(e)=>setAnio(e.target.value)}
className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium transition shadow-sm
${modoNoche
? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-blue-500"
: "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400"}
`}
>
<option value="">Todos los años</option>

{years.map((y) => (
<option key={y} value={y}>
{y}
</option>
))}

</select>

</div>


{/* MES */}
<div className="relative group">

<Calendar size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition"/>

<select
value={mes}
onChange={(e)=>setMes(e.target.value)}
className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium transition shadow-sm
${modoNoche
? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-blue-500"
: "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400"}
`}
>
<option value="">Todos los meses</option>

{meses.map((m, i)=>(
<option key={i} value={i}>
{m}
</option>
))}

</select>

</div>


{/* SEDES */}
<div className="relative group">

<Building2 size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition"/>

<select
value={sedeSeleccionada}
onChange={(e)=>setSedeSeleccionada(e.target.value)}
className={`w-full p-3 pl-10 rounded-xl border text-sm font-medium transition shadow-sm
${modoNoche
? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-blue-500"
: "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400"}
`}
>
<option value="">Todas las sedes</option>

{sedes.map((sede, i) => (
<option key={i} value={sede}>
{sede}
</option>
))}

</select>

</div>


{/* CONSUMO */}
<div className="relative group">

<Droplets size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition"/>

<input
type="number"
value={consumoMin}
onChange={(e)=>setConsumoMin(e.target.value)}
placeholder="Consumo mínimo (m³)"
className={`w-full p-3 pl-10 rounded-xl border text-sm transition shadow-sm
${modoNoche
? "bg-[#1f1f1f] border-[#333] text-white focus:ring-2 focus:ring-blue-500"
: "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400"}
`}
/>

</div>

</div>
</div>

        <div className={`rounded-xl overflow-auto ${card}`}>

          {renderTabla(0, 4)}
        </div>

        {/* TABLA MAYO - AGOSTO */}
        <div className={`rounded-xl overflow-auto ${card}`}>

          {renderTabla(4, 8)}
        </div>

        {/* TABLA SEPTIEMBRE - DICIEMBRE */}
        <div className={`rounded-xl overflow-auto ${card}`}>

          {renderTabla(8, 12)}
        </div>

      </div>

    </div>
    

  );
}
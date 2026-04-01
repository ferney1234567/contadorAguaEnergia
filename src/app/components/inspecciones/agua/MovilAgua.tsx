"use client";

import Swal from "sweetalert2";

interface Props {
  modoNoche?: boolean;
  dataBackend: any[];
  dataBackendFiltrada: any[];
  campos: any[];
  valores: any;
  observaciones: any;
  responsable: string;
  estilos: any;
  inspeccionesFiltradas: any[];
  handleChange: any;
  handleObs: any;
  totalFila: any;
  totalCampoFila: any;
  totalCampoGeneral: any;
  totalGeneral: any;
  tieneDatos: any;
  editarContenedor: any;
  finalizarInspeccion: any;
  setInspecciones: any;
  setValores: any;
  setObservaciones: any;
}

export default function MovilAgua(props: Props) {
  const {modoNoche,dataBackend,dataBackendFiltrada,campos,valores,observaciones,responsable,estilos,
    inspeccionesFiltradas,handleChange,handleObs,totalFila,totalCampoFila,totalCampoGeneral,totalGeneral,
    tieneDatos,editarContenedor,finalizarInspeccion,setInspecciones,setValores,setObservaciones,
  } = props;

  return (
  <div className="block lg:hidden space-y-4">
          {/* 🔥 FORMULARIO PARA TODAS LAS ÁREAS */}
          {dataBackend.map((fila: any) => {
            const indiceOriginal = dataBackend.indexOf(fila);

            return (
              <div
                key={"form-" + indiceOriginal}
                className={`rounded-2xl p-4 border ${estilos.borde} ${estilos.fila}`}
              >
                <h4 className="font-bold text-base mb-4 text-center">
                  {fila.nombre} 📝
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {campos.map((c) => (
                    <div
                      key={c.key}
                      className={`rounded-xl border p-3 ${estilos.borde}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <img src={c.img} className="w-8 h-8 object-contain" />
                        <span className="text-sm font-semibold">
                          {c.nombre}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={valores?.[indiceOriginal]?.[c.key]?.c || ""}
                          onChange={(e) =>
                            handleChange(
                              indiceOriginal,
                              c.key,
                              "c",
                              e.target.value,
                            )
                          }
                          placeholder="✔ Cumple"
                          className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                        />

                        <input
                          value={valores?.[indiceOriginal]?.[c.key]?.nc || ""}
                          onChange={(e) =>
                            handleChange(
                              indiceOriginal,
                              c.key,
                              "nc",
                              e.target.value,
                            )
                          }
                          placeholder="✖ No cumple"
                          className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                        />
                      </div>
                    </div>
                  ))}

                  <textarea
                    placeholder="Observación..."
                    onChange={(e) => handleObs(indiceOriginal, e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-sm ${estilos.input}`}
                  />

                  {/* 🔥 GUARDAR */}
                  <button
                    onClick={async () => {
                      if (!responsable) {
                        alert("Debes escribir el responsable");
                        return;
                      }

                      const body = {
  fecha: new Date().toISOString().split("T")[0],
  responsable,
  area_id: fila.id,

  tuberias_c: Number(valores?.[indiceOriginal]?.[1]?.c || 0),
  tuberias_nc: Number(valores?.[indiceOriginal]?.[1]?.nc || 0),

  fugas_c: Number(valores?.[indiceOriginal]?.[2]?.c || 0),
  fugas_nc: Number(valores?.[indiceOriginal]?.[2]?.nc || 0),

  medidores_c: Number(valores?.[indiceOriginal]?.[3]?.c || 0),
  medidores_nc: Number(valores?.[indiceOriginal]?.[3]?.nc || 0),

  tanques_c: Number(valores?.[indiceOriginal]?.[4]?.c || 0),
  tanques_nc: Number(valores?.[indiceOriginal]?.[4]?.nc || 0),

  llaves_c: Number(valores?.[indiceOriginal]?.[5]?.c || 0),
  llaves_nc: Number(valores?.[indiceOriginal]?.[5]?.nc || 0),

  observacion: observaciones[indiceOriginal] || "",
};

                      await fetch("/api/inspecciones-sanitarias", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      });

                      // 🔥 volver a traer datos
                      const inspeccionesRes = await fetch(
                        "/api/inspecciones-sanitarias",
                      );
                      const nuevasInspecciones = await inspeccionesRes.json();
                      setInspecciones(nuevasInspecciones);

                      // 🔥 limpiar inputs (opcional)
                      setValores({});
                      setObservaciones({});

                      // 🔥 alerta bonita
                      Swal.fire({
                        icon: "success",
                        title: "Guardado",
                        text: "Datos guardados correctamente",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl"
                  >
                    Guardar
                  </button>
                  <div className="flex gap-2">
                    {tieneDatos(indiceOriginal) && (
                      <button
                        onClick={() => editarContenedor(indiceOriginal)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 🔥 DATOS EXISTENTES */}
         {!Object.keys(valores || {}).length && inspeccionesFiltradas.length > 0 &&
            (dataBackendFiltrada || []).map((fila: any) => {
              const indiceOriginal = dataBackend.indexOf(fila);

              return (
                <div
                  key={"data-" + indiceOriginal}
                  className={`rounded-2xl p-4 border ${estilos.borde} ${estilos.fila}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-base">{fila.nombre}</h4>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold
          ${
            modoNoche
              ? "bg-blue-900/40 text-blue-200 border border-blue-800"
              : "bg-blue-50 text-blue-600 border border-blue-200"
          }`}
                    >
                      {totalFila(indiceOriginal)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {campos.map((c) => (
                      <div
                        key={c.key}
                        className={`rounded-xl border p-3 ${estilos.borde}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <img src={c.img} className="w-8 h-8 object-contain" />
                          <span className="text-sm font-semibold">
                            {c.nombre}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={valores?.[indiceOriginal]?.[c.key]?.c || ""}
                            onChange={(e) =>
                              handleChange(
                                indiceOriginal,
                                c.key,
                                "c",
                                e.target.value,
                              )
                            }
                            className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                          />

                          <input
                            value={valores?.[indiceOriginal]?.[c.key]?.nc || ""}
                            onChange={(e) =>
                              handleChange(
                                indiceOriginal,
                                c.key,
                                "nc",
                                e.target.value,
                              )
                            }
                            className={`w-full rounded-xl px-3 py-2 text-sm text-center ${estilos.input}`}
                          />
                        </div>

                        <div
                          className={`mt-3 text-center text-sm font-semibold rounded-lg py-1
              ${modoNoche ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"}`}
                        >
                          Total: {totalCampoFila(indiceOriginal, c.key)}
                        </div>
                      </div>
                    ))}

                    <textarea
                      value={observaciones[indiceOriginal] || ""}
                      onChange={(e) =>
                        handleObs(indiceOriginal, e.target.value)
                      }
                      className={`w-full rounded-lg px-3 py-2 text-sm ${estilos.input}`}
                    />
                  </div>
                </div>
              );
            })}

          {/* TOTAL GENERAL */}
          <div className={`rounded-2xl p-4 border ${estilos.borde}`}>
            <h3 className="text-center font-bold mb-3">Total General</h3>

            <div className="grid grid-cols-2 gap-2">
              {campos.map((c) => (
                <div
                  key={c.key}
                  className={`rounded-xl p-3 text-center
      ${modoNoche ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"}`}
                >
                  <div>{c.nombre}</div>
                  <div className="font-bold text-lg">
                    {totalCampoGeneral(c.key)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <div>Total inspección</div>
              <div className="text-2xl font-bold">{totalGeneral()}</div>
            </div>
          </div>

          <button
            onClick={finalizarInspeccion}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-xl"
          >
            Finalizar inspección semanal
          </button>
        </div>
  );
}
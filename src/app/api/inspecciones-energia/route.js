const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR INSPECCIONES ENERGÍA
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/inspecciones-energia`);

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 }
      );
    }

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error obteniendo inspecciones de energía" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR INSPECCIÓN ENERGÍA
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/inspecciones-energia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error guardando inspección de energía" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR INSPECCIÓN ENERGÍA
========================= */
export async function PUT(request) {
  try {
    const body = await request.json();

    // 🔒 validar id
    if (!body.id) {
      return Response.json(
        { error: "Falta el id para actualizar" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${BACKEND_URL}/inspecciones-energia/${body.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ RESPUESTA NO JSON:", text);

      return Response.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    return Response.json(data, { status: res.status });

  } catch (error) {
    console.error("🔥 ERROR PUT:", error);

    return Response.json(
      { error: "Error actualizando inspección de energía" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · BORRAR INSPECCIÓN
========================= */
export async function DELETE(request) {
  try {
    const body = await request.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/inspecciones-energia`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error eliminando inspección de energía" },
      { status: 500 }
    );
  }
}
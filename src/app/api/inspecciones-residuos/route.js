const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR INSPECCIONES
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/inspecciones-residuos`);
    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error obteniendo inspecciones de residuos" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR INSPECCIÓN
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/inspecciones-residuos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error guardando inspección de residuos" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR INSPECCIÓN
   ⚠️ IMPORTANTE:
   Tu backend usa PUT "/" (id en body)
========================= */
export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return Response.json(
        { error: "Falta el id para actualizar" },
        { status: 400 }
      );
    }

    // 🔥 CORREGIDO: SIN /{id}
    const res = await fetch(
      `${BACKEND_URL}/inspecciones-residuos`,
      {
        method: "PUT",
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
      { error: "Error actualizando inspección" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · BORRAR POR ID
========================= */
export async function DELETE(request) {
  try {
    const body = await request.json();

    const res = await fetch(
      `${BACKEND_URL}/inspecciones-residuos`,
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
      { error: "Error eliminando inspección" },
      { status: 500 }
    );
  }
}
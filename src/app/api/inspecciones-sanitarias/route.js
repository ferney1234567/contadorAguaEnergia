const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR INSPECCIONES AGUA
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/inspecciones-sanitarias`);
    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error obteniendo inspecciones de agua" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR INSPECCIÓN AGUA
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/inspecciones-sanitarias`, {
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
      { error: "Error guardando inspección de agua" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR INSPECCIÓN
========================= */
export async function PUT(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/inspecciones-sanitarias`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error actualizando inspección sanitaria" },
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
      `${process.env.NEXT_PUBLIC_API_URL}/inspecciones-sanitarias`,
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
      { error: "Error eliminando inspección sanitaria" },
      { status: 500 }
    );
  }
}
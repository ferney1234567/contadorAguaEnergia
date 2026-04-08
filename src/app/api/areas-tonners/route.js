const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR ÁREAS TONNERS
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/areas-tonners`);
    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error obteniendo áreas tonners" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR ÁREA
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/areas-tonners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error creando área tonner" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR ÁREA
========================= */
export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return Response.json(
        { error: "Falta el id" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas-tonners`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error actualizando área tonner" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR ÁREA
========================= */
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Falta parámetro id" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas-tonners?id=${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      return Response.json(
        { error: "Error eliminando área en backend" },
        { status: res.status }
      );
    }

    return Response.json(
      { mensaje: "Área eliminada correctamente" },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { error: "Error en DELETE áreas tonners" },
      { status: 500 }
    );
  }
}
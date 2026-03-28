const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR AREAS
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/areas`);
    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error obteniendo áreas" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR AREA
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.nombre) {
      return Response.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas`, {
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
      { error: "Error creando área" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR AREA
========================= */
export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body.id || !body.nombre) {
      return Response.json(
        { error: "Faltan id o nombre" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas/${body.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: body.nombre,
      }),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error actualizando área" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR AREA
========================= */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Falta el parámetro id" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error eliminando área" },
      { status: 500 }
    );
  }
}
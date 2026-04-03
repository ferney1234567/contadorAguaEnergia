const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR AREAS RESMAS
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/areas-resmas`);
    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error obteniendo áreas de resmas" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR AREA RESMAS
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.nombre || !String(body.nombre).trim()) {
      return Response.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas-resmas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: String(body.nombre).trim(),
      }),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error creando área de resmas" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR AREA RESMAS
========================= */
export async function PUT(request) {
  try {
    const body = await request.json();

    const id = body.id;
    const nombre = body.nombre ? String(body.nombre).trim() : "";

    if (!id || !nombre) {
      return Response.json(
        { error: "Faltan id o nombre" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas-resmas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error actualizando área de resmas" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR AREA RESMAS
========================= */
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id || isNaN(Number(id))) {
      return Response.json(
        { error: "ID inválido o faltante" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas-resmas/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error eliminando área de resmas" },
      { status: 500 }
    );
  }
}
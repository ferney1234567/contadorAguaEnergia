const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR RESMAS
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/resmas`);
    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error obteniendo resmas" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR RESMA
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const { area_id, anio, mes } = body;

    if (!area_id || !anio || !mes) {
      return Response.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/resmas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        area_id,
        anio,
        mes,
        cantidad: body.cantidad || 0,
        cumple: body.cumple ?? true,
      }),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error creando resma" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR RESMA (opcional)
========================= */
export async function PUT(request) {
  try {
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return Response.json(
        { error: "Falta ID" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/resmas/${id}`, {
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
      { error: "Error actualizando resma" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR RESMA
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

    const res = await fetch(`${BACKEND_URL}/resmas/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error eliminando resma" },
      { status: 500 }
    );
  }
}
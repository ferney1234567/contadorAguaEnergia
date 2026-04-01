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

    if (!body.nombre || !String(body.nombre).trim()) {
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
      body: JSON.stringify({
        nombre: String(body.nombre).trim(),
      }),
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
   Se usa así:
   fetch("/api/areas", {
     method: "PUT",
     body: JSON.stringify({ id, nombre })
   })
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

    const res = await fetch(`${BACKEND_URL}/areas/${id}`, {
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
      { error: "Error actualizando área" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR AREA
   Se usa así:
   fetch(`/api/areas?id=${id}`, { method: "DELETE" })
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
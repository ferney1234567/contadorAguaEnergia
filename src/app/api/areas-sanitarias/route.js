const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR AREAS SANITARIAS
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/areas-sanitarias`);
    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error obteniendo áreas sanitarias" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR AREA SANITARIA
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const nombre = body.nombre ? String(body.nombre).trim() : "";

    if (!nombre) {
      return Response.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/areas-sanitarias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error creando área sanitaria" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT · ACTUALIZAR AREA SANITARIA
   ✔ usa id en el body
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

    const res = await fetch(`${BACKEND_URL}/areas-sanitarias/${id}`, {
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
      { error: "Error actualizando área sanitaria" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR AREA SANITARIA
   ✔ usa ?id=
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

    const res = await fetch(`${BACKEND_URL}/areas-sanitarias/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error eliminando área sanitaria" },
      { status: 500 }
    );
  }
}
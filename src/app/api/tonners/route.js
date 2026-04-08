const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR TONNERS
========================= */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");

    let url = `${BACKEND_URL}/tonners`;

    if (fecha) {
      url += `?fecha=${fecha}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error obteniendo tonners" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR / ACTUALIZAR TONNER
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/tonners`, {
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
      { error: "Error guardando tonner" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return Response.json({ error: "Falta id" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/tonners/${body.id}`, {
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
      { error: "Error actualizando tonner" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR TONNER
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

    const res = await fetch(`${BACKEND_URL}/tonners/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      return Response.json(
        { error: "Error eliminando tonner en backend" },
        { status: res.status }
      );
    }

    return Response.json(
      { mensaje: "Tonner eliminado correctamente" },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { error: "Error en DELETE tonners" },
      { status: 500 }
    );
  }
}
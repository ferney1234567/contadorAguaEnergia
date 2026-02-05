const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR ENERGÍA
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/energia`);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error obteniendo consumo de energía" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR / ACTUALIZAR (UPSERT)
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/energia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error guardando consumo de energía" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · BORRAR POR FECHA + BODEGA
========================= */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const bodega = searchParams.get("bodega");

    if (!fecha || !bodega) {
      return Response.json(
        { error: "Faltan parámetros fecha o bodega" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${BACKEND_URL}/energia?fecha=${fecha}&bodega=${bodega}`,
      { method: "DELETE" }
    );

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: "Error eliminando consumo de energía" },
      { status: 500 }
    );
  }
}

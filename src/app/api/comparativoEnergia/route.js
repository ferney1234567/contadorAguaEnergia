const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   GET · LISTAR COMPARATIVO ENERGÍA
========================= */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/comparativoEnergia`);
    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error obteniendo comparativo de energía" },
      { status: 500 }
    );
  }
}

/* =========================
   POST · CREAR COMPARATIVO ENERGÍA
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/comparativoEnergia`, {
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
      { error: "Error guardando comparativo de energía" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE · ELIMINAR COMPARATIVO
========================= */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Falta parámetro id" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/comparativoEnergia/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    return Response.json(data, { status: res.status });

  } catch (error) {
    return Response.json(
      { error: "Error eliminando comparativo de energía" },
      { status: 500 }
    );
  }
}
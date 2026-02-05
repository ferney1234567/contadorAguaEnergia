const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}
/* =========================
   GET
   ?tipo=agua&anio=2026&mes=1
========================= */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const tipo = searchParams.get("tipo");
  const anio = searchParams.get("anio");
  const mes = searchParams.get("mes");

  let url = `${BACKEND_URL}/metas`;

  const params = new URLSearchParams();
  if (tipo) params.append("tipo", tipo);
  if (anio) params.append("anio", anio);
  if (mes) params.append("mes", mes);

  if ([...params].length) {
    url += `?${params.toString()}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  return Response.json(data);
}

/* =========================
   POST (UPSERT)
========================= */
export async function POST(request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/metas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: 201 });
}

/* =========================
   PUT
========================= */
export async function PUT(request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/metas/${body.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data);
}

/* =========================
   DELETE
========================= */
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);

  const tipo = searchParams.get("tipo");
  const anio = searchParams.get("anio");
  const mes = searchParams.get("mes");

  if (!tipo || !anio || !mes) {
    return Response.json(
      { error: "Faltan parámetros para eliminar meta" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${BACKEND_URL}/metas?tipo=${tipo}&anio=${anio}&mes=${mes}`,
    { method: "DELETE" }
  );

  const data = await res.json();
  return Response.json(data);
}

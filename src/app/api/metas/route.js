const BACKEND_URL = "http://127.0.0.1:8000";

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

  // Si vienen filtros → los agrega
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
   POST  (UPSERT)
   body:
   {
     tipo: "agua",
     anio: 2026,
     mes: 1,
     meta: 41
   }
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
   PUT (opcional)
   body:
   {
     id: 1,
     meta: 50
   }
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
   body:
   { id: 1 }
========================= */
export async function DELETE(request) {
  const { id } = await request.json();

  const res = await fetch(`${BACKEND_URL}/metas/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  return Response.json(data);
}

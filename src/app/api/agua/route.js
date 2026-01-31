const BACKEND_URL = "http://127.0.0.1:8000";

/* =========================
   GET → obtener todos
========================= */
export async function GET() {
  const res = await fetch(`${BACKEND_URL}/agua`);
  const data = await res.json();
  return Response.json(data);
}

/* =========================
   POST → crear
========================= */
export async function POST(request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/agua`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: 201 });
}

/* =========================
   PUT → editar
========================= */
export async function PUT(request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/agua/${body.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data);
}

/* =========================
   DELETE → eliminar
========================= */
export async function DELETE(request) {
  const { id } = await request.json();

  const res = await fetch(`${BACKEND_URL}/agua/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  return Response.json(data);
}

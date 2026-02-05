import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

/* =========================
   POST · GUARDAR LECTURA MANUAL
========================= */
export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/lecturas/manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    console.error("Error proxy lecturas/manual:", error);

    return NextResponse.json(
      { error: "Error reenviando lectura manual" },
      { status: 500 }
    );
  }
}

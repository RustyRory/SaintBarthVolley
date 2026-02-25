// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    // Appel du backend Express
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      },
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur serveur" },
        { status: backendRes.status },
      );
    }

    // Retourne la réponse au front (pas de JWT ici, l’admin doit valider le compte)
    return NextResponse.json({ message: data.message });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token JWT dans le cookie httpOnly
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    // Appel au backend pour récupérer l'utilisateur
    const res = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur authentification" },
        { status: res.status },
      );
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    console.error("Next.js API /auth/me error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

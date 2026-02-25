import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    // Appel au backend Express
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const token = data.token;

    // Stockage dans un cookie httpOnly
    const response = NextResponse.json(
      { message: "Connexion réussie", user: data.user },
      { status: 200 },
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 jour
    });

    return response;
  } catch (err) {
    console.error("Next Auth Login Error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    const res = await fetch(`${process.env.BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur inscription" },
        { status: res.status },
      );
    }

    // Si le backend renvoie un token (login auto), on peut le mettre dans le cookie
    const response = NextResponse.json({
      message: data.message,
      user: data.user,
    });
    if (data.token) {
      response.cookies.set({
        name: "token",
        value: data.token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 jour
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (err) {
    console.error("Next.js API register error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

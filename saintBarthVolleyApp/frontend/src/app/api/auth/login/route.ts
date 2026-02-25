// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Erreur login" },
        { status: res.status },
      );
    }

    // Stockage du JWT dans un cookie httpOnly
    const response = NextResponse.json({ user: data.user });
    response.cookies.set({
      name: "token",
      value: data.token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 jour
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("Next.js API login error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

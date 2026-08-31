import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/db/auth.server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  const token = await createSessionToken(user);
  const res = NextResponse.json({ email: user.email });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

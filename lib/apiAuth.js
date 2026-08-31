import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

/** Returns a 401 NextResponse if the caller is not an authenticated admin, otherwise null. */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  return null;
}

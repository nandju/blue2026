import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export async function middleware(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/admin", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protège toutes les pages sous /admin/… ; la page de connexion /admin reste publique.
export const config = {
  matcher: ["/admin/:path+"],
};

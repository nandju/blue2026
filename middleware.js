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

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/chatbot/:path*"],
};

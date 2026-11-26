import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getAdminSession } from "@/lib/apiAuth";
import { adminLog } from "@/lib/data";

export async function POST() {
  const session = await getAdminSession();
  if (session?.loginId) {
    await adminLog.closeLogin(session.loginId, { reason: "Déconnexion" }).catch((e) =>
      console.error("[journal] Déconnexion non enregistrée :", e.message)
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { adminLog } from "@/lib/data";

/**
 * Session admin courante ({ id, email, name, department, loginId, expiresAt }) ou null.
 * Une session fermée par « Déconnexion » est refusée même si le jeton n'a pas
 * encore expiré (révocation côté serveur).
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  if (session.loginId) {
    try {
      const login = await adminLog.getLogin(session.loginId);
      if (login?.logoutAt) return null;
    } catch (e) {
      // Journal momentanément illisible : on s'en tient à la validité du jeton.
      console.error("[auth] Vérification de session impossible :", e.message);
    }
  }
  return session;
}

/** Returns a 401 NextResponse if the caller is not an authenticated admin, otherwise null. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Session expirée ou non autorisée. Reconnectez-vous." }, { status: 401 });
  }
  return null;
}

/** Auteur à enregistrer sur un contenu modifié : { name, department }. */
export async function getOperator() {
  const session = await getAdminSession();
  return session ? { name: session.name, department: session.department } : null;
}

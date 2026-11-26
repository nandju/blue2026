import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { adminAccount, adminLog } from "@/lib/data";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { apiHandler, parseJson, getClientIp } from "@/lib/apiHandler";
import { loginSchema } from "@/lib/validation";
import { getDepartments } from "@/lib/siteSettings.server";
import { parseUserAgent } from "@/lib/userAgent";
import { checkLoginAllowed, recordLoginFailure, resetLoginFailures } from "@/lib/loginRateLimit.server";
import { OTHER_DEPARTMENT } from "@/lib/data/defaults";

const FAILURE_REASONS = {
  email: "Email inconnu",
  password: "Mot de passe incorrect",
  config: "Configuration du compte admin manquante",
};

/** Enregistre la tentative ; ne bloque jamais la connexion si le journal est indisponible. */
async function recordLogin(entry) {
  try {
    return await adminLog.addLogin(entry);
  } catch (e) {
    console.error("[journal] Connexion non enregistrée :", e.message);
    return { id: crypto.randomUUID() };
  }
}

export const POST = apiHandler(async (req) => {
  const ip = getClientIp(req);
  const ua = parseUserAgent(req.headers.get("user-agent") || "");
  const context = { ip, userAgent: (req.headers.get("user-agent") || "").slice(0, 300), browser: ua.browser, os: ua.os, device: ua.device };

  const body = await parseJson(req, loginSchema);
  const departments = await getDepartments();
  if (!departments.includes(body.department)) {
    return NextResponse.json({ error: "Département inconnu : choisissez-en un dans la liste." }, { status: 400 });
  }
  const department = body.department === OTHER_DEPARTMENT ? body.departmentOther.trim() : body.department;
  const identity = { name: body.name, department, email: body.email };

  const limit = checkLoginAllowed(ip);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    await recordLogin({ ...identity, ...context, success: false, reason: "Trop de tentatives (blocage temporaire)" });
    return NextResponse.json(
      { error: `Trop de tentatives échouées. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const result = await adminAccount.verify(body.email, body.password);
  if (!result.ok) {
    await recordLogin({ ...identity, ...context, success: false, reason: FAILURE_REASONS[result.reason] || "Échec" });
    if (result.reason === "config") {
      return NextResponse.json(
        { error: "La connexion admin n'est pas configurée sur ce serveur (ADMIN_EMAIL / ADMIN_PASSWORD_HASH)." },
        { status: 503 }
      );
    }
    const { remainingAttempts, blocked } = recordLoginFailure(ip);
    return NextResponse.json(
      {
        error: blocked
          ? "Email ou mot de passe incorrect. Trop de tentatives : connexion bloquée pendant 15 minutes."
          : `Email ou mot de passe incorrect. ${remainingAttempts} tentative${remainingAttempts > 1 ? "s" : ""} restante${remainingAttempts > 1 ? "s" : ""}.`,
      },
      { status: 401 }
    );
  }

  resetLoginFailures(ip);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  const login = await recordLogin({ ...identity, ...context, success: true, reason: null, expiresAt });

  const token = await createSessionToken({ ...result.user, name: identity.name, department, loginId: login.id });
  const res = NextResponse.json({ email: result.user.email, name: identity.name, department });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
});

import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "blue_admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 heures

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET n'est pas défini dans .env.local");
  }
  return new TextEncoder().encode(secret);
}

/** Session nominative : identité du compte + nom et département déclarés à la connexion. */
export async function createSessionToken({ id, email, name, department, loginId }) {
  return new SignJWT({ sub: id, email, name, department, lid: loginId || null })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || "Administrateur",
      department: payload.department || "—",
      loginId: payload.lid || null,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
    };
  } catch {
    return null;
  }
}

import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "blue_admin_session";
const SESSION_DURATION = "7d";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET n'est pas défini dans .env.local");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken({ id, email }) {
  return new SignJWT({ sub: id, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Jeton signé (jose + AUTH_SECRET) remis après l'envoi d'une candidature :
// il débloque les boutons-liens « après envoi » via /go/<slug>/<buttonId>.
// Contenu : { slg: slug, sid: submissionId }. Validité : 7 jours.

export const SUBMIT_COOKIE = "blue_rec_submit";
const MAX_AGE = 7 * 24 * 60 * 60;

function key() {
	const secret = process.env.AUTH_SECRET;
	if (!secret) throw new Error("AUTH_SECRET n'est pas défini");
	return new TextEncoder().encode(secret);
}

export async function signSubmitToken(slug, submissionId) {
	return new SignJWT({ slg: slug, sid: submissionId })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(`${MAX_AGE}s`)
		.sign(key());
}

export async function verifySubmitToken(token) {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, key());
		return { slug: payload.slg, submissionId: payload.sid };
	} catch {
		return null;
	}
}

/** Pose le cookie httpOnly avec le jeton (appelé depuis la route de soumission). */
export async function setSubmitCookie(slug, submissionId) {
	const token = await signSubmitToken(slug, submissionId);
	const store = await cookies();
	store.set(SUBMIT_COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: MAX_AGE,
		path: "/",
	});
	return token;
}

export async function readSubmitCookie() {
	const store = await cookies();
	return verifySubmitToken(store.get(SUBMIT_COOKIE)?.value);
}

import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { members } from "@/lib/data";

export const LEARNER_COOKIE = "blue_learner_session";
export const LEARNER_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 jours

function getSecretKey() {
	const secret = process.env.AUTH_SECRET;
	if (!secret) throw new Error("AUTH_SECRET n'est pas défini");
	return new TextEncoder().encode(secret);
}

/** Jeton de session apprenant : membre + version du code (révocation). */
export async function createLearnerToken(member) {
	return new SignJWT({ sub: member.id, kind: member.kind || "member", cv: member.codeVersion || 0 })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(`${LEARNER_MAX_AGE_SECONDS}s`)
		.sign(getSecretKey());
}

async function verifyLearnerToken(token) {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, getSecretKey());
		return { memberId: payload.sub, codeVersion: payload.cv || 0 };
	} catch {
		return null;
	}
}

export async function setLearnerCookie(member) {
	const token = await createLearnerToken(member);
	const store = await cookies();
	store.set(LEARNER_COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: LEARNER_MAX_AGE_SECONDS,
	});
}

export async function clearLearnerCookie() {
	const store = await cookies();
	store.set(LEARNER_COOKIE, "", { path: "/", maxAge: 0 });
}

/**
 * Apprenant connecté ou null. La session est révoquée si le code a été
 * régénéré (codeVersion changé), l'accès désactivé ou le membre supprimé.
 * Retourne le membre enrichi : { ...member, access: [courseId…] }.
 */
export async function getLearner() {
	const store = await cookies();
	const verified = await verifyLearnerToken(store.get(LEARNER_COOKIE)?.value);
	if (!verified) return null;
	const member = await members.get(verified.memberId);
	if (!member || member.accessDisabled || (member.codeVersion || 0) !== verified.codeVersion) return null;
	const access = await members.listAccess(member.id);
	return { ...member, access };
}

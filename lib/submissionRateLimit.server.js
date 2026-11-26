import "server-only";

// Anti-spam des candidatures : 5 envois maximum par heure et par IP.
// Stockage en mémoire du processus (même approche que loginRateLimit) :
// suffisant sur un serveur unique ; sur Vercel la limite s'applique par
// instance (à déplacer en base en phase 7 si besoin).

const WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

const attempts = (globalThis.__blueRecSubmissions ??= new Map());

/** @returns {{ allowed: boolean, retryAfterSeconds?: number }} */
export function checkSubmissionAllowed(ip) {
	const now = Date.now();
	const list = (attempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
	attempts.set(ip, list);
	if (list.length >= MAX_SUBMISSIONS) {
		const oldest = list[0];
		return { allowed: false, retryAfterSeconds: Math.ceil((oldest + WINDOW_MS - now) / 1000) };
	}
	return { allowed: true };
}

export function recordSubmission(ip) {
	const now = Date.now();
	const list = (attempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
	list.push(now);
	attempts.set(ip, list);
}

import "server-only";

// Limite les tentatives de connexion apprenant : 5 échecs en 15 minutes,
// comptés par couple (IP, identifiant). Stockage en mémoire du processus,
// comme lib/loginRateLimit.server.js.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const attempts = (globalThis.__blueLearnerAttempts ??= new Map());

const keyOf = (ip, identifier) => `${ip}|${String(identifier || "").toLowerCase()}`;

function entry(ip, identifier) {
	const now = Date.now();
	const key = keyOf(ip, identifier);
	const e = attempts.get(key) || { failures: [], blockedUntil: 0 };
	e.failures = e.failures.filter((t) => now - t < WINDOW_MS);
	attempts.set(key, e);
	return e;
}

export function checkLearnerLoginAllowed(ip, identifier) {
	const e = entry(ip, identifier);
	const remaining = e.blockedUntil - Date.now();
	if (remaining > 0) return { allowed: false, retryAfterSeconds: Math.ceil(remaining / 1000) };
	return { allowed: true };
}

export function recordLearnerLoginFailure(ip, identifier) {
	const e = entry(ip, identifier);
	e.failures.push(Date.now());
	if (e.failures.length >= MAX_FAILURES) {
		e.blockedUntil = Date.now() + WINDOW_MS;
		e.failures = [];
	}
	return { blocked: e.blockedUntil > Date.now() };
}

export function resetLearnerLoginFailures(ip, identifier) {
	attempts.delete(keyOf(ip, identifier));
}

import "server-only";

// Limite les tentatives de connexion admin : 5 échecs en 15 minutes par IP,
// puis blocage de 15 minutes. Stockage en mémoire du processus : suffisant
// en local et sur un serveur unique ; sur Vercel (plusieurs instances), la
// limite s'applique par instance (à déplacer en base en phase 7 si besoin).

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const attempts = (globalThis.__blueLoginAttempts ??= new Map());

function entry(ip) {
  const now = Date.now();
  const e = attempts.get(ip) || { failures: [], blockedUntil: 0 };
  e.failures = e.failures.filter((t) => now - t < WINDOW_MS);
  attempts.set(ip, e);
  return e;
}

/** @returns {{ allowed: true } | { allowed: false, retryAfterSeconds: number }} */
export function checkLoginAllowed(ip) {
  const e = entry(ip);
  const remaining = e.blockedUntil - Date.now();
  if (remaining > 0) return { allowed: false, retryAfterSeconds: Math.ceil(remaining / 1000) };
  return { allowed: true };
}

export function recordLoginFailure(ip) {
  const e = entry(ip);
  e.failures.push(Date.now());
  if (e.failures.length >= MAX_FAILURES) {
    e.blockedUntil = Date.now() + WINDOW_MS;
    e.failures = [];
  }
  return { remainingAttempts: Math.max(MAX_FAILURES - e.failures.length, 0), blocked: e.blockedUntil > Date.now() };
}

export function resetLoginFailures(ip) {
  attempts.delete(ip);
}

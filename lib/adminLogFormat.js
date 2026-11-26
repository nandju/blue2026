// Mise en forme des entrées du journal (affichage et export CSV).

const TZ = "Africa/Abidjan";

export function formatLogDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatLogTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Fin de session lisible : déconnexion, expiration ou session active. */
export function sessionEnd(login, now = Date.now()) {
  if (!login.success) return "—";
  if (login.logoutAt) return `Déconnexion le ${formatLogDate(login.logoutAt)} à ${formatLogTime(login.logoutAt)}`;
  if (login.expiresAt && new Date(login.expiresAt).getTime() <= now) {
    return `Expirée le ${formatLogDate(login.expiresAt)} à ${formatLogTime(login.expiresAt)}`;
  }
  return login.expiresAt ? `Active (expire à ${formatLogTime(login.expiresAt)})` : "Active";
}

export const changesToText = (changes = []) => changes.map((c) => `${c.field} : ${c.from} → ${c.to}`).join(" | ");

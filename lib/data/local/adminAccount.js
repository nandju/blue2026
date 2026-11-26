import "server-only";
import bcrypt from "bcryptjs";

// Compte administrateur unique défini par les variables d'environnement
// ADMIN_EMAIL et ADMIN_PASSWORD_HASH (hash bcrypt généré par `pnpm hash:password`).

const BCRYPT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
// Hash factice : on compare quand même pour ne pas révéler par le temps de
// réponse si l'email existe.
const DUMMY_HASH = "$2b$12$6dtgjSBtpsaPLqUwovK.fO2.qZ5AhiPxVDJmUmcCO7aEK3JhcZbvG";

export const adminAccount = {
  /** @returns {{ ok: true, user: { id, email } } | { ok: false, reason: "config" | "email" | "password" }} */
  async verify(email, password) {
    const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const hash = (process.env.ADMIN_PASSWORD_HASH || "").trim();

    if (!expectedEmail || !BCRYPT_RE.test(hash)) {
      console.error(
        !expectedEmail
          ? "[auth] ADMIN_EMAIL n'est pas défini."
          : "[auth] ADMIN_PASSWORD_HASH absent ou mal formé. Dans .env.local, échappez chaque « $ » en « \\$ » (voir `pnpm hash:password`)."
      );
      return { ok: false, reason: "config" };
    }

    const emailOk = String(email || "").trim().toLowerCase() === expectedEmail;
    const passwordOk = await bcrypt.compare(String(password || ""), emailOk ? hash : DUMMY_HASH);
    if (!emailOk) return { ok: false, reason: "email" };
    if (!passwordOk) return { ok: false, reason: "password" };
    return { ok: true, user: { id: "admin", email: expectedEmail } };
  },
};

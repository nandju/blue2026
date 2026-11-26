// Modèle partagé « Bénévole du mois » (client + serveur).
// Normalise les anciens enregistrements (champ `active`) vers le schéma v2
// et calcule l'état effectif de la notification côté serveur.

export const VOTM_FREQUENCIES = ["session", "day", "always"];

export const VOTM_DEFAULT_TEXTS = {
  badge: "BÉNÉVOLE DU MOIS",
  bannerText: "Découvrez notre Bénévole du Mois : {prénom} {nom}",
  popupButton: "Continuer sur BLUE",
  bannerButton: "Voir le profil",
};

const NOTIFY_DEFAULTS = {
  published: false,
  notifyEnabled: false,
  showPopup: true,
  showBanner: false,
  showPetals: true,
  notifyFrom: null,
  notifyUntil: null,
  popupDelayMs: 1800,
  frequency: "session",
  notifyVersion: 1,
};

const toNull = (v) => (v === "" || v === undefined ? null : v);

/** Normalise un enregistrement (ancien format `active` inclus) vers le schéma v2. */
export function normalizeVolunteer(v) {
  if (!v) return null;
  const legacyActive = !!v.active;
  const texts = v.texts && typeof v.texts === "object" ? v.texts : {};
  let month = toNull(v.month);
  if (!month && v.period) {
    const d = new Date(v.period);
    if (!Number.isNaN(d.getTime())) month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  return {
    id: v.id,
    firstName: v.firstName || "",
    lastName: v.lastName || "",
    location: toNull(v.location),
    photo: toNull(v.photo),
    actions: toNull(v.actions),
    contribution: toNull(v.contribution),
    month,
    published: v.published ?? legacyActive,
    notifyEnabled: v.notifyEnabled ?? legacyActive,
    showPopup: v.showPopup ?? true,
    // L'ancien bénévole affichait la bannière après fermeture de la popup :
    // le canal bannière reste activé pour conserver ce comportement.
    showBanner: v.showBanner ?? true,
    showPetals: v.showPetals ?? true,
    notifyFrom: toNull(v.notifyFrom),
    notifyUntil: toNull(v.notifyUntil),
    popupDelayMs: Number.isFinite(+v.popupDelayMs) ? +v.popupDelayMs : 1800,
    frequency: VOTM_FREQUENCIES.includes(v.frequency) ? v.frequency : "session",
    notifyVersion: Number.isFinite(+v.notifyVersion) ? Math.max(1, +v.notifyVersion) : 1,
    texts: {
      badge: toNull(texts.badge),
      bannerText: toNull(texts.bannerText),
      popupButton: toNull(texts.popupButton),
      bannerButton: toNull(texts.bannerButton),
    },
    createdAt: v.createdAt || null,
    updatedAt: v.updatedAt || null,
    updatedBy: v.updatedBy || null,
  };
}

const inWindow = (from, until, now) =>
  (!from || new Date(from) <= now) && (!until || new Date(until) >= now);

/**
 * État effectif de la notification, calculé côté serveur.
 * Renvoie null si rien ne doit s'afficher automatiquement.
 */
export function notifyState(v, now = new Date()) {
  if (!v || !v.published || !v.notifyEnabled) return null;
  if (!inWindow(v.notifyFrom, v.notifyUntil, now)) return null;
  if (!v.showPopup && !v.showBanner && !v.showPetals) return null;
  return {
    popup: !!v.showPopup,
    banner: !!v.showBanner,
    petals: !!v.showPetals,
    delayMs: v.popupDelayMs,
    frequency: v.frequency,
    key: votmStorageKey(v),
    until: v.notifyUntil || null,
  };
}

/** Clé de stockage navigateur : change à chaque « republication ». */
export const votmStorageKey = (v) => `blue_votm_${v.id}_v${v.notifyVersion || 1}`;

/** Textes effectifs (valeur personnalisée ou défaut ; {prénom}/{nom}/{name} remplacés). */
export function votmTexts(v) {
  const t = v?.texts || {};
  const fill = (s) =>
    (s || "")
      .replace(/\{pr[ée]nom\}/gi, v?.firstName || "")
      .replace(/\{nom\}/gi, v?.lastName || "")
      .replace(/\{name\}/gi, `${v?.firstName || ""} ${v?.lastName || ""}`.trim());
  return {
    badge: t.badge || VOTM_DEFAULT_TEXTS.badge,
    bannerText: fill(t.bannerText || VOTM_DEFAULT_TEXTS.bannerText),
    popupButton: t.popupButton || VOTM_DEFAULT_TEXTS.popupButton,
    bannerButton: t.bannerButton || VOTM_DEFAULT_TEXTS.bannerButton,
  };
}

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** "2024-01" → "janvier 2024". */
export function monthLabel(month) {
  const m = /^(\d{4})-(\d{2})$/.exec(month || "");
  if (!m) return month || "—";
  return `${MONTHS_FR[+m[2] - 1]} ${m[1]}`;
}

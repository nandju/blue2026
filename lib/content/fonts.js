// Polices proposées dans /admin/webmaster (partagé client/serveur).
// Seules les 2 familles choisies sont chargées, via une feuille Google Fonts
// générée par le layout racine.

export const DEFAULT_FONTS = { heading: "outfit", body: "outfit" };

export const FONT_OPTIONS = [
  { id: "outfit", label: "Outfit", family: "Outfit", stack: "'Outfit', sans-serif" },
  { id: "poppins", label: "Poppins", family: "Poppins", stack: "'Poppins', sans-serif" },
  { id: "montserrat", label: "Montserrat", family: "Montserrat", stack: "'Montserrat', sans-serif" },
  { id: "inter", label: "Inter", family: "Inter", stack: "'Inter', sans-serif" },
  { id: "nunito", label: "Nunito", family: "Nunito", stack: "'Nunito', sans-serif" },
  { id: "raleway", label: "Raleway", family: "Raleway", stack: "'Raleway', sans-serif" },
  { id: "lato", label: "Lato", family: "Lato", stack: "'Lato', sans-serif" },
  { id: "open-sans", label: "Open Sans", family: "Open Sans", stack: "'Open Sans', sans-serif" },
  { id: "playfair-display", label: "Playfair Display", family: "Playfair Display", stack: "'Playfair Display', serif" },
  { id: "dm-sans", label: "DM Sans", family: "DM Sans", stack: "'DM Sans', sans-serif" },
];

export const FONT_IDS = FONT_OPTIONS.map((f) => f.id);
export const fontById = (id) => FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS[0];

/** Normalise la sélection (ids inconnus → Outfit). */
export function normalizeFonts(value = {}) {
  return {
    heading: FONT_IDS.includes(value?.heading) ? value.heading : DEFAULT_FONTS.heading,
    body: FONT_IDS.includes(value?.body) ? value.body : DEFAULT_FONTS.body,
  };
}

/** URL de la feuille Google Fonts pour la paire choisie. */
export function googleFontsUrl(value = {}) {
  const { heading, body } = normalizeFonts(value);
  const fam = (id) => `${fontById(id).family.replace(/ /g, "+")}:wght@300;400;500;600;700;800`;
  const families = heading === body ? [fam(heading)] : [fam(heading), fam(body)];
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}

/** Déclarations CSS pour --font-heading et --font-body. */
export function fontCssVars(value = {}) {
  const { heading, body } = normalizeFonts(value);
  return `--font-heading:${fontById(heading).stack};--font-body:${fontById(body).stack}`;
}

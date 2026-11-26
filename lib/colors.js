// Palette du site et utilitaires couleur (partagés client/serveur).
// Les couleurs principales sont modifiables dans /admin/webmaster ; les tons
// dérivés (navy, primary-dark) sont calculés à partir des 3 couleurs de base.

export const DEFAULT_COLORS = {
  primary: "#0D6EBB",
  secondary: "#0DBD9F",
  dark: "#073A63",
};

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

/** Assombrit une couleur hex de `amount` % (0-100). */
export function darken(hex, amount) {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const f = 1 - amount / 100;
  return rgbToHex({ r: c.r * f, g: c.g * f, b: c.b * f });
}

/** Éclaircit une couleur hex de `amount` % (0-100). */
export function lighten(hex, amount) {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const f = amount / 100;
  return rgbToHex({ r: c.r + (255 - c.r) * f, g: c.g + (255 - c.g) * f, b: c.b + (255 - c.b) * f });
}

export const isValidHex = (v) => /^#[0-9a-fA-F]{6}$/.test(String(v || "").trim());

/** Palette complète dérivée des 3 couleurs éditables. */
export function paletteFrom(colors = {}) {
  const primary = isValidHex(colors.primary) ? colors.primary.toUpperCase() : DEFAULT_COLORS.primary;
  const secondary = isValidHex(colors.secondary) ? colors.secondary.toUpperCase() : DEFAULT_COLORS.secondary;
  const dark = isValidHex(colors.dark) ? colors.dark.toUpperCase() : DEFAULT_COLORS.dark;
  // #073A63 -15% ≈ #062E52 · #0D6EBB -15% ≈ #0A5A9A (tons actuels conservés par défaut)
  const navy = darken(dark, 15);
  const primaryDark = darken(primary, 15);
  const rgb = (hex) => {
    const c = hexToRgb(hex);
    return `${c.r} ${c.g} ${c.b}`;
  };
  return {
    primary,
    secondary,
    dark,
    navy,
    primaryDark,
    rgb: {
      primary: rgb(primary),
      secondary: rgb(secondary),
      dark: rgb(dark),
      navy: rgb(navy),
      primaryDark: rgb(primaryDark),
    },
  };
}

/** Bloc CSS `:root { --color-… }` injecté par le layout racine. */
export function paletteCssVars(colors = {}) {
  const p = paletteFrom(colors);
  return `:root{--color-primary:${p.primary};--color-primary-rgb:${p.rgb.primary};--color-secondary:${p.secondary};--color-secondary-rgb:${p.rgb.secondary};--color-dark:${p.dark};--color-dark-rgb:${p.rgb.dark};--color-navy:${p.navy};--color-navy-rgb:${p.rgb.navy};--color-primary-dark:${p.primaryDark};--color-primary-dark-rgb:${p.rgb.primaryDark}}`;
}

/** Luminance relative WCAG (0-1). */
export function luminance(hex) {
  const c = hexToRgb(hex);
  if (!c) return 0;
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

/** Ratio de contraste WCAG entre deux couleurs hex (1-21). */
export function contrastRatio(hexA, hexB) {
  const [l1, l2] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** true si du texte blanc est suffisamment lisible sur cette couleur (≥ 4,5). */
export const whiteTextReadable = (hex) => contrastRatio("#FFFFFF", hex) >= 4.5;

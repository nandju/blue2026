import "server-only";
import { unstable_cache } from "next/cache";
import { content, settings, projects } from "@/lib/data";
import { mergeAllContent } from "./merge";
import { normalizeFonts } from "./fonts";
import { paletteFrom } from "@/lib/colors";
import { DEFAULT_SETTINGS } from "@/lib/data/defaults";

// Toute lecture du site passe par ce module, mis en cache et invalidé par
// revalidateTag("site-content") à chaque enregistrement dans l'admin.

const SETTING_KEYS = ["identity", "contact", "socials", "fonts", "colors"];

function mergeSetting(entries, key) {
  const entry = entries?.[key];
  const def = DEFAULT_SETTINGS[key];
  if (!entry || entry.isDefault || entry.value == null) return def;
  if (key === "fonts") return normalizeFonts(entry.value);
  if (key === "colors") {
    const p = paletteFrom(entry.value);
    return { primary: p.primary, secondary: p.secondary, dark: p.dark };
  }
  return { ...def, ...entry.value };
}

async function loadSiteData() {
  let contentEntries = {};
  let settingsEntries = {};
  try {
    contentEntries = await content.getAll();
  } catch (e) {
    console.error("[content] Lecture impossible, valeurs par défaut utilisées :", e.message);
  }
  try {
    settingsEntries = await settings.getAll();
  } catch (e) {
    console.error("[settings] Lecture impossible, valeurs par défaut utilisées :", e.message);
  }

  const siteSettings = {};
  for (const key of SETTING_KEYS) siteSettings[key] = mergeSetting(settingsEntries, key);

  return {
    content: mergeAllContent(contentEntries),
    settings: siteSettings,
  };
}

export const getSiteData = unstable_cache(loadSiteData, ["blue-site-data"], {
  tags: ["site-content"],
});

async function loadProjects() {
  try {
    const list = await projects.list();
    return [...list]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((p, i) => ({ ...p, position: i }));
  } catch (e) {
    console.error("[projects] Lecture impossible :", e.message);
    return [];
  }
}

/** Tous les projets (admin : y compris masqués), triés par position. */
export const getAllProjects = unstable_cache(loadProjects, ["blue-projects-all"], {
  tags: ["site-content"],
});

/** Projets visibles pour le site public. */
export async function getPublicProjects() {
  return (await getAllProjects()).filter((p) => p.show !== false);
}

/** Un projet par slug (ou null). */
export async function getProjectBySlug(slug) {
  return (await getAllProjects()).find((p) => p.slug === slug || p.id === slug) || null;
}

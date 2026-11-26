import "server-only";
import { settings } from "@/lib/data";
import { DEFAULT_SETTINGS, OTHER_DEPARTMENT } from "@/lib/data/defaults";

/**
 * Réglage avec repli sur la valeur par défaut. Ne lève jamais d'erreur :
 * en cas de problème de lecture, la valeur par défaut est renvoyée.
 * @returns {{ value, isDefault, updatedAt, updatedBy }}
 */
export async function getSetting(key) {
  const fallback = { value: DEFAULT_SETTINGS[key], isDefault: true, updatedAt: null, updatedBy: null };
  try {
    const entry = await settings.get(key);
    if (!entry) return fallback;
    if (entry.isDefault || entry.value == null) return { ...fallback, updatedAt: entry.updatedAt, updatedBy: entry.updatedBy };
    return entry;
  } catch (e) {
    console.error(`[settings] Lecture de « ${key} » impossible :`, e.message);
    return fallback;
  }
}

/** Liste des départements proposés à la connexion ("Autre" toujours en dernier). */
export async function getDepartments() {
  const { value } = await getSetting("departments");
  const list = (Array.isArray(value) && value.length ? value : DEFAULT_SETTINGS.departments).filter(
    (d) => d !== OTHER_DEPARTMENT
  );
  return [...list, OTHER_DEPARTMENT];
}

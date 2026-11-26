// Fusion entre les valeurs par défaut et les personnalisations stockées.
// Partagé client/serveur.
//
// Règles (dépendantes du type de champ du schéma) :
//   - valeur absente / null          → valeur par défaut
//   - texte vide ("")                → valeur par défaut (« champ vidé »)
//   - image / vidéo = ""             → média retiré volontairement
//   - liste ou galerie vide          → valeurs par défaut
//   - liste non vide                 → remplace entièrement la liste par défaut

import { sectionSchema } from "./schemas";

const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
const isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);

function setPath(obj, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] = o[k] ?? {}), obj);
  target[last] = value;
}

function mergeField(field, defValue, overValue) {
  if (overValue === undefined || overValue === null) return defValue;
  switch (field.type) {
    case "image":
    case "video":
      return overValue; // "" = média retiré
    case "gallery":
    case "list":
    case "stringlist":
      return Array.isArray(overValue) && overValue.length ? overValue : defValue;
    case "link":
      return typeof overValue === "object" && overValue
        ? { label: overValue.label ?? defValue?.label ?? "", href: overValue.href ?? defValue?.href ?? "" }
        : defValue;
    case "icon":
    case "select":
      return overValue === "" ? defValue : overValue;
    default:
      return typeof overValue === "string" && overValue.trim() === "" ? defValue : overValue;
  }
}

/**
 * Fusionne une section : schéma + défauts + personnalisations (clés plates ou
 * imbriquées selon field.path). Renvoie l'objet complet de la section.
 */
export function mergeSection(pageId, sectionId, overrides = {}) {
  const schema = sectionSchema(pageId, sectionId);
  const defaults = defaultSection(pageId, sectionId);
  // Sections sans schéma (ex. home.layout : ordre/masquage) : fusion directe.
  if (!schema) {
    const hasOverrides = overrides && Object.keys(overrides).length > 0;
    if (!hasOverrides) return defaults ?? {};
    if (isObj(defaults) && isObj(overrides)) return { ...defaults, ...overrides };
    return overrides;
  }
  const out = {};
  for (const field of schema.fields) {
    const path = field.path || field.key;
    setPath(out, path, mergeField(field, getPath(defaults, path), getPath(overrides, path)));
  }
  // Clés de personnalisation non décrites par le schéma (ex. ordre/masquage) :
  // conservées telles quelles pour ne rien perdre.
  for (const [k, v] of Object.entries(overrides || {})) {
    if (!schema.fields.some((f) => (f.path || f.key) === k)) out[k] = v;
  }
  return out;
}

import { DEFAULT_CONTENT } from "./defaults";

/** Valeurs par défaut d'une section. */
export function defaultSection(pageId, sectionId) {
  return DEFAULT_CONTENT?.[pageId]?.[sectionId] ?? {};
}

/**
 * Construit le contenu complet d'une page : défauts + personnalisations.
 * `entries` : { "home.hero": { value, ... }, ... } (clés = "page.section").
 */
export function mergePage(pageId, entries = {}) {
  const defaults = DEFAULT_CONTENT[pageId] || {};
  const page = {};
  for (const sectionId of Object.keys(defaults)) {
    const key = `${pageId}.${sectionId}`;
    const entry = entries[key];
    const overrides = entry && !entry.isDefault ? entry.value : null;
    page[sectionId] = mergeSection(pageId, sectionId, overrides || {});
  }
  return page;
}

/** Arbre complet { pageId: { sectionId: {...} } } pour tout le site. */
export function mergeAllContent(entries = {}) {
  const out = {};
  for (const pageId of Object.keys(DEFAULT_CONTENT)) out[pageId] = mergePage(pageId, entries);
  return out;
}

/** Accès par chemin "home.hero.title" dans un arbre déjà fusionné. */
export const contentAt = (tree, path) =>
  String(path || "").split(".").reduce((o, k) => (o == null ? o : o[k]), tree);

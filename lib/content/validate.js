// Validation serveur (zod) des personnalisations de contenu, construite à
// partir des schémas de sections. Partagé avec le client pour les mêmes règles.
import { z } from "zod";
import { sectionSchema } from "./schemas";
import { ICON_KEYS } from "./icons";
import { BadRequestError } from "@/lib/data/errors";

z.config(z.locales.fr());

// URL acceptée : "", chemin local, ancre, http(s), mailto, tel.
const urlLike = (label = "Le lien", max = 600) =>
  z
    .string({ error: `${label} : valeur invalide` })
    .trim()
    .max(max, `${label} : ${max} caractères maximum`)
    .refine(
      (v) => v === "" || /^\/[^/\\]|^\/$/.test(v) || /^#/.test(v) || /^https?:\/\//.test(v) || /^mailto:/.test(v) || /^tel:/.test(v),
      `${label} : adresse invalide (chemin du site, https://, mailto: ou tel: attendu)`
    );

const str = (label, max = 300, required = false) => {
  let s = z.string({ error: `${label} : valeur invalide` }).trim().max(max, `${label} : ${max} caractères maximum`);
  if (required) s = s.min(1, `${label} est obligatoire`);
  return s;
};

function fieldZod(field) {
  const label = field.label || field.key;
  switch (field.type) {
    case "text":
      return str(label, field.max || 300, field.required);
    case "textarea":
      return str(label, field.max || 4000);
    case "icon":
      return z.enum(ICON_KEYS, { error: `${label} : icône inconnue` });
    case "select":
      return z.enum((field.options || []).map((o) => o.value), { error: `${label} : valeur invalide` });
    case "image":
      return urlLike(label, 600);
    case "video":
      return urlLike(label, 600);
    case "link":
      return z.object({
        label: str(`${label} — libellé`, 120),
        href: urlLike(`${label} — lien`, 500),
      });
    case "gallery":
      return z
        .array(
          z.object({
            url: urlLike("Image", 600).refine((v) => v !== "", "Image manquante"),
            alt: str("Texte alternatif", 300),
            caption: str("Légende", 300),
          })
        )
        .max(field.max || 30, `${label} : ${field.max || 30} images maximum`);
    case "list":
      return z
        .array(
          z.object(
            Object.fromEntries((field.itemFields || []).map((f) => [f.key, fieldZod(f).optional().nullable()]))
          )
        )
        .max(field.max || 30, `${label} : ${field.max || 30} éléments maximum`);
    case "stringlist":
      return z.array(str(label, field.textarea ? 4000 : 300)).max(field.max || 30, `${label} : ${field.max || 30} éléments maximum`);
    default:
      return z.any();
  }
}

const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
const setPath = (obj, path, v) => {
  const keys = path.split(".");
  const last = keys.pop();
  keys.reduce((o, k) => (o[k] = o[k] ?? {}), obj)[last] = v;
};

/**
 * Valide et nettoie les personnalisations d'une section.
 * Renvoie l'objet d'overrides nettoyé (clés inconnues ignorées, null conservés).
 * Lève un ZodError en cas d'invalidité.
 */
export function validateSectionOverrides(pageId, sectionId, raw) {
  const schema = sectionSchema(pageId, sectionId);
  if (!schema) throw new BadRequestError("Section inconnue.");
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new BadRequestError("Valeur de section invalide.");
  }
  const out = {};
  const issues = [];
  for (const field of schema.fields) {
    const path = field.path || field.key;
    const value = getPath(raw, path);
    if (value === undefined || value === null) continue;
    const res = fieldZod(field).safeParse(value);
    if (!res.success) {
      for (const i of res.error.issues) issues.push({ ...i, path: [path, ...i.path] });
    } else {
      setPath(out, path, res.data);
    }
  }
  if (issues.length) throw new z.ZodError(issues);
  return out;
}

/** Schéma zod du corps PUT /api/admin/content. */
export const contentPutSchema = z.object({
  page: z.string().trim().min(1).max(40).regex(/^[a-zA-Z]+$/, "Page invalide"),
  section: z.string().trim().min(1).max(60).regex(/^[a-zA-Z]+$/, "Section invalide"),
  value: z.record(z.string(), z.any()).nullable(),
});

/** Layout de l'accueil : { order: string[], hidden: string[] }. */
export const homeLayoutSchema = z.object({
  order: z.array(z.string().trim().min(1).max(40)).max(30),
  hidden: z.array(z.string().trim().min(1).max(40)).max(30),
});

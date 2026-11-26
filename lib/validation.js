import { z } from "zod";
import { MEDIA_FOLDER_VALUES, MEDIA_TYPES } from "@/lib/uploadLimits";

// Schémas de validation serveur (zod). Messages en français.
z.config(z.locales.fr());

const text = (label, max, { min = 0 } = {}) => {
  let s = z.string({ error: `${label} : valeur invalide` }).trim().max(max, `${label} : ${max} caractères maximum`);
  if (min > 0) s = s.min(min, min === 1 ? `${label} est obligatoire` : `${label} : ${min} caractères minimum`);
  return s;
};
const optionalText = (label, max) => text(label, max).optional().nullable();
const email = z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide")).pipe(z.string().max(160));

// ─── Authentification ─────────────────────────────────────────────────────
export const loginSchema = z
  .object({
    name: text("Le nom et prénom", 80, { min: 2 }),
    department: text("Le département", 80, { min: 1 }),
    departmentOther: optionalText("Le département", 80),
    email: email,
    password: z.string().min(1, "Le mot de passe est obligatoire").max(200),
  })
  .superRefine((v, ctx) => {
    if (v.department === "Autre" && !v.departmentOther?.trim()) {
      ctx.addIssue({ code: "custom", path: ["departmentOther"], message: "Précisez votre département" });
    }
  });

// ─── Blue Academy (routes publiques) ─────────────────────────────────────
const courseId = text("La formation", 100, { min: 1 });

export const registrationSchema = z.object({
  courseId,
  lastName: text("Le nom", 80, { min: 1 }),
  firstName: text("Le prénom", 80, { min: 1 }),
  age: z.coerce.number({ error: "Âge invalide" }).int("Âge invalide").min(5, "Âge invalide").max(120, "Âge invalide"),
  organization: optionalText("L'organisation", 120),
  whatsapp: text("Le numéro WhatsApp", 30, { min: 6 }),
  email,
});

export const quizResultSchema = z.object({
  courseId,
  email,
  // Réponses : index de l'option choisie, par numéro de question.
  answers: z.record(z.string().regex(/^\d+$/), z.number().int().min(0).max(20)),
});

export const certificateRequestSchema = z.object({
  courseId,
  courseTitle: optionalText("Le titre de la formation", 200),
  email,
  firstName: text("Le prénom", 80, { min: 1 }),
  lastName: text("Le nom", 80, { min: 1 }),
  score: z.coerce.number().optional(),
  paymentInfo: optionalText("Les informations complémentaires", 1000),
});

// ─── MR BLUE (routes publiques) ──────────────────────────────────────────
export const chatUserSchema = z.object({
  sessionId: text("La session", 100, { min: 1 }),
  lastName: optionalText("Le nom", 80),
  firstName: optionalText("Le prénom", 80),
  age: z.union([z.string().trim().max(10), z.number()]).optional().nullable().transform((v) => (v == null ? null : String(v))),
  location: optionalText("La localité", 120),
  job: optionalText("La profession", 120),
  isMember: z.boolean().optional().default(false),
  motivation: optionalText("La motivation", 1000),
});

export const chatMessageSchema = z.object({
  userMessage: text("Le message", 4000, { min: 1 }),
  aiResponse: text("La réponse", 8000, { min: 1 }),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1, "Aucun message")
    .max(40, "Conversation trop longue"),
  userInfo: z
    .object({
      lastName: optionalText("Le nom", 80),
      firstName: optionalText("Le prénom", 80),
      age: z.union([z.string().max(10), z.number()]).optional().nullable(),
      location: optionalText("La localité", 120),
      job: optionalText("La profession", 120),
      motivation: optionalText("La motivation", 1000),
      isMember: z.boolean().optional(),
    })
    .optional()
    .nullable(),
});

// ─── Admin : formations ──────────────────────────────────────────────────
const sectionSchema = z.object({ title: text("Titre de section", 200), content: text("Contenu de section", 20000) });
const resourceSchema = z.object({ name: text("Nom de la ressource", 200, { min: 1 }), url: text("Lien de la ressource", 500, { min: 1 }) });
const questionSchema = z
  .object({
    question: text("Question", 500, { min: 1 }),
    options: z.array(text("Option", 300, { min: 1 })).min(2, "Au moins 2 options par question").max(8),
    answer: z.number().int().min(0),
  })
  .refine((q) => q.answer < q.options.length, { message: "La bonne réponse doit correspondre à une option", path: ["answer"] });

const courseFields = {
  title: text("Le titre", 200, { min: 1 }),
  description: text("La description", 2000),
  category: text("La catégorie", 50),
  level: text("Le niveau", 50),
  duration: text("La durée", 50),
  video: text("La vidéo", 500),
  sections: z.array(sectionSchema).max(100),
  resources: z.array(resourceSchema).max(50),
  quiz: z.array(questionSchema).max(100),
  enrolled: z.number().int().min(0),
};

export const courseCreateSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,79}$/, "Identifiant invalide (minuscules, chiffres et tirets)"),
  ...courseFields,
  description: courseFields.description.default(""),
  category: courseFields.category.default("environnement"),
  level: courseFields.level.default("Débutant"),
  duration: courseFields.duration.default(""),
  video: courseFields.video.default(""),
  sections: courseFields.sections.default([]),
  resources: courseFields.resources.default([]),
  quiz: courseFields.quiz.default([]),
  enrolled: courseFields.enrolled.default(0),
});

export const courseUpdateSchema = z.object(courseFields).partial();

export const certificateStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"], { error: "Statut invalide" }),
});

// ─── Admin : bénévole du mois ────────────────────────────────────────────
export const volunteerSchema = z.object({
  firstName: text("Le prénom", 80, { min: 1 }),
  lastName: text("Le nom", 80, { min: 1 }),
  location: optionalText("La localisation", 120),
  photo: optionalText("La photo", 500),
  actions: optionalText("Les actions réalisées", 2000),
  contribution: optionalText("La contribution", 2000),
  active: z.boolean().optional().default(true),
});

// ─── Admin : réglages ────────────────────────────────────────────────────
export const departmentsSchema = z.object({
  // null = rétablir la liste par défaut
  departments: z
    .array(text("Département", 60, { min: 1 }))
    .max(30, "30 départements maximum")
    .refine((l) => new Set(l.map((d) => d.toLowerCase())).size === l.length, "Chaque département doit être unique")
    .refine((l) => !l.some((d) => d.toLowerCase() === "autre"), "« Autre » est ajouté automatiquement")
    .nullable(),
});

const urlOrEmpty = (label, max = 500) =>
  text(label, max).refine(
    (v) => v === "" || /^\//.test(v) || /^https?:\/\//.test(v) || /^mailto:/.test(v) || /^tel:/.test(v) || /^#/.test(v),
    `${label} : adresse invalide`
  );

const hexColor = (label) =>
  text(label, 20).refine((v) => /^#[0-9a-fA-F]{6}$/.test(v), `${label} : couleur hexadécimale attendue (ex. #0D6EBB)`);

export const SETTING_SCHEMAS = {
  identity: z.object({
    name: text("Le nom du site", 60, { min: 1 }),
    slogan: optionalText("Le slogan", 160),
    logo: urlOrEmpty("Le logo"),
    favicon: urlOrEmpty("Le favicon"),
  }),
  contact: z.object({
    phones: z.array(text("Téléphone", 40, { min: 1 })).max(6, "6 numéros maximum"),
    email: z.union([z.literal(""), email]),
    address: optionalText("L'adresse", 200),
  }),
  socials: z.object({
    facebook: urlOrEmpty("Facebook"),
    instagram: urlOrEmpty("Instagram"),
    linkedin: urlOrEmpty("LinkedIn"),
    whatsapp: urlOrEmpty("WhatsApp"),
    tiktok: urlOrEmpty("TikTok"),
    youtube: urlOrEmpty("YouTube"),
  }),
  fonts: z.object({
    heading: z.string().trim().min(1, "Police des titres obligatoire").max(40),
    body: z.string().trim().min(1, "Police du texte obligatoire").max(40),
  }),
  colors: z.object({
    primary: hexColor("La couleur principale"),
    secondary: hexColor("La couleur secondaire"),
    dark: hexColor("La couleur foncée"),
  }),
};

export const settingPutSchema = z.object({
  key: z.enum(Object.keys(SETTING_SCHEMAS), { error: "Réglage inconnu" }),
  value: z.any().nullable(), // null = rétablir par défaut
});

// ─── Admin : projets / actions ───────────────────────────────────────────
const projectImageSchema = z.object({
  url: text("L'image", 600, { min: 1 }),
  alt: optionalText("Le texte alternatif", 300),
  caption: optionalText("La légende", 300),
});

export const projectCreateSchema = z.object({
  title: text("Le titre", 160, { min: 1 }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,79}$/, "Slug invalide (minuscules, chiffres et tirets)"),
  year: text("L'année", 20),
  desc: z.array(text("Paragraphe", 4000, { min: 1 })).min(1, "Au moins un paragraphe").max(20),
  tech: z.array(text("Domaine", 60, { min: 1 })).max(12, "12 domaines maximum"),
  category: z.array(z.number().int().min(0).max(99)).min(1, "Choisissez au moins une catégorie").max(6),
  thumbnail: optionalText("La miniature", 600),
  images: z.array(projectImageSchema).max(30, "30 images maximum"),
  show: z.boolean().default(true),
  preview: optionalText("Lien de prévisualisation", 500),
  code: optionalText("Lien du code", 500),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const projectsOrderSchema = z.object({
  order: z.array(z.string().trim().min(1).max(100)).min(1, "Ordre vide").max(200),
});

// ─── Admin : médias ──────────────────────────────────────────────────────
export const mediaTypeSchema = z.enum(MEDIA_TYPES, { error: "Type de média invalide" });
export const mediaFolderSchema = z.enum(MEDIA_FOLDER_VALUES, { error: "Dossier invalide" });

export const uploadTargetSchema = z.object({
  type: mediaTypeSchema,
  folder: mediaFolderSchema,
  name: text("Le nom du fichier", 200, { min: 1 }),
  size: z.number().int().positive(),
  mime: text("Le type MIME", 100, { min: 1 }),
});

// ─── Journal ─────────────────────────────────────────────────────────────
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
export const logFiltersSchema = z.object({
  from: isoDay,
  to: isoDay,
  person: z.string().max(80).optional(),
  department: z.string().max(80).optional(),
  module: z.string().max(40).optional(),
  action: z.string().max(40).optional(),
  result: z.enum(["success", "failure"]).optional(),
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
});

/** Convertit les paramètres d'URL (chaînes vides ignorées) en objet filtré. */
export function searchParamsToObject(searchParams) {
  const obj = {};
  for (const [k, v] of searchParams.entries()) if (v !== "") obj[k] = v;
  return obj;
}

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
  // Facultatif pour un apprenant connecté (rattaché à son compte) ;
  // exigé pour un visiteur anonyme — vérifié dans la route.
  email: z.union([z.literal(""), email]).optional(),
  // Réponses : index de l'option choisie, par numéro de question.
  answers: z.record(z.string().regex(/^\d+$/), z.number().int().min(0).max(20)),
});

export const certificateRequestSchema = z.object({
  courseId,
  courseTitle: optionalText("Le titre de la formation", 200),
  // L'email est facultatif pour un apprenant connecté (le quiz réussi est
  // vérifié via son compte) ; il reste exigé pour un visiteur anonyme.
  email: z.union([z.literal(""), email]).optional(),
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
  // Prix pour les non-membres (FCFA). 0 = formation gratuite pour tout le
  // monde ; les membres actifs y accèdent toujours gratuitement.
  price_fcfa: z.coerce.number({ error: "Prix invalide" }).int().min(0, "Prix invalide").max(100000000),
};

export const courseCreateSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,79}$/, "Identifiant invalide (minuscules, chiffres et tirets)"),
  ...courseFields,
  price_fcfa: courseFields.price_fcfa.default(0),
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
const isoDateTimeOrNull = z
  .string()
  .trim()
  .max(40)
  .refine((s) => s === "" || !Number.isNaN(new Date(s).getTime()), "Date invalide")
  .transform((s) => (s === "" ? null : s))
  .nullable()
  .optional();

export const volunteerTextsSchema = z.object({
  badge: optionalText("Le badge de la popup", 80),
  bannerText: optionalText("Le texte de la bannière", 200),
  popupButton: optionalText("Le bouton de la popup", 60),
  bannerButton: optionalText("Le bouton de la bannière", 60),
});

export const volunteerSchema = z.object({
  firstName: text("Le prénom", 80, { min: 1 }),
  lastName: text("Le nom", 80, { min: 1 }),
  location: optionalText("La localisation", 120),
  photo: optionalText("La photo", 500),
  actions: optionalText("Les actions réalisées", 2000),
  contribution: optionalText("La contribution", 2000),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mois invalide (format AAAA-MM)")
    .nullable()
    .optional(),
  published: z.boolean().optional().default(false),
  notifyEnabled: z.boolean().optional().default(false),
  showPopup: z.boolean().optional().default(true),
  showBanner: z.boolean().optional().default(false),
  showPetals: z.boolean().optional().default(true),
  notifyFrom: isoDateTimeOrNull,
  notifyUntil: isoDateTimeOrNull,
  popupDelayMs: z.number().int().min(0, "Délai invalide").max(60000, "60 s maximum").optional().default(1800),
  frequency: z.enum(["session", "day", "always"], { error: "Fréquence invalide" }).optional().default("session"),
  texts: volunteerTextsSchema.partial().optional(),
});

// Mise à jour partielle : mêmes champs mais SANS les .default() — sinon zod
// réinjecterait les défauts pour chaque clé absente et écraserait la fiche.
export const volunteerPatchSchema = z.object({
  firstName: text("Le prénom", 80, { min: 1 }).optional(),
  lastName: text("Le nom", 80, { min: 1 }).optional(),
  location: optionalText("La localisation", 120),
  photo: optionalText("La photo", 500),
  actions: optionalText("Les actions réalisées", 2000),
  contribution: optionalText("La contribution", 2000),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mois invalide (format AAAA-MM)")
    .nullable()
    .optional(),
  published: z.boolean().optional(),
  notifyEnabled: z.boolean().optional(),
  showPopup: z.boolean().optional(),
  showBanner: z.boolean().optional(),
  showPetals: z.boolean().optional(),
  notifyFrom: isoDateTimeOrNull,
  notifyUntil: isoDateTimeOrNull,
  popupDelayMs: z.number().int().min(0, "Délai invalide").max(60000, "60 s maximum").optional(),
  frequency: z.enum(["session", "day", "always"], { error: "Fréquence invalide" }).optional(),
  texts: volunteerTextsSchema.partial().optional(),
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
  // Réglages de paiement manuel (Mobile Money) — phase 5A.
  payments: z.object({
    operators: z.object({
      orange: z.object({ enabled: z.boolean(), number: text("Le numéro Orange Money", 20).optional() }),
      mtn: z.object({ enabled: z.boolean(), number: text("Le numéro MTN MoMo", 20).optional() }),
      moov: z.object({ enabled: z.boolean(), number: text("Le numéro Moov Money", 20).optional() }),
      wave: z.object({ enabled: z.boolean(), number: text("Le numéro Wave", 20).optional() }),
    }),
    beneficiary: text("Le nom du bénéficiaire", 120),
    instructions: optionalText("Les instructions", 1000),
    verificationDelay: optionalText("Le délai de vérification", 300),
    accessMessageTemplate: optionalText("Le message d'accès", 500),
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

// .partial() conserve les .default() (ex. show:true réinjecté à chaque PATCH) :
// on retire show avant partial puis on le rajoute sans défaut.
export const projectUpdateSchema = projectCreateSchema
  .omit({ show: true })
  .partial()
  .extend({ show: z.boolean().optional() });

export const projectsOrderSchema = z.object({
  order: z.array(z.string().trim().min(1).max(100)).min(1, "Ordre vide").max(200),
});

// ─── Admin : recrutement ─────────────────────────────────────────────────
import { FIELD_TYPE_KEYS, OPTION_TYPES, SUBMISSION_STATUS_KEYS } from "./recruitmentModel";

const recruitmentFieldSchema = z
  .object({
    id: text("Identifiant du champ", 60, { min: 1 }),
    type: z.enum(FIELD_TYPE_KEYS, { error: "Type de champ invalide" }),
    label: text("Libellé", 120, { min: 1 }),
    required: z.boolean().optional(),
    placeholder: optionalText("Placeholder", 200),
    help: optionalText("Texte d'aide", 300),
    options: z.array(text("Option", 200, { min: 1 })).max(30, "30 options maximum").optional(),
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    fileKinds: z.array(z.enum(["image", "pdf", "word"])).max(3).optional(),
    maxSizeMb: z.number().positive().max(50, "50 Mo maximum").optional(),
    showInTable: z.boolean().optional(),
  })
  .superRefine((f, ctx) => {
    if (OPTION_TYPES.has(f.type) && !(f.options || []).length) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "Au moins une option est requise" });
    }
    if (f.type === "number" && f.min != null && f.max != null && f.min > f.max) {
      ctx.addIssue({ code: "custom", path: ["max"], message: "Le maximum doit être ≥ au minimum" });
    }
    if (f.type === "file" && !(f.fileKinds || []).length) {
      ctx.addIssue({ code: "custom", path: ["fileKinds"], message: "Choisissez au moins un type de fichier" });
    }
  });

const recruitmentButtonSchema = z.object({
  id: text("Identifiant du bouton", 60, { min: 1 }),
  label: text("Libellé du bouton", 80, { min: 1 }),
  url: z.string().trim().max(1000, "URL : 1000 caractères maximum").min(1, "L'URL du bouton est obligatoire")
    .refine((v) => /^https?:\/\//.test(v), "L'URL doit commencer par http:// ou https://"),
  icon: z.enum(["whatsapp", "form", "document", "link"], { error: "Icône invalide" }).optional(),
  style: z.enum(["primary", "secondary"], { error: "Style invalide" }).optional(),
  visibility: z.enum(["always", "afterSubmit"], { error: "Visibilité invalide" }).optional(),
});

const recDateBound = z
  .string()
  .trim()
  .max(40)
  .refine((s) => s === "" || !Number.isNaN(new Date(s).getTime()), "Date invalide")
  .transform((s) => (s === "" ? null : s))
  .nullable()
  .optional();

const recCommonFields = {
  title: text("Le titre", 160, { min: 1 }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,79}$/, "Slug invalide (minuscules, chiffres et tirets)"),
  type: text("Le type", 40, { min: 1 }),
  typeOther: optionalText("Type personnalisé", 60),
  summary: optionalText("Résumé", 300),
  description: optionalText("Description", 20000),
  coverImage: optionalText("Image de couverture", 600),
  location: optionalText("Lieu", 160),
  confirmationMessage: optionalText("Message de confirmation", 2000),
  maxSubmissions: z.number().int().positive("Maximum invalide").nullable().optional(),
  position: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  hidden: z.boolean().optional(),
  visibleFrom: recDateBound,
  visibleUntil: recDateBound,
  applyFrom: recDateBound,
  applyUntil: recDateBound,
  fields: z.array(recruitmentFieldSchema).max(60, "60 champs maximum").optional(),
  buttons: z.array(recruitmentButtonSchema).max(10, "10 boutons maximum").optional(),
};

/** La période de candidature doit être comprise dans la période d'apparition. */
const checkApplyInsideVisibility = (data, ctx) => {
  const vF = data.visibleFrom ? new Date(data.visibleFrom) : null;
  const vU = data.visibleUntil ? new Date(data.visibleUntil) : null;
  const aF = data.applyFrom ? new Date(data.applyFrom) : null;
  const aU = data.applyUntil ? new Date(data.applyUntil) : null;
  if (aF && vF && aF < vF) {
    ctx.addIssue({ code: "custom", path: ["applyFrom"], message: "L'ouverture des candidatures doit être dans la période d'apparition" });
  }
  if (aU && vU && aU > vU) {
    ctx.addIssue({ code: "custom", path: ["applyUntil"], message: "La clôture des candidatures doit être avant la fin d'apparition" });
  }
  if (aF && aU && aF > aU) {
    ctx.addIssue({ code: "custom", path: ["applyUntil"], message: "La clôture doit être après l'ouverture" });
  }
  if (vF && vU && vF > vU) {
    ctx.addIssue({ code: "custom", path: ["visibleUntil"], message: "La fin d'apparition doit être après le début" });
  }
};

export const recruitmentCreateSchema = z.object(recCommonFields).superRefine(checkApplyInsideVisibility);

// PATCH explicite : pas de .partial() sur le schéma de création (les défauts
// seraient réinjectés — même piège que le bénévole du mois en phase 3).
export const recruitmentUpdateSchema = z
  .object({
    title: text("Le titre", 160, { min: 1 }).optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9][a-z0-9-]{1,79}$/, "Slug invalide (minuscules, chiffres et tirets)")
      .optional(),
    type: text("Le type", 40, { min: 1 }).optional(),
    typeOther: optionalText("Type personnalisé", 60),
    summary: optionalText("Résumé", 300),
    description: optionalText("Description", 20000),
    coverImage: optionalText("Image de couverture", 600),
    location: optionalText("Lieu", 160),
    confirmationMessage: optionalText("Message de confirmation", 2000),
    maxSubmissions: z.number().int().positive("Maximum invalide").nullable().optional(),
    position: z.number().int().min(0).optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    hidden: z.boolean().optional(),
    visibleFrom: recDateBound,
    visibleUntil: recDateBound,
    applyFrom: recDateBound,
    applyUntil: recDateBound,
    fields: z.array(recruitmentFieldSchema).max(60, "60 champs maximum").optional(),
    buttons: z.array(recruitmentButtonSchema).max(10, "10 boutons maximum").optional(),
  })
  .superRefine(checkApplyInsideVisibility);

export const submissionStatusSchema = z.enum(SUBMISSION_STATUS_KEYS, { error: "Statut invalide" });

export const submissionPatchSchema = z.object({
  status: submissionStatusSchema.optional(),
  note: optionalText("Note interne", 2000),
});

export const bulkStatusSchema = z.object({
  ids: z.array(text("Identifiant", 60, { min: 1 })).min(1, "Sélection vide").max(500),
  status: submissionStatusSchema,
});

export const submissionFiltersSchema = z.object({
  status: z.string().max(40).optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  all: z.coerce.boolean().optional(),
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

// ─── Membres BLUE & apprenants (phase 5A) ────────────────────────────────
import { CI_PHONE_REGEX } from "./recruitmentModel";
import { IDENTIFIER_RE, MEMBER_STATUS_KEYS } from "./memberModel";

const ciPhone = text("Le numéro de téléphone", 20, { min: 8 }).refine(
	(v) => CI_PHONE_REGEX.test(v.replace(/[\s.-]/g, "")),
	"Téléphone invalide (format ivoirien : +225 ou 10 chiffres)"
);

const memberBase = {
	firstName: text("Le prénom", 80, { min: 1 }),
	lastName: text("Le nom", 80, { min: 1 }),
	phone: ciPhone,
	email: z.union([z.literal(""), email]).optional(),
	commune: optionalText("La commune", 120),
	joinedAt: optionalText("La date d'adhésion", 40),
	status: z.enum(MEMBER_STATUS_KEYS, { error: "Statut invalide" }).default("pending"),
	activitiesCount: z.coerce.number({ error: "Nombre invalide" }).int().min(0, "Nombre invalide").max(9999).default(0),
	tshirt: z.boolean().default(false),
	department: optionalText("Le département", 120),
	notes: optionalText("Les notes internes", 2000),
	origin: z.enum(["manual", "import", "recruitment", "payment"], { error: "Origine invalide" }).default("manual"),
	submissionId: z.string().trim().max(80).nullable().optional(),
};

export const memberSchema = z.object({ ...memberBase });
export const memberExternalSchema = z.object({
	kind: z.literal("external"),
	firstName: memberBase.firstName,
	lastName: memberBase.lastName,
	phone: memberBase.phone,
	email: memberBase.email,
});

// Patch explicite — PAS de .partial() sur memberSchema (il a des .default()).
export const memberPatchSchema = z.object({
	firstName: memberBase.firstName.optional(),
	lastName: memberBase.lastName.optional(),
	phone: memberBase.phone.optional(),
	email: z.union([z.literal(""), email]).optional(),
	commune: optionalText("La commune", 120),
	joinedAt: optionalText("La date d'adhésion", 40),
	status: z.enum(MEMBER_STATUS_KEYS, { error: "Statut invalide" }).optional(),
	activitiesCount: z.coerce.number().int().min(0).max(9999).optional(),
	tshirt: z.boolean().optional(),
	department: optionalText("Le département", 120),
	notes: optionalText("Les notes internes", 2000),
	origin: z.enum(["manual", "import", "recruitment", "payment"], { error: "Origine invalide" }).optional(),
	submissionId: z.string().trim().max(80).nullable().optional(),
});

export const memberFiltersSchema = z.object({
	q: z.string().max(120).optional(),
	status: z.enum(MEMBER_STATUS_KEYS).optional(),
	tshirt: z.enum(["yes", "no"]).optional(),
	kind: z.enum(["member", "external"]).optional(),
	origin: z.string().max(40).optional(),
	sort: z.enum(["recent", "oldest", "name"]).optional(),
	page: z.coerce.number().int().min(1).optional(),
	pageSize: z.coerce.number().int().min(1).max(500).optional(),
});

export const memberBulkSchema = z.object({
	ids: z.array(z.coerce.string().min(1).max(80)).min(1, "Sélectionnez au moins un membre").max(1000),
	status: z.enum(MEMBER_STATUS_KEYS, { error: "Statut invalide" }),
});

export const memberImportSchema = z.object({
	rows: z.array(z.object({ ...memberBase })).min(1, "Aucune ligne à importer").max(2000, "2000 lignes maximum par import"),
});

// Connexion apprenant : identifiant BLUE + code à 6 chiffres.
export const learnerLoginSchema = z.object({
	identifier: z.string().trim().max(30).regex(IDENTIFIER_RE, "Identifiant invalide (format BLUE-XXXX-0000)"),
	code: z.string().trim().regex(/^\d{6}$/, "Le code d'accès contient 6 chiffres"),
});

// ─── Paiements manuels Mobile Money ──────────────────────────────────────
export const PAYMENT_OPERATORS = ["orange", "mtn", "moov", "wave"];
export const paymentSubmitSchema = z.object({
	courseId,
	firstName: text("Le prénom", 80, { min: 1 }),
	lastName: text("Le nom", 80, { min: 1 }),
	phone: ciPhone,
	email: z.union([z.literal(""), email]).optional(),
	operator: z.enum(PAYMENT_OPERATORS, { error: "Opérateur invalide" }),
	transactionRef: text("La référence de transaction", 60, { min: 3 }),
});

export const paymentDecisionSchema = z.object({
	action: z.enum(["validate", "reject"], { error: "Action invalide" }),
	reason: optionalText("Le motif", 300),
});

export const paymentFiltersSchema = z.object({
	status: z.enum(["pending", "validated", "rejected"]).optional(),
	q: z.string().max(120).optional(),
	sort: z.enum(["newest", "oldest"]).optional(),
	page: z.coerce.number().int().min(1).optional(),
	pageSize: z.coerce.number().int().min(1).max(500).optional(),
});

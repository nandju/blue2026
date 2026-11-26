// Modèle partagé du module Recrutement (client + serveur) : types de champs,
// calcul du statut d'un recrutement, schéma zod dynamique des candidatures,
// préparation « membre ». Ne jamais exposer button.url au navigateur.

import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────

export const RECRUITMENT_TYPES = ["Bénévolat", "Bureau", "Ambassadeur", "Stage", "Partenariat"];

export const STATUSES = {
	draft: { key: "draft", label: "Brouillon", color: "#6b7280" },
	hidden: { key: "hidden", label: "Masqué", color: "#374151" },
	scheduled: { key: "scheduled", label: "Programmé", color: "#8b5cf6" },
	expired: { key: "expired", label: "Expiré", color: "#9ca3af" },
	announced: { key: "announced", label: "Annonce", color: "#f59e0b" },
	closed: { key: "closed", label: "Clôturé", color: "#64748b" },
	full: { key: "full", label: "Complet", color: "#dc2626" },
	open: { key: "open", label: "Ouvert", color: "#059669" },
};

// Statuts où le recrutement apparaît sur le site.
export const VISIBLE_STATUSES = new Set(["announced", "open", "closed", "full"]);
// Statuts où la candidature est possible.
export const APPLY_STATUSES = new Set(["open"]);

export const SUBMISSION_STATUSES = {
	new: "Nouvelle",
	reviewed: "Examinée",
	shortlisted: "Présélectionnée",
	accepted: "Acceptée",
	rejected: "Refusée",
};
export const SUBMISSION_STATUS_KEYS = Object.keys(SUBMISSION_STATUSES);

// ─── Champs du formulaire ─────────────────────────────────────────────────

export const FIELD_TYPES = {
	text: "Texte court",
	textarea: "Texte long",
	email: "Email",
	phone: "Téléphone",
	number: "Nombre",
	date: "Date",
	select: "Liste déroulante",
	radio: "Choix unique",
	checkboxes: "Choix multiples",
	yesno: "Oui / Non",
	file: "Fichier",
	heading: "Titre de section",
	paragraph: "Paragraphe d'information",
};
export const FIELD_TYPE_KEYS = Object.keys(FIELD_TYPES);
// Types qui ne demandent pas de réponse (affichage seulement).
export const DISPLAY_ONLY_TYPES = new Set(["heading", "paragraph"]);
// Types avec une liste d'options.
export const OPTION_TYPES = new Set(["select", "radio", "checkboxes"]);
// Types de fichiers acceptés dans un champ « fichier ».
export const FILE_KINDS = {
	image: { label: "Images", exts: ["jpg", "jpeg", "png", "webp"], mimes: ["image/jpeg", "image/png", "image/webp"] },
	pdf: { label: "PDF", exts: ["pdf"], mimes: ["application/pdf"] },
	word: {
		label: "Word",
		exts: ["doc", "docx"],
		mimes: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
	},
};

let fieldSeq = 0;
/** Identifiant stable : ne change pas quand le libellé change. */
export function newFieldId() {
	fieldSeq += 1;
	return `f_${Date.now().toString(36)}_${fieldSeq}_${Math.random().toString(36).slice(2, 7)}`;
}

let buttonSeq = 0;
export function newButtonId() {
	buttonSeq += 1;
	return `b_${Date.now().toString(36)}_${buttonSeq}_${Math.random().toString(36).slice(2, 7)}`;
}

export const DEFAULT_FIELD = (type = "text") => ({
	id: newFieldId(),
	type,
	label: "",
	required: false,
	placeholder: "",
	help: "",
	options: [],
	min: null,
	max: null,
	fileKinds: ["image", "pdf"],
	maxSizeMb: 5,
	showInTable: true,
});

/** Modèle de départ proposé à la création d'un recrutement. */
export function starterFields() {
	const mk = (t, label, extra = {}) => ({ ...DEFAULT_FIELD(t), label, ...extra });
	return [
		mk("heading", "Identité", { showInTable: false }),
		mk("text", "Nom", { required: true }),
		mk("text", "Prénom", { required: true }),
		mk("phone", "Téléphone", { required: true, placeholder: "+225 07 00 00 00 00" }),
		mk("email", "Email", { required: true, placeholder: "prenom@exemple.com" }),
		mk("text", "Commune / Ville", { required: true }),
		mk("textarea", "Votre motivation", { required: true, placeholder: "Pourquoi souhaitez-vous rejoindre BLUE ?" }),
	];
}

// ─── Boutons-liens masqués ────────────────────────────────────────────────

export const BUTTON_ICONS = { whatsapp: "WhatsApp", form: "Google Form", document: "Document", link: "Lien" };
export const BUTTON_STYLES = { primary: "Principal", secondary: "Secondaire" };
export const BUTTON_VISIBILITIES = { always: "Toujours visible", afterSubmit: "Après envoi du formulaire" };

export const DEFAULT_BUTTON = () => ({
	id: newButtonId(),
	label: "",
	url: "",
	icon: "link",
	style: "primary",
	visibility: "always",
});

/** Version publique d'un bouton : jamais l'URL. */
export function publicButton(slug, b) {
	return {
		id: b.id,
		label: b.label,
		icon: b.icon,
		style: b.style,
		href: `/go/${encodeURIComponent(slug)}/${encodeURIComponent(b.id)}`,
	};
}

// ─── Dates et statut ──────────────────────────────────────────────────────

// Fuseau administratif : Africa/Abidjan = UTC (pas d'heure d'été). Les
// bornes saisies dans l'admin (« du 30/11 à 18h ») sont donc comparées à UTC.
const toDate = (v) => {
	if (!v) return null;
	const d = new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
};

export const fmtDateTime = (v) => {
	const d = toDate(v);
	if (!d) return "—";
	return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
};
export const fmtDate = (v) => {
	const d = toDate(v);
	if (!d) return "—";
	return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
};

/**
 * Statut calculé (fonction unique, utilisée par l'admin, les API, les pages
 * publiques et MR BLUE). `submissionCount` = nombre de candidatures reçues.
 */
export function computeStatus(form, submissionCount = 0, now = new Date()) {
	if (!form) return "draft";
	if (!form.published) return "draft";
	if (form.hidden) return "hidden";
	const visFrom = toDate(form.visibleFrom);
	const visUntil = toDate(form.visibleUntil);
	const appFrom = toDate(form.applyFrom);
	const appUntil = toDate(form.applyUntil);
	if (visUntil && now > visUntil) return "expired";
	if (visFrom && now < visFrom) return "scheduled";
	// Période d'apparition atteinte :
	if (appFrom && now < appFrom) return "announced";
	if (appUntil && now > appUntil) return "closed";
	if (form.maxSubmissions != null && submissionCount >= form.maxSubmissions) return "full";
	return "open";
}

export const isVisible = (status) => VISIBLE_STATUSES.has(status);
export const canApply = (status) => APPLY_STATUSES.has(status);

/** Message public selon le statut quand la candidature n'est pas ouverte. */
export function closedMessage(form, status) {
	const appFrom = toDate(form?.applyFrom);
	switch (status) {
		case "announced":
			return `Les candidatures ouvrent le ${fmtDateTime(appFrom)}.`;
		case "closed":
			return "Les candidatures sont clôturées.";
		case "full":
			return "Le nombre maximum de candidatures est atteint.";
		case "hidden":
		case "expired":
			return "Ce recrutement n'est plus disponible.";
		default:
			return "Ce recrutement n'est pas ouvert aux candidatures.";
	}
}

// ─── Slug ─────────────────────────────────────────────────────────────────

export function slugify(title = "") {
	return title
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80) || `recrutement-${Date.now().toString(36)}`;
}

// ─── Validation dynamique des candidatures ───────────────────────────────

export const CI_PHONE_REGEX = /^(\+?225|00225)?0?\d{9,10}$/;
export function normalizePhone(v = "") {
	return String(v).replace(/[\s.\-()]/g, "");
}
export function isValidCiPhone(v) {
	return CI_PHONE_REGEX.test(normalizePhone(v));
}

const tooLong = (label, max) => `${label} : ${max} caractères maximum`;

/** Schéma zod construit à partir des champs du recrutement (serveur + aperçu client). */
export function submissionSchemaFor(fields = []) {
	const shape = {};
	for (const f of fields) {
		if (DISPLAY_ONLY_TYPES.has(f.type)) continue;
		const label = f.label || "Ce champ";
		let s;
		switch (f.type) {
			case "email":
				s = z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide")).pipe(z.string().max(160));
				break;
			case "phone":
				s = z
					.string()
					.trim()
					.max(40, tooLong(label, 40))
					.refine(isValidCiPhone, "Numéro ivoirien attendu (+225 puis 10 chiffres)");
				break;
			case "number": {
				s = z.coerce.number({ error: "Nombre invalide" });
				if (f.min != null) s = s.min(f.min, `Minimum ${f.min}`);
				if (f.max != null) s = s.max(f.max, `Maximum ${f.max}`);
				break;
			}
			case "date":
				s = z.string().trim().max(20).refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Date invalide");
				break;
			case "select":
			case "radio":
				s = z
					.string()
					.trim()
					.max(200)
					.refine((v) => v === "" || (f.options || []).includes(v), "Choix invalide");
				break;
			case "checkboxes":
				s = z
					.array(z.string().trim().max(200))
					.max((f.options || []).length || 20)
					.refine((arr) => arr.every((v) => (f.options || []).includes(v)), "Choix invalide");
				break;
			case "yesno":
				s = z.boolean({ error: "Répondez par oui ou non" });
				break;
			case "file":
				s = z.any(); // métadonnées du fichier validées séparément (upload)
				break;
			default: // text | textarea
				s = z.string().trim().max(f.type === "textarea" ? 4000 : 500, tooLong(label, f.type === "textarea" ? 4000 : 500));
		}
		// Obligatoire : refus des valeurs vides (sauf fichier, vérifié à part).
		if (f.required && f.type !== "file" && f.type !== "yesno") {
			s = s.refine(
				(v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0),
				`${label} est obligatoire`
			);
		} else if (!f.required && f.type !== "file") {
			s = s.optional();
		}
		shape[f.id] = s;
	}
	return z.object(shape);
}

/** Extraction email + téléphone des réponses (détection des doublons). */
export function contactOf(fields, answers) {
	let email = null;
	let phone = null;
	for (const f of fields || []) {
		if (f.type === "email" && !email && answers?.[f.id]) email = String(answers[f.id]).trim().toLowerCase();
		if (f.type === "phone" && !phone && answers?.[f.id]) phone = normalizePhone(answers[f.id]);
	}
	return { email, phone };
}

// ─── Conversion membre (phase 5 : préparation seulement) ──────────────────

export function toMemberDraft(submission, form) {
	const fieldLabel = (id) => (form?.fields || []).find((f) => f.id === id)?.label || id;
	const answers = submission?.answers || {};
	const byLabel = {};
	for (const [id, v] of Object.entries(answers)) byLabel[fieldLabel(id).toLowerCase()] = v;
	const pick = (...labels) => {
		for (const l of labels) {
			const exact = byLabel[l];
			if (exact !== undefined && exact !== "") return exact;
			const hit = Object.entries(byLabel).find(([k]) => k !== "prénom" && k !== "prenom" && k.endsWith(l));
			if (hit?.[1] !== undefined && hit[1] !== "") return hit[1];
		}
		return "";
	};
	const { email, phone } = contactOf(form?.fields, answers);
	return {
		lastName: String(pick("nom") || ""),
		firstName: String(pick("prénom", "prenom") || ""),
		email: email || String(pick("email", "e-mail") || ""),
		phone: phone || String(pick("téléphone", "telephone", "tel") || ""),
		location: String(pick("commune", "ville", "localit") || ""),
		source: `recrutement:${form?.slug || submission?.formId || ""}`,
		recruitmentTitle: form?.title || "",
		appliedAt: submission?.createdAt || null,
	};
}

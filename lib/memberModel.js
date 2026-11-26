// Modèle « membre BLUE » partagé entre le navigateur et le serveur.
// Un membre a un identifiant unique BLUE-XXX-NNNN jamais réattribué, un
// statut (actif / en cours / inactif) et un code d'accès à 6 chiffres
// (haché côté serveur). Les apprenants payants sont des membres de type
// « external » (identifiant BLUE-EXT-NNNN) qui n'ont accès qu'aux
// formations achetées.

export const MEMBER_STATUSES = {
	active: { key: "active", label: "Actif", color: "#059669" },
	pending: { key: "pending", label: "En cours", color: "#f59e0b" },
	inactive: { key: "inactive", label: "Inactif", color: "#6b7280" },
};
export const MEMBER_STATUS_KEYS = Object.keys(MEMBER_STATUSES);

export const MEMBER_KINDS = {
	member: "Membre BLUE",
	external: "Accès payant",
};

export const MEMBER_ORIGINS = {
	manual: "Saisie manuelle",
	import: "Import CSV",
	recruitment: "Recrutement",
	payment: "Paiement",
};

/** Format : BLUE-ADH-0001 (membres) ou BLUE-EXT-0001 (payants). */
export const IDENTIFIER_RE = /^BLUE-(ADH|EXT)-\d{4,}$/;
export const identifierOf = (kind, seq) => `BLUE-${kind === "external" ? "EXT" : "ADH"}-${String(seq).padStart(4, "0")}`;

// Règle « membre actif » : au moins 2 activités officielles + T-shirt.
export const ACTIVE_MIN_ACTIVITIES = 2;

/** Ce qui manque à un membre pour être actif (null si tout est rempli). */
export function missingForActive(member) {
	if (!member) return null;
	const missing = [];
	const n = Number(member.activitiesCount) || 0;
	if (n < ACTIVE_MIN_ACTIVITIES) missing.push(`${ACTIVE_MIN_ACTIVITIES - n} activité${ACTIVE_MIN_ACTIVITIES - n > 1 ? "s" : ""} officielle${ACTIVE_MIN_ACTIVITIES - n > 1 ? "s" : ""}`);
	if (!member.tshirt) missing.push("le T-shirt");
	return missing.length ? missing : null;
}

/** « Il vous reste 1 activité officielle et le T-shirt pour devenir membre actif » */
export function missingMessage(member) {
	const missing = missingForActive(member);
	if (!missing) return null;
	return `Il vous reste ${missing.join(" et ")} pour devenir membre actif.`;
}

const DEFAULT_WA_MESSAGE =
	"Bonjour {prénom}, votre accès BLUE Academy : identifiant {identifiant}, code {code}. Connectez-vous sur {lien}";

/** Message WhatsApp prêt à copier avec identifiant + code. */
export function accessMessage(member, code, baseUrl, template = DEFAULT_WA_MESSAGE) {
	return (template || DEFAULT_WA_MESSAGE)
		.replaceAll("{prénom}", member?.firstName || "")
		.replaceAll("{prenom}", member?.firstName || "")
		.replaceAll("{nom}", member?.lastName || "")
		.replaceAll("{identifiant}", member?.identifier || "")
		.replaceAll("{code}", code || "")
		.replaceAll("{lien}", `${baseUrl || ""}/academy/connexion`);
}

export const DEFAULT_MEMBER = {
	kind: "member",
	identifier: "",
	firstName: "",
	lastName: "",
	phone: "",
	email: "",
	commune: "",
	joinedAt: null,
	status: "pending",
	activitiesCount: 0,
	tshirt: false,
	department: "",
	notes: "",
	origin: "manual",
	accessDisabled: false,
	codeVersion: 0,
	submissionId: null,
};

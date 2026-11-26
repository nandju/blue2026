import "server-only";
import bcrypt from "bcryptjs";
import { createCollection, nowIso, sameId, sameEmail } from "./collection";
import { ConflictError, NotFoundError } from "../errors";
import { identifierOf, missingForActive } from "@/lib/memberModel";
import { normalizePhone } from "@/lib/recruitmentModel";

// Registre des membres BLUE + accès aux formations (course-access).
// L'identifiant BLUE-ADH-0001 / BLUE-EXT-0001 vient d'une séquence persistante
// jamais réattribuée, même après suppression d'un membre.

const membersCol = createCollection("members", { idType: "uuid" });
const seqCol = createCollection("member-sequence");
const accessCol = createCollection("course-access");

const pickMember = (m = {}) =>
	Object.fromEntries(
		[
			"kind", "identifier", "firstName", "lastName", "phone", "email", "commune",
			"joinedAt", "status", "activitiesCount", "tshirt", "department", "notes",
			"origin", "accessDisabled", "codeVersion", "accessCodeHash", "submissionId",
		]
			.filter((k) => m[k] !== undefined)
			.map((k) => [k, m[k]])
	);

/** Numéro de séquence suivant pour un préfixe (persistant, jamais réattribué). */
async function nextSeq(kind) {
	return seqCol.mutate((list) => {
		let row = list.find((r) => r.kind === kind);
		if (!row) {
			row = { kind, next: 1 };
			list.push(row);
		}
		const seq = row.next;
		row.next += 1;
		return seq;
	});
}

/** Téléphone déjà utilisé par un autre membre ? */
async function phoneTaken(phone, exceptId = null) {
	const p = normalizePhone(phone || "");
	if (!p) return null;
	const list = await membersCol.all();
	return list.find((m) => normalizePhone(m.phone || "") === p && !sameId(m.id, exceptId)) || null;
}

/** Email déjà utilisé par un autre membre ? */
async function emailTaken(email, exceptId = null) {
	if (!email) return null;
	const list = await membersCol.all();
	return list.find((m) => m.email && sameEmail(m.email, email) && !sameId(m.id, exceptId)) || null;
}

const notFound = () => new NotFoundError("Membre introuvable.");
const withoutSecret = (m) => (m ? { ...m, accessCodeHash: undefined } : m);

export const members = {
	async list({ q, status, tshirt, kind, origin, sort = "recent", page = 1, pageSize = 20 } = {}) {
		let list = await membersCol.all();
		if (kind) list = list.filter((m) => (m.kind || "member") === kind);
		if (status) list = list.filter((m) => m.status === status);
		if (tshirt === "yes") list = list.filter((m) => m.tshirt);
		if (tshirt === "no") list = list.filter((m) => !m.tshirt);
		if (origin) list = list.filter((m) => m.origin === origin);
		if (q) {
			const n = q.toLowerCase();
			list = list.filter((m) =>
				`${m.lastName} ${m.firstName} ${m.phone} ${m.identifier} ${m.email || ""}`.toLowerCase().includes(n)
			);
		}
		const sorts = {
			recent: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
			oldest: (a, b) => String(a.createdAt).localeCompare(String(b.createdAt)),
			name: (a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr"),
		};
		list = [...list].sort(sorts[sort] || sorts.recent);
		const total = list.length;
		const items = list.slice((page - 1) * pageSize, page * pageSize).map(withoutSecret);
		return { items, total, page, pageSize };
	},

	async get(id) {
		return withoutSecret(await membersCol.get(id));
	},

	getByIdentifier(identifier) {
		return membersCol.all().then((l) =>
			l.find((m) => String(m.identifier).toLowerCase() === String(identifier || "").trim().toLowerCase()) || null
		);
	},

	getByPhone: (phone) => phoneTaken(phone),

	async create(data, by = null) {
		const phoneHit = await phoneTaken(data.phone);
		if (phoneHit) throw new ConflictError(`Ce numéro est déjà enregistré pour ${phoneHit.identifier} (${phoneHit.firstName} ${phoneHit.lastName}).`);
		const emailHit = await emailTaken(data.email);
		if (emailHit) throw new ConflictError("Cet email est déjà utilisé par un autre membre.");
		const kind = data.kind === "external" ? "external" : "member";
		const seq = await nextSeq(kind);
		return membersCol.insert({
			kind,
			identifier: identifierOf(kind, seq),
			...pickMember(data),
			phone: normalizePhone(data.phone || "") || data.phone,
			email: data.email ? String(data.email).trim().toLowerCase() : null,
			joinedAt: data.joinedAt || nowIso(),
			activitiesCount: Number(data.activitiesCount) || 0,
			codeVersion: 0,
			accessCodeHash: null,
			createdAt: nowIso(),
			updatedAt: nowIso(),
			createdBy: by,
			updatedBy: by,
		}).then(withoutSecret);
	},

	async update(id, patch, by = null) {
		const phoneHit = patch.phone !== undefined ? await phoneTaken(patch.phone, id) : null;
		if (phoneHit) throw new ConflictError(`Ce numéro est déjà enregistré pour ${phoneHit.identifier}.`);
		const emailHit = patch.email !== undefined ? await emailTaken(patch.email, id) : null;
		if (emailHit) throw new ConflictError("Cet email est déjà utilisé par un autre membre.");
		const clean = pickMember(patch);
		delete clean.identifier; // l'identifiant n'est jamais réattribué ni modifié
		if (clean.phone) clean.phone = normalizePhone(clean.phone) || clean.phone;
		if (clean.email !== undefined) clean.email = clean.email ? String(clean.email).trim().toLowerCase() : null;
		return membersCol.update(id, { ...clean, updatedAt: nowIso(), updatedBy: by }, "Membre introuvable.").then(withoutSecret);
	},

	remove: (id) => membersCol.remove(id, "Membre introuvable."),

	// ─── Code d'accès (6 chiffres, haché bcrypt, affiché une seule fois) ────
	/** Génère un nouveau code ; l'ancien cesse de fonctionner (codeVersion++). */
	async regenerateAccessCode(id) {
		const code = String(Math.floor(100000 + Math.random() * 900000));
		const hash = await bcrypt.hash(code, 10);
		const member = await membersCol.mutate((list) => {
			const i = list.findIndex((m) => sameId(m.id, id));
			if (i < 0) throw notFound();
			list[i] = {
				...list[i],
				accessCodeHash: hash,
				codeVersion: (list[i].codeVersion || 0) + 1,
				accessDisabled: false,
				updatedAt: nowIso(),
			};
			return list[i];
		});
		return { code, member: withoutSecret(member) };
	},

	/** Désactive l'accès : toutes les sessions cessent de fonctionner. */
	async setAccessDisabled(id, disabled) {
		return membersCol.update(
			id,
			{ accessDisabled: !!disabled, codeVersion: undefined, updatedAt: nowIso() },
			"Membre introuvable."
		).then(withoutSecret);
	},

	/** Vérifie un code : succès → { ok:true, member } ; sinon raison. */
	async verifyAccessCode(identifier, code) {
		const member = await this.getByIdentifier(identifier);
		if (!member) return { ok: false, reason: "identifier" };
		if (member.accessDisabled || !member.accessCodeHash) return { ok: false, reason: "disabled" };
		const ok = await bcrypt.compare(String(code || "").trim(), member.accessCodeHash);
		return ok ? { ok: true, member } : { ok: false, reason: "code" };
	},

	// ─── Accès aux formations (course-access) ─────────────────────────────
	async listAccess(memberId) {
		return (await accessCol.all()).filter((a) => sameId(a.memberId, memberId)).map((a) => a.courseId);
	},
	async grantAccess(memberId, courseId, paymentId = null) {
		const existing = (await accessCol.all()).find((a) => sameId(a.memberId, memberId) && sameId(a.courseId, courseId));
		if (existing) return existing;
		return accessCol.insert({ memberId, courseId, paymentId, grantedAt: nowIso() });
	},

	// ─── Import CSV (déjà parsé côté route) ───────────────────────────────
	async importRows(rows, by = null) {
		const report = { created: 0, skipped: 0, errors: [] };
		for (const [i, row] of rows.entries()) {
			try {
				await this.create({ ...row, origin: row.origin || "import" }, by);
				report.created++;
			} catch (e) {
				if (e instanceof ConflictError) report.skipped++;
				else report.errors.push({ line: i + 2, error: e.message });
			}
		}
		return report;
	},

	// ─── Compteurs ─────────────────────────────────────────────────────────
	count: async () => (await membersCol.all()).length,
	/** Libellé du statut + suggestion « passer en Actif » pour l'admin. */
	activeSuggestion(member) {
		return member && member.status !== "active" && !missingForActive(member);
	},
};

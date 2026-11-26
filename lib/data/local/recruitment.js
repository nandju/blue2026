import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createCollection, nowIso, sameId, sameEmail } from "./collection";
import { DATA_DIR, atomicWrite } from "./store";
import { ConflictError, NotFoundError, BadRequestError } from "../errors";
import { computeStatus, contactOf } from "@/lib/recruitmentModel";

// Deux collections : les recrutements (formulaires) et les candidatures.
// Les pièces jointes des candidats vont dans data/recruitment-files/ — hors
// public/ donc jamais servies publiquement (uniquement via l'API admin).

const formsCol = createCollection("recruitment", { idType: "uuid" });
const subsCol = createCollection("recruitment-submissions", { idType: "uuid" });
const clicksCol = createCollection("recruitment-clicks", { idType: "uuid" });

export const FILES_DIR = path.join(DATA_DIR, "recruitment-files");
export function filesPathOf(storagePath) {
	const clean = String(storagePath || "").replace(/\\/g, "/");
	if (!clean || clean.includes("\0") || clean.split("/").some((p) => p === ".." || p === "")) return null;
	const abs = path.resolve(FILES_DIR, clean);
	return abs.startsWith(FILES_DIR + path.sep) ? abs : null;
}

const FORM_FIELDS = [
	"title", "slug", "type", "typeOther", "summary", "description", "coverImage", "location",
	"confirmationMessage", "maxSubmissions", "position", "featured",
	"published", "hidden", "visibleFrom", "visibleUntil", "applyFrom", "applyUntil",
	"fields", "buttons",
];
const pickForm = (f = {}) =>
	Object.fromEntries(FORM_FIELDS.filter((k) => f[k] !== undefined).map((k) => [k, f[k]]));

async function slugTaken(slug, exceptId = null) {
	const list = await formsCol.all();
	return list.some((r) => r.slug === slug && !sameId(r.id, exceptId));
}

/** Compte des candidatures par recrutement. */
async function submissionCounts() {
	const subs = await subsCol.all();
	const counts = {};
	for (const s of subs) counts[s.formId] = (counts[s.formId] || 0) + 1;
	return counts;
}

/** Recrutement enrichi : nombre de candidatures + statut calculé + clics par bouton. */
export function withStatus(form, submissionCount, clickCounts = {}, now = new Date()) {
	if (!form) return null;
	const buttons = (form.buttons || []).map((b) => ({ ...b, clicks: clickCounts[b.id] || 0 }));
	return { ...form, buttons, submissionCount, status: computeStatus(form, submissionCount, now) };
}

async function allClickCounts() {
	const list = await clicksCol.all();
	const counts = {}; // { formId: { buttonId: n } }
	for (const c of list) {
		counts[c.formId] ??= {};
		counts[c.formId][c.buttonId] = (counts[c.formId][c.buttonId] || 0) + 1;
	}
	return counts;
}

export const recruitment = {
	// ─── Formulaires ──────────────────────────────────────────────────────
	async list() {
		const [list, counts, clicks] = await Promise.all([formsCol.all(), submissionCounts(), allClickCounts()]);
		return list
			.map((f) => withStatus(f, counts[f.id] || 0, clicks[f.id] || {}))
			.sort((a, b) => (a.position ?? 999) - (b.position ?? 999) || String(a.createdAt).localeCompare(String(b.createdAt)));
	},
	async get(id) {
		const form = await formsCol.get(id);
		if (!form) return null;
		const counts = await submissionCounts();
		return withStatus(form, counts[form.id] || 0, (await this.clickCounts(id)));
	},
	async getBySlug(slug) {
		const list = await formsCol.all();
		const form = list.find((f) => f.slug === slug) || null;
		if (!form) return null;
		const counts = await submissionCounts();
		return withStatus(form, counts[form.id] || 0, (await this.clickCounts(form.id)));
	},
	async create(data, by = null) {
		if (data.slug && (await slugTaken(data.slug))) {
			throw new ConflictError(`Le slug « ${data.slug} » est déjà utilisé par un autre recrutement.`);
		}
		const rec = await formsCol.insert({
			...pickForm(data),
			published: false,
			hidden: false,
			createdAt: nowIso(),
			updatedAt: nowIso(),
			createdBy: by,
			updatedBy: by,
		});
		return withStatus(rec, 0);
	},
	async update(id, patch, by = null) {
		if (patch.slug && (await slugTaken(patch.slug, id))) {
			throw new ConflictError(`Le slug « ${patch.slug} » est déjà utilisé par un autre recrutement.`);
		}
		const rec = await formsCol.update(id, { ...pickForm(patch), updatedAt: nowIso(), updatedBy: by }, "Recrutement introuvable.");
		const counts = await submissionCounts();
		return withStatus(rec, counts[rec.id] || 0);
	},
	async remove(id) {
		const removed = await formsCol.remove(id, "Recrutement introuvable.");
		// Candidatures liées supprimées en cascade.
		await subsCol.mutate((subs) => {
			for (let i = subs.length - 1; i >= 0; i--) if (sameId(subs[i].formId, removed.id)) subs.splice(i, 1);
			return removed;
		});
		return removed;
	},
	async duplicate(id, by = null) {
		const src = await formsCol.get(id);
		if (!src) throw new NotFoundError("Recrutement introuvable.");
		const { id: _id, createdAt: _c, updatedAt: _u, createdBy: _cb, updatedBy: _ub, ...rest } = src;
		const rec = await formsCol.insert({
			...rest,
			title: `${src.title} (copie)`,
			slug: `${src.slug}-copie-${Date.now().toString(36)}`,
			published: false,
			hidden: false,
			createdAt: nowIso(),
			updatedAt: nowIso(),
			createdBy: by,
			updatedBy: by,
		});
		return withStatus(rec, 0);
	},

	// ─── Candidatures ─────────────────────────────────────────────────────
	async listSubmissions(formId, { status, q, sort = "newest", page = 1, pageSize = 20 } = {}) {
		let list = (await subsCol.all()).filter((s) => sameId(s.formId, formId));
		if (status) list = list.filter((s) => s.status === status);
		if (q) {
			const needle = q.toLowerCase();
			list = list.filter((s) => JSON.stringify(s.answers || {}).toLowerCase().includes(needle));
		}
		const dir = sort === "oldest" ? 1 : -1;
		list = [...list].sort((a, b) => dir * String(a.createdAt).localeCompare(String(b.createdAt)));
		const total = list.length;
		const items = list.slice((page - 1) * pageSize, page * pageSize);
		return { items, total, page, pageSize };
	},
	getSubmission: (id) => subsCol.get(id),
	async countSubmissions(formId, { since } = {}) {
		let list = (await subsCol.all()).filter((s) => sameId(s.formId, formId));
		if (since) list = list.filter((s) => String(s.createdAt) >= since);
		return list.length;
	},
	/** Doublon : même email ou même téléphone sur ce recrutement. */
	async findDuplicate(formId, { email, phone }) {
		if (!email && !phone) return null;
		const list = (await subsCol.all()).filter((s) => sameId(s.formId, formId));
		return (
			list.find(
				(s) => (email && s.email && sameEmail(s.email, email)) || (phone && s.phone && s.phone === phone)
			) || null
		);
	},
	async addSubmission(formId, { answers, email, phone, ip }) {
		const form = await formsCol.get(formId);
		if (!form) throw new NotFoundError("Recrutement introuvable.");
		const dup = await this.findDuplicate(formId, { email, phone });
		if (dup) throw new ConflictError("Vous avez déjà postulé à ce recrutement.");
		if (form.maxSubmissions != null) {
			const count = await this.countSubmissions(formId);
			if (count >= form.maxSubmissions) throw new ConflictError("Le nombre maximum de candidatures est atteint.");
		}
		return subsCol.insert({
			formId,
			answers,
			email: email || null,
			phone: phone || null,
			ip: ip || null,
			status: "new",
			note: "",
			history: [{ status: "new", at: nowIso(), by: "Candidat(e)" }],
			createdAt: nowIso(),
		});
	},
	async updateSubmission(id, patch, by = null) {
		const allowed = ["status", "note"];
		const clean = Object.fromEntries(allowed.filter((k) => patch[k] !== undefined).map((k) => [k, patch[k]]));
		return subsCol.mutate((list) => {
			const i = list.findIndex((s) => sameId(s.id, id));
			if (i < 0) throw new NotFoundError("Candidature introuvable.");
			const before = list[i];
			if (clean.status && clean.status !== before.status) {
				before.history = [
					...(before.history || []),
					{ from: before.status, status: clean.status, at: nowIso(), by: by?.name || "Admin" },
				];
			}
			list[i] = { ...before, ...clean };
			return list[i];
		});
	},
	removeSubmission: (id) => subsCol.remove(id, "Candidature introuvable."),

	/** Tableau de bord : recrutements ouverts, candidatures récentes, prochaine clôture. */
	async stats() {
		const [forms, subs] = await Promise.all([this.list(), subsCol.all()]);
		const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
		const recent = subs.filter((s) => String(s.createdAt) >= weekAgo).length;
		const nextClosing = forms
			.filter((f) => f.status === "open" && f.applyUntil)
			.map((f) => f.applyUntil)
			.sort()[0] || null;
		return {
			open: forms.filter((f) => f.status === "open").length,
			submissions7d: recent,
			nextClosing,
		};
	},

	// ─── Clics sur les boutons-liens ─────────────────────────────────────
	async recordClick(formId, buttonId) {
		return clicksCol.insert({ formId, buttonId, at: nowIso() });
	},
	async clickCounts(formId) {
		const list = (await clicksCol.all()).filter((c) => sameId(c.formId, formId));
		const counts = {};
		for (const c of list) counts[c.buttonId] = (counts[c.buttonId] || 0) + 1;
		return counts;
	},

	// ─── Pièces jointes (stockage privé, hors public/) ───────────────────
	async saveSubmissionFile({ submissionId, ext, buffer }) {
		const name = `${submissionId}-${crypto.randomBytes(5).toString("hex")}.${ext}`;
		const abs = filesPathOf(name);
		await fs.mkdir(FILES_DIR, { recursive: true });
		await atomicWrite(abs, buffer);
		return name;
	},
};

// Ré-export pour les routes : contact et statut utilitaires.
export { contactOf };

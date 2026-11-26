import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createCollection, nowIso, sameId } from "./collection";
import { DATA_DIR, atomicWrite } from "./store";
import { ConflictError, NotFoundError } from "../errors";
import { normalizePhone } from "@/lib/recruitmentModel";
import { members } from "./members";

// Paiements manuels (Mobile Money) pour l'accès payant aux formations.
// Les captures sont stockées dans data/payment-files/ — hors public/, donc
// jamais servies publiquement (uniquement via la route admin).

const paymentsCol = createCollection("payments");

export const PAYMENT_FILES_DIR = path.join(DATA_DIR, "payment-files");
export function paymentFilePathOf(storagePath) {
	const clean = String(storagePath || "").replace(/\\/g, "/");
	if (!clean || clean.includes("\0") || clean.split("/").some((p) => p === ".." || p === "")) return null;
	const abs = path.resolve(PAYMENT_FILES_DIR, clean);
	return abs.startsWith(PAYMENT_FILES_DIR + path.sep) ? abs : null;
}

export const PAYMENT_STATUSES = {
	pending: "En attente",
	validated: "Validé",
	rejected: "Refusé",
};

const pickPayment = (p = {}) =>
	Object.fromEntries(
		[
			"courseId", "courseTitle", "amountFcfa", "firstName", "lastName", "phone",
			"email", "operator", "transactionRef", "screenshot", "status", "rejectReason",
			"memberId", "ip",
		]
			.filter((k) => p[k] !== undefined)
			.map((k) => [k, p[k]])
	);

export const payments = {
	async list({ status, q, sort = "newest", page = 1, pageSize = 20 } = {}) {
		let list = await paymentsCol.all();
		if (status) list = list.filter((p) => p.status === status);
		if (q) {
			const n = q.toLowerCase();
			list = list.filter((p) =>
				`${p.lastName} ${p.firstName} ${p.phone} ${p.transactionRef} ${p.courseTitle || ""}`.toLowerCase().includes(n)
			);
		}
		const dir = sort === "oldest" ? 1 : -1;
		list = [...list].sort((a, b) => dir * String(a.createdAt).localeCompare(String(b.createdAt)));
		const total = list.length;
		return { items: list.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
	},

	get: (id) => paymentsCol.get(id),

	async create(data, by = null) {
		// Anti-doublon : même référence de transaction refusée.
		const dup = (await paymentsCol.all()).find(
			(p) => String(p.transactionRef).trim().toLowerCase() === String(data.transactionRef).trim().toLowerCase()
		);
		if (dup) {
			throw new ConflictError(
				"Cette référence de transaction a déjà été envoyée. Si votre paiement n'est pas vérifié sous peu, contactez-nous."
			);
		}
		return paymentsCol.insert({
			...pickPayment(data),
			phone: normalizePhone(data.phone || "") || data.phone,
			email: data.email ? String(data.email).trim().toLowerCase() : null,
			status: "pending",
			createdAt: nowIso(),
			createdBy: by,
		});
	},

	/**
	 * Valide un paiement : ouvre l'accès à la formation et crée/retrouve le
	 * compte apprenant BLUE-EXT par téléphone. Renvoie { payment, member, code }
	 * — le code n'est affiché qu'une seule fois (bouton « Copier le message »).
	 */
	async validate(id, by = null) {
		const payment = await paymentsCol.get(id);
		if (!payment) throw new NotFoundError("Paiement introuvable.");
		if (payment.status !== "pending") throw new ConflictError("Ce paiement a déjà été traité.");

		// Compte apprenant : existant par téléphone, sinon création BLUE-EXT.
		let member = await members.getByPhone(payment.phone);
		if (!member) {
			member = await members.create(
				{
					kind: "external",
					firstName: payment.firstName,
					lastName: payment.lastName,
					phone: payment.phone,
					email: payment.email,
					status: "pending",
					origin: "payment",
				},
				by
			);
		}
		await members.grantAccess(member.id, payment.courseId, payment.id);

		// Un code d'accès est régénéré : l'ancien cesse de fonctionner et le
		// nouveau est affiché une seule fois côté admin.
		const { code } = await members.regenerateAccessCode(member.id);

		const updated = await paymentsCol.update(
			payment.id,
			{ status: "validated", memberId: member.id, decidedAt: nowIso(), decidedBy: by?.name || null },
			"Paiement introuvable."
		);
		return { payment: updated, member, code };
	},

	async reject(id, reason, by = null) {
		const payment = await paymentsCol.get(id);
		if (!payment) throw new NotFoundError("Paiement introuvable.");
		if (payment.status !== "pending") throw new ConflictError("Ce paiement a déjà été traité.");
		return paymentsCol.update(
			payment.id,
			{ status: "rejected", rejectReason: reason, decidedAt: nowIso(), decidedBy: by?.name || null },
			"Paiement introuvable."
		);
	},

	countPending: async () => (await paymentsCol.all()).filter((p) => p.status === "pending").length,

	// ─── Captures de paiement (stockage privé) ─────────────────────────────
	async saveScreenshot({ ext, buffer }) {
		const name = `pay-${Date.now().toString(36)}-${crypto.randomBytes(5).toString("hex")}.${ext}`;
		const abs = paymentFilePathOf(name);
		await fs.mkdir(PAYMENT_FILES_DIR, { recursive: true });
		await atomicWrite(abs, buffer);
		return name;
	},
};

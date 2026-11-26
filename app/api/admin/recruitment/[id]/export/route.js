import { recruitment, NotFoundError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { submissionFiltersSchema, searchParamsToObject } from "@/lib/validation";
import { SUBMISSION_STATUSES } from "@/lib/recruitmentModel";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// Export CSV des candidatures (BOM UTF-8 + séparateur « ; » pour Excel).
const csvCell = (v) => {
	let s = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
	if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
	return `"${s.replace(/"/g, '""')}"`;
};
const toCsv = (header, rows) => "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");

const answerText = (v) => {
	if (v == null) return "";
	if (Array.isArray(v)) return v.join(" | ");
	if (typeof v === "boolean") return v ? "Oui" : "Non";
	if (typeof v === "object") return v.name || "";
	return String(v);
};

export const GET = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await ctx.params;
	const form = await recruitment.get(id);
	if (!form) throw new NotFoundError("Recrutement introuvable.");

	const filters = submissionFiltersSchema.parse(searchParamsToObject(new URL(req.url).searchParams));
	const { items } = await recruitment.listSubmissions(id, { ...filters, pageSize: 100000 });

	// Colonnes : libellés des champs non-affichage + date + statut.
	const answerable = (form.fields || []).filter((f) => f.type !== "heading" && f.type !== "paragraph");
	const header = [
		...answerable.map((f) => f.label),
		"Date",
		"Statut",
	];
	const fmt = (iso) => (iso ? new Date(iso).toLocaleString("fr-FR", { timeZone: "UTC" }) : "");
	const rows = items.map((s) => [
		...answerable.map((f) => answerText(s.answers?.[f.id])),
		fmt(s.createdAt),
		SUBMISSION_STATUSES[s.status] || s.status,
	]);

	await logAdminAction({
		action: ACTIONS.EXPORT,
		module: MODULES.RECRUITMENT,
		target: `Candidatures « ${form.title} » (CSV)`,
		changes: [{ field: "Lignes exportées", from: null, to: String(rows.length) }],
	});

	const stamp = new Date().toISOString().slice(0, 10);
	return new Response(toCsv(header, rows), {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="blue-candidatures-${form.slug}-${stamp}.csv"`,
			"Cache-Control": "no-store",
		},
	});
});

import { NextResponse } from "next/server";
import { recruitment, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { submissionFiltersSchema, bulkStatusSchema, searchParamsToObject } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// GET → candidatures du recrutement (filtres, recherche, tri, pagination).
export const GET = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await ctx.params;
	const form = await recruitment.get(id);
	if (!form) throw new NotFoundError("Recrutement introuvable.");

	const filters = submissionFiltersSchema.parse(searchParamsToObject(new URL(req.url).searchParams));
	if (filters.all) filters.pageSize = 10000;
	return NextResponse.json(await recruitment.listSubmissions(id, filters));
});

// POST { ids, status } → changement de statut groupé.
export const POST = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await ctx.params;
	const form = await recruitment.get(id);
	if (!form) throw new NotFoundError("Recrutement introuvable.");

	const { ids, status } = await parseJson(req, bulkStatusSchema);
	const operator = await getOperator();
	let done = 0;
	for (const sid of ids) {
		const sub = await recruitment.getSubmission(sid);
		if (!sub || String(sub.formId) !== String(id)) continue;
		await recruitment.updateSubmission(sid, { status }, operator);
		done++;
	}
	await logAdminAction({
		action: ACTIONS.UPDATE,
		module: MODULES.RECRUITMENT,
		target: `Candidatures « ${form.title} »`,
		changes: [{ field: "Statut groupé", from: null, to: `${done} candidature(s) → ${status}` }],
	});
	return NextResponse.json({ ok: true, updated: done });
});

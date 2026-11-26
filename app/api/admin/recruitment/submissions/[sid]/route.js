import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { recruitment, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { submissionPatchSchema } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// GET → fiche détaillée (toutes les réponses + historique).
export const GET = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { sid } = await ctx.params;
	const sub = await recruitment.getSubmission(sid);
	if (!sub) throw new NotFoundError("Candidature introuvable.");
	const form = await recruitment.get(sub.formId);
	return NextResponse.json({ submission: sub, formTitle: form?.title || "", formSlug: form?.slug || "", fields: form?.fields || [] });
});

// PATCH { status?, note? } → changement de statut / note interne.
export const PATCH = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { sid } = await ctx.params;
	const before = await recruitment.getSubmission(sid);
	if (!before) throw new NotFoundError("Candidature introuvable.");

	const patch = await parseJson(req, submissionPatchSchema);
	const record = await recruitment.updateSubmission(sid, patch, await getOperator());
	const changes = [];
	if (patch.status && patch.status !== before.status) {
		changes.push({ field: "Statut", from: before.status, to: patch.status });
	}
	if ("note" in patch) changes.push({ field: "Note interne", from: null, to: "modifiée" });
	await logAdminAction({
		action: ACTIONS.UPDATE,
		module: MODULES.RECRUITMENT,
		target: `Candidature ${sid.slice(0, 8)}`,
		changes: changes.length ? changes : [{ field: "Candidature", from: null, to: "mise à jour" }],
	});
	return NextResponse.json(record);
});

export const DELETE = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { sid } = await ctx.params;
	const removed = await recruitment.removeSubmission(sid);
	await logAdminAction({
		action: ACTIONS.DELETE,
		module: MODULES.RECRUITMENT,
		target: `Candidature ${sid.slice(0, 8)}`,
		changes: [{ field: "Candidature", from: "supprimée", to: null }],
	});
	return NextResponse.json({ ok: true, removed: removed.id });
});

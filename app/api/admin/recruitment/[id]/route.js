import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { recruitment, NotFoundError, BadRequestError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { recruitmentUpdateSchema } from "@/lib/validation";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

const LABELS = {
	title: "Titre",
	slug: "Slug",
	type: "Type",
	typeOther: "Type personnalisé",
	summary: "Résumé",
	description: "Description",
	coverImage: "Image de couverture",
	location: "Lieu",
	confirmationMessage: "Message de confirmation",
	maxSubmissions: "Maximum de candidatures",
	position: "Ordre",
	featured: "Mis en avant",
	published: "Publication",
	hidden: "Masquage",
	visibleFrom: "Visible du",
	visibleUntil: "Visible jusqu'au",
	applyFrom: "Candidatures du",
	applyUntil: "Candidatures jusqu'au",
	fields: "Champs du formulaire",
	buttons: "Boutons-liens",
};

// La fenêtre de candidature doit rester dans la fenêtre d'apparition —
// contrôle sur les valeurs FUSIONNÉES (un PATCH partiel peut ne porter
// qu'une seule borne).
function checkWindows(merged) {
	const t = (v) => (v ? new Date(v).getTime() : null);
	const [vF, vU, aF, aU] = [t(merged.visibleFrom), t(merged.visibleUntil), t(merged.applyFrom), t(merged.applyUntil)];
	if (vF && vU && vF > vU) throw new BadRequestError("La fin d'apparition doit être après le début.");
	if (aF && aU && aF > aU) throw new BadRequestError("La clôture des candidatures doit être après l'ouverture.");
	if (aF && vF && aF < vF) throw new BadRequestError("L'ouverture des candidatures doit être dans la période d'apparition.");
	if (aU && vU && aU > vU) throw new BadRequestError("La clôture des candidatures doit être avant la fin d'apparition.");
}

export const GET = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await ctx.params;
	const form = await recruitment.get(id);
	if (!form) throw new NotFoundError("Recrutement introuvable.");
	return NextResponse.json(form);
});

export const PATCH = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;

	const { id } = await ctx.params;
	const before = await recruitment.get(id);
	if (!before) throw new NotFoundError("Recrutement introuvable.");

	const patch = await parseJson(req, recruitmentUpdateSchema);
	checkWindows({ ...before, ...patch });
	const record = await recruitment.update(before.id, patch, await getOperator());
	const changes = diffFields(before, record, LABELS);
	const toggled = "published" in patch && patch.published !== before.published;
	const hid = "hidden" in patch && patch.hidden !== before.hidden;
	await logAdminAction({
		action: toggled ? (record.published ? ACTIONS.PUBLISH : ACTIONS.UNPUBLISH) : hid ? ACTIONS.UPDATE : ACTIONS.UPDATE,
		module: MODULES.RECRUITMENT,
		target: `Recrutement « ${record.title} »`,
		changes: changes.length ? changes : [{ field: "Recrutement", from: null, to: "mis à jour" }],
	});
	revalidateTag("site-content");
	return NextResponse.json(record);
});

export const DELETE = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;

	const { id } = await ctx.params;
	const removed = await recruitment.remove(id);
	await logAdminAction({
		action: ACTIONS.DELETE,
		module: MODULES.RECRUITMENT,
		target: `Recrutement « ${removed.title} »`,
		changes: [{ field: "Recrutement", from: `/recrutement/${removed.slug}`, to: null }],
	});
	revalidateTag("site-content");
	return NextResponse.json({ ok: true });
});

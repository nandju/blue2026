import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { recruitment, NotFoundError, BadRequestError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// POST { action: "close" } → fixe la fin des candidatures à l'instant présent.
// POST { action: "reopen", applyUntil: "…" } → nouvelle date de clôture.
export const POST = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await ctx.params;
	const before = await recruitment.get(id);
	if (!before) throw new NotFoundError("Recrutement introuvable.");

	const body = await parseJson(
		req,
		z.object({
			action: z.enum(["close", "reopen"], { error: "Action invalide" }),
			applyUntil: z.string().trim().max(40).optional(),
		})
	);

	let patch;
	if (body.action === "close") {
		patch = { applyUntil: new Date().toISOString() };
	} else {
		const until = body.applyUntil ? new Date(body.applyUntil) : null;
		if (!until || Number.isNaN(until.getTime())) {
			throw new BadRequestError("Indiquez la nouvelle date de clôture des candidatures.");
		}
		const visUntil = before.visibleUntil ? new Date(before.visibleUntil) : null;
		if (visUntil && until > visUntil) {
			throw new BadRequestError("La clôture des candidatures doit être avant la fin d'apparition.");
		}
		if (until <= new Date()) {
			throw new BadRequestError("La nouvelle date de clôture doit être dans le futur.");
		}
		patch = { applyUntil: until.toISOString() };
	}

	const record = await recruitment.update(before.id, patch, await getOperator());
	await logAdminAction({
		action: ACTIONS.UPDATE,
		module: MODULES.RECRUITMENT,
		target: `Recrutement « ${record.title} »`,
		changes: [{ field: body.action === "close" ? "Candidatures" : "Réouverture", from: before.applyUntil || "—", to: record.applyUntil }],
	});
	revalidateTag("site-content");
	return NextResponse.json(record);
});

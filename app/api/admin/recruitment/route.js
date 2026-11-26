import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { recruitment } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { recruitmentCreateSchema } from "@/lib/validation";
import { starterFields, slugify } from "@/lib/recruitmentModel";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// GET → tous les recrutements (tous statuts, avec compteurs de candidatures).
export const GET = apiHandler(async () => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	return NextResponse.json(await recruitment.list());
});

// POST → création d'un recrutement (brouillon). fields omis → modèle de départ.
export const POST = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;

	const data = await parseJson(req, recruitmentCreateSchema);
	if (!data.fields) data.fields = starterFields();
	if (!data.slug) data.slug = slugify(data.title);

	const record = await recruitment.create(data, await getOperator());
	await logAdminAction({
		action: ACTIONS.CREATE,
		module: MODULES.RECRUITMENT,
		target: `Recrutement « ${record.title} »`,
		changes: [{ field: "Recrutement", from: null, to: `${record.title} (/recrutement/${record.slug})` }],
	});
	revalidateTag("site-content");
	return NextResponse.json(record, { status: 201 });
});

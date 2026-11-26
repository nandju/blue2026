import { NextResponse } from "next/server";
import { members } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { memberSchema, memberFiltersSchema, searchParamsToObject } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { missingForActive } from "@/lib/memberModel";

export const GET = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const filters = memberFiltersSchema.parse(searchParamsToObject(new URL(req.url).searchParams));
	const result = await members.list(filters);
	// Suggestion « passer en Actif » quand la règle est remplie.
	result.items = result.items.map((m) => ({
		...m,
		suggestActive: m.status !== "active" && m.kind !== "external" && !missingForActive(m),
	}));
	return NextResponse.json(result);
});

export const POST = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const data = await parseJson(req, memberSchema);
	const created = await members.create({ ...data, kind: "member" }, await getOperator());
	await logAdminAction({
		action: ACTIONS.CREATE,
		module: MODULES.MEMBERS,
		target: `${created.identifier} — ${created.firstName} ${created.lastName}`,
	});
	return NextResponse.json(created, { status: 201 });
});

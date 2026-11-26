import { NextResponse } from "next/server";
import { recruitment } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// POST → duplique un recrutement entier (brouillon, sans les candidatures).
export const POST = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await ctx.params;
	const record = await recruitment.duplicate(id, await getOperator());
	await logAdminAction({
		action: ACTIONS.CREATE,
		module: MODULES.RECRUITMENT,
		target: `Recrutement « ${record.title} »`,
		changes: [{ field: "Recrutement", from: `dupliqué depuis #${id}`, to: "brouillon" }],
	});
	return NextResponse.json(record, { status: 201 });
});

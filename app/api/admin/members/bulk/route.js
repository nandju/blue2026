import { NextResponse } from "next/server";
import { members } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { memberBulkSchema, memberImportSchema } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { MEMBER_STATUSES } from "@/lib/memberModel";

// Actions groupées : changement de statut en masse ou import de lignes CSV
// (déjà validées côté client ; dedoublonnage par téléphone côté domaine).
export const POST = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const body = await req.json();
	const operator = await getOperator();

	if (body.type === "import") {
		const { rows } = memberImportSchema.parse(body);
		const report = await members.importRows(rows, operator);
		await logAdminAction({
			action: ACTIONS.CREATE,
			module: MODULES.MEMBERS,
			target: `Import CSV : ${report.created} créés, ${report.skipped} ignorés, ${report.errors.length} erreurs`,
		});
		return NextResponse.json(report);
	}

	const { ids, status } = memberBulkSchema.parse(body);
	let updated = 0;
	for (const id of ids) {
		try {
			await members.update(id, { status }, operator);
			updated++;
		} catch { /* membre supprimé entre-temps : ignoré */ }
	}
	await logAdminAction({
		action: ACTIONS.UPDATE,
		module: MODULES.MEMBERS,
		target: `${updated} membre(s) → statut « ${MEMBER_STATUSES[status]?.label || status} »`,
	});
	return NextResponse.json({ updated });
});

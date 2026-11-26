import { NextResponse } from "next/server";
import { payments, NotFoundError, BadRequestError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { paymentDecisionSchema } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { accessMessage } from "@/lib/memberModel";
import { getSetting } from "@/lib/siteSettings.server";
import { headers } from "next/headers";

// Décision sur un paiement : valider (→ compte BLUE-EXT + accès + code
// affiché une seule fois) ou refuser (motif obligatoire).
export const POST = apiHandler(async (req, { params }) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await params;
	const { action, reason } = await parseJson(req, paymentDecisionSchema);
	const operator = await getOperator();

	const existing = await payments.get(id);
	if (!existing) throw new NotFoundError("Paiement introuvable.");

	if (action === "validate") {
		const { payment, member, code } = await payments.validate(id, operator);
		const { value: paySettings } = await getSetting("payments");
		const host = (await headers()).get("origin") || (await headers()).get("host") || "";
		const baseUrl = host.startsWith("http") ? host : `https://${host}`;
		await logAdminAction({
			action: ACTIONS.VALIDATE_PAYMENT,
			module: MODULES.MEMBERS,
			target: `${payment.transactionRef} → ${member.identifier} (${payment.courseTitle})`,
		});
		return NextResponse.json({
			payment,
			member,
			code,
			accessMessage: accessMessage(member, code, baseUrl, paySettings.accessMessageTemplate),
		});
	}

	if (!reason?.trim()) throw new BadRequestError("Le motif du refus est obligatoire.");
	const payment = await payments.reject(id, reason.trim(), operator);
	await logAdminAction({
		action: ACTIONS.REJECT,
		module: MODULES.MEMBERS,
		target: `${payment.transactionRef} — refusé : ${reason.trim()}`,
	});
	return NextResponse.json({ payment });
});

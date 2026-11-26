import { NextResponse } from "next/server";
import { payments } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { paymentFiltersSchema, searchParamsToObject } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { PAYMENT_STATUSES } from "@/lib/data/local/payments";

// Export CSV des paiements (BOM UTF-8 + séparateur « ; » pour Excel).
const csvCell = (v) => {
	let s = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
	if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
	return `"${s.replace(/"/g, '""')}"`;
};
const toCsv = (header, rows) => "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");

const OPERATORS = { orange: "Orange Money", mtn: "MTN MoMo", moov: "Moov Money", wave: "Wave" };

export const GET = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const filters = paymentFiltersSchema.parse(searchParamsToObject(new URL(req.url).searchParams));
	const { items } = await payments.list({ ...filters, pageSize: 100000 });

	const header = [
		"Date", "Formation", "Nom", "Prénom", "Téléphone", "Email",
		"Opérateur", "Référence", "Montant (FCFA)", "Statut", "Motif du refus",
		"Compte", "Traité le",
	];
	const rows = items.map((p) => [
		String(p.createdAt || "").slice(0, 16).replace("T", " "),
		p.courseTitle || "",
		p.lastName,
		p.firstName,
		p.phone,
		p.email || "",
		OPERATORS[p.operator] || p.operator || "",
		p.transactionRef,
		p.amountFcfa ?? "",
		PAYMENT_STATUSES[p.status] || p.status || "",
		p.rejectReason || "",
		p.memberId || "",
		p.decidedAt ? String(p.decidedAt).slice(0, 16).replace("T", " ") : "",
	]);
	await logAdminAction({ action: ACTIONS.EXPORT, module: MODULES.MEMBERS, target: `${items.length} paiement(s)` });
	return new NextResponse(toCsv(header, rows), {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="paiements-blue-${new Date().toISOString().slice(0, 10)}.csv"`,
			"Cache-Control": "no-store",
		},
	});
});

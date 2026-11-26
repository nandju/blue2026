import { NextResponse } from "next/server";
import { members } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { memberFiltersSchema, searchParamsToObject } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { MEMBER_STATUSES, MEMBER_ORIGINS, MEMBER_KINDS } from "@/lib/memberModel";

// Export CSV des membres (BOM UTF-8 + séparateur « ; » pour Excel).
const csvCell = (v) => {
	let s = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
	if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
	return `"${s.replace(/"/g, '""')}"`;
};
const toCsv = (header, rows) => "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");

export const GET = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const filters = memberFiltersSchema.parse(searchParamsToObject(new URL(req.url).searchParams));
	const { items } = await members.list({ ...filters, pageSize: 100000 });

	const header = [
		"Identifiant", "Nom", "Prénom", "Téléphone", "Email", "Commune",
		"Adhésion", "Statut", "Activités officielles", "T-shirt", "Département",
		"Type", "Origine", "Accès",
	];
	const rows = items.map((m) => [
		m.identifier,
		m.lastName,
		m.firstName,
		m.phone,
		m.email || "",
		m.commune || "",
		m.joinedAt ? String(m.joinedAt).slice(0, 10) : "",
		MEMBER_STATUSES[m.status]?.label || m.status || "",
		m.activitiesCount ?? 0,
		m.tshirt ? "Oui" : "Non",
		m.department || "",
		MEMBER_KINDS[m.kind || "member"] || "",
		MEMBER_ORIGINS[m.origin] || m.origin || "",
		m.accessDisabled ? "Désactivé" : "",
	]);
	await logAdminAction({ action: ACTIONS.EXPORT, module: MODULES.MEMBERS, target: `${items.length} membre(s)` });
	return new NextResponse(toCsv(header, rows), {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="membres-blue-${new Date().toISOString().slice(0, 10)}.csv"`,
			"Cache-Control": "no-store",
		},
	});
});

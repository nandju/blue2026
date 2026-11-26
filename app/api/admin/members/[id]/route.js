import { NextResponse } from "next/server";
import { members, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { memberPatchSchema } from "@/lib/validation";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { missingForActive } from "@/lib/memberModel";

const MEMBER_LABELS = {
	firstName: "Prénom",
	lastName: "Nom",
	phone: "Téléphone",
	email: "Email",
	commune: "Commune",
	joinedAt: "Date d'adhésion",
	status: "Statut",
	activitiesCount: "Activités officielles",
	tshirt: "T-shirt",
	department: "Département",
	notes: "Notes internes",
	origin: "Origine",
};

export const GET = apiHandler(async (req, { params }) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await params;
	const member = await members.get(id);
	if (!member) throw new NotFoundError("Membre introuvable.");
	return NextResponse.json({
		...member,
		suggestActive: member.status !== "active" && member.kind !== "external" && !missingForActive(member),
		missingForActive: missingForActive(member),
	});
});

export const PATCH = apiHandler(async (req, { params }) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await params;
	const updates = await parseJson(req, memberPatchSchema);
	const before = await members.get(id);
	if (!before) throw new NotFoundError("Membre introuvable.");
	const updated = await members.update(id, updates, await getOperator());
	await logAdminAction({
		action: ACTIONS.UPDATE,
		module: MODULES.MEMBERS,
		target: `${updated.identifier} — ${updated.firstName} ${updated.lastName}`,
		changes: diffFields(before, updates, MEMBER_LABELS),
	});
	return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (req, { params }) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await params;
	const removed = await members.remove(id);
	await logAdminAction({
		action: ACTIONS.DELETE,
		module: MODULES.MEMBERS,
		target: `${removed.identifier} — ${removed.firstName} ${removed.lastName}`,
	});
	return NextResponse.json({ ok: true });
});

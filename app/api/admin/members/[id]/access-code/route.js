import { NextResponse } from "next/server";
import { members, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { z } from "zod";
import { accessMessage } from "@/lib/memberModel";
import { getSetting } from "@/lib/siteSettings.server";
import { headers } from "next/headers";

const actionSchema = z.object({
	action: z.enum(["regenerate", "disable", "enable"], { error: "Action invalide" }),
});

// Gestion du code d'accès : régénérer (l'ancien cesse de fonctionner) ou
// désactiver/réactiver l'accès. Le nouveau code n'est affiché qu'UNE SEULE
// FOIS et n'est jamais journalisé.
export const POST = apiHandler(async (req, { params }) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { id } = await params;
	const { action } = await parseJson(req, actionSchema);
	const operator = await getOperator();

	const before = await members.get(id);
	if (!before) throw new NotFoundError("Membre introuvable.");

	if (action === "regenerate") {
		const { code, member } = await members.regenerateAccessCode(id);
		const { value: paySettings } = await getSetting("payments");
		const host = (await headers()).get("origin") || (await headers()).get("host") || "";
		const baseUrl = host.startsWith("http") ? host : `https://${host}`;
		await logAdminAction({
			action: ACTIONS.UPDATE,
			module: MODULES.MEMBERS,
			target: `${member.identifier} — code d'accès régénéré`,
		});
		return NextResponse.json({
			member,
			code,
			accessMessage: accessMessage(member, code, baseUrl, paySettings.accessMessageTemplate),
		});
	}

	const updated = await members.setAccessDisabled(id, action === "disable");
	await logAdminAction({
		action: ACTIONS.UPDATE,
		module: MODULES.MEMBERS,
		target: `${updated.identifier} — accès ${action === "disable" ? "désactivé" : "réactivé"}`,
	});
	return NextResponse.json({ member: updated });
});

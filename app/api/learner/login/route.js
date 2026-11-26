import { NextResponse } from "next/server";
import { apiHandler, parseJson, getClientIp } from "@/lib/apiHandler";
import { learnerLoginSchema } from "@/lib/validation";
import { members } from "@/lib/data";
import { setLearnerCookie } from "@/lib/learnerSession.server";
import {
	checkLearnerLoginAllowed, recordLearnerLoginFailure, resetLearnerLoginFailures,
} from "@/lib/learnerRateLimit.server";

// Connexion apprenant : identifiant BLUE + code à 6 chiffres.
// 5 échecs en 15 min bloquent le couple (IP, identifiant).
export const POST = apiHandler(async (req) => {
	const { identifier, code } = await parseJson(req, learnerLoginSchema);
	const ip = getClientIp(req);

	const check = checkLearnerLoginAllowed(ip, identifier);
	if (!check.allowed) {
		return NextResponse.json(
			{ error: `Trop de tentatives. Réessayez dans ${check.retryAfterSeconds} secondes.` },
			{ status: 429 }
		);
	}

	const result = await members.verifyAccessCode(identifier, code);
	if (!result.ok) {
		const { blocked } = recordLearnerLoginFailure(ip, identifier);
		const msg =
			result.reason === "disabled"
				? "Cet accès a été désactivé. Contactez l'équipe BLUE."
				: "Identifiant ou code incorrect.";
		return NextResponse.json(
			{ error: msg, blocked },
			{ status: result.reason === "disabled" ? 403 : 401 }
		);
	}

	resetLearnerLoginFailures(ip, identifier);
	await setLearnerCookie(result.member);
	const { accessCodeHash, ...member } = result.member;
	return NextResponse.json({ member });
});

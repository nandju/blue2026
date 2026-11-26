import { NextResponse } from "next/server";
import { courses, quizResults } from "@/lib/data";
import { apiHandler } from "@/lib/apiHandler";
import { getLearner } from "@/lib/learnerSession.server";
import { canAccess, paywallInfo } from "@/lib/accessRules";
import { stripCourseSecrets } from "@/lib/publicCourse";

// Décision d'accès à une formation pour le visiteur courant : membre actif,
// formation gratuite, paiement validé… ou paywall (3 choix / message).
export const GET = apiHandler(async (req, { params }) => {
	const { id } = await params;
	const course = await courses.get(id);
	if (!course) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });

	const learner = await getLearner();
	const access = canAccess(learner, course);
	const lastResult = learner ? await quizResults.getLatestForLearner(id, learner) : null;

	const { accessCodeHash, ...member } = learner || {};
	return NextResponse.json({
		learner: member ? { ...member, accessCodeHash: undefined } : null,
		course: stripCourseSecrets(course),
		access,
		paywall: access.allowed ? null : paywallInfo(learner, course),
		lastResult,
	});
});

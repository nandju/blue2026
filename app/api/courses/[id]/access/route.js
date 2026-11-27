import { NextResponse } from "next/server";
import { courses, quizResults, progress } from "@/lib/data";
import { apiHandler } from "@/lib/apiHandler";
import { getAdminSession } from "@/lib/apiAuth";
import { getLearner } from "@/lib/learnerSession.server";
import { canAccess, paywallInfo } from "@/lib/accessRules";
import { publicCourse } from "@/lib/publicCourse";
import { isPublished } from "@/lib/courseRules";

// Décision d'accès à une formation pour le visiteur courant : membre actif,
// formation gratuite, paiement validé… ou paywall (3 choix / message).
// Sans accès, le contenu réservé (modules, ressources, glossaire, PDF
// source) n'est jamais renvoyé.
export const GET = apiHandler(async (req, { params }) => {
	const { id } = await params;
	const course = await courses.get(id);
	// Brouillon : invisible publiquement ; l'admin connecté peut prévisualiser.
	if (!course || (!isPublished(course) && !(await getAdminSession()))) {
		return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
	}

	const learner = await getLearner();
	const access = canAccess(learner, course);
	const lastResult = learner ? await quizResults.getLatestForLearner(id, learner) : null;
	const learnerProgress = learner ? await progress.getForLearner(id, learner.id) : null;

	const { accessCodeHash, ...member } = learner || {};
	return NextResponse.json({
		learner: member ? { ...member, accessCodeHash: undefined } : null,
		course: publicCourse(course, { hasAccess: access.allowed }),
		access,
		paywall: access.allowed ? null : paywallInfo(learner, course),
		lastResult,
		progress: learnerProgress ? { modulesRead: learnerProgress.modules_read } : null,
	});
});

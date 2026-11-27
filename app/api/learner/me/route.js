import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getLearner } from "@/lib/learnerSession.server";
import { courses, quizResults, certificates, progress } from "@/lib/data";
import { canAccess, paywallInfo } from "@/lib/accessRules";
import { missingForActive } from "@/lib/memberModel";
import { publicCourse } from "@/lib/publicCourse";

// Profil de l'apprenant connecté : membre, accès, progression, certificats.
export const GET = apiHandler(async () => {
	const learner = await getLearner();
	if (!learner) return NextResponse.json({ learner: null }, { status: 401 });

	const allCourses = await courses.listPublished();
	const results = await quizResults.listByLearner(learner);
	const certs = await certificates.listByLearner(learner);
	const myProgress = await progress.listForLearner(learner.id);

	// Une entrée par formation : accès, progression, meilleur quiz, certificat.
	const myCourses = allCourses
		.map((c) => {
			const access = canAccess(learner, c);
			const my = results.filter((r) => String(r.course_id) === String(c.id));
			const best = my.sort((a, b) => (b.score || 0) - (a.score || 0))[0] || null;
			const cert = certs.find((x) => String(x.courseId) === String(c.id)) || null;
			const prog = myProgress.find((p) => String(p.course_id) === String(c.id));
			return {
				course: publicCourse(c, { hasAccess: access.allowed }),
				access: access.allowed ? access.reason : null,
				paywall: access.allowed ? null : paywallInfo(learner, c),
				lastResult: my[0] || null,
				bestResult: best,
				certificate: cert,
				progress: prog ? { modulesRead: prog.modules_read } : null,
			};
		})
		.filter((e) => e.access || e.lastResult || e.certificate || (e.course.price_fcfa || 0) > 0);

	const { accessCodeHash, ...member } = learner;
	return NextResponse.json({
		learner: { ...member, missingForActive: missingForActive(member) },
		courses: myCourses,
	});
});

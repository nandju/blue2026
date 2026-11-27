import { NextResponse } from "next/server";
import { z } from "zod";
import { courses, progress, NotFoundError } from "@/lib/data";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { getLearner } from "@/lib/learnerSession.server";

const markSchema = z.object({
	courseId: z.string().trim().min(1).max(100),
	moduleIndex: z.number().int().min(0).max(200),
});

// Progression de l'apprenant connecté — enregistrée sur son compte, pas dans
// le navigateur (le localStorage reste le repli pour les visiteurs anonymes).
export const GET = apiHandler(async (req) => {
	const learner = await getLearner();
	if (!learner) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
	const { searchParams } = new URL(req.url);
	const courseId = searchParams.get("courseId");
	if (courseId) {
		const rec = await progress.getForLearner(courseId, learner.id);
		return NextResponse.json({ modulesRead: rec?.modules_read || [] });
	}
	const all = await progress.listForLearner(learner.id);
	return NextResponse.json(Object.fromEntries(all.map((p) => [p.course_id, p.modules_read])));
});

export const POST = apiHandler(async (req) => {
	const learner = await getLearner();
	if (!learner) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
	const { courseId, moduleIndex } = await parseJson(req, markSchema);
	const course = await courses.get(courseId);
	if (!course) throw new NotFoundError("Formation introuvable");
	if (moduleIndex >= (course.sections || []).length) {
		return NextResponse.json({ error: "Module inexistant" }, { status: 400 });
	}
	const rec = await progress.markRead(courseId, learner.id, moduleIndex);
	return NextResponse.json({ modulesRead: rec.modules_read });
});

import { NextResponse } from "next/server";
import { quizResults, courses, NotFoundError } from "@/lib/data";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { quizResultSchema } from "@/lib/validation";
import { scoreQuiz } from "@/lib/academyRules";
import { getLearner } from "@/lib/learnerSession.server";
import { z } from "zod";

const querySchema = z.object({ courseId: z.string().min(1).max(100) });

// Le résultat de quiz n'est plus lisible publiquement : uniquement par
// l'apprenant connecté (sa propre progression), jamais via ?email=.
export const GET = apiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ courseId: searchParams.get("courseId") });
  if (!parsed.success) {
    return NextResponse.json({ error: "courseId requis" }, { status: 400 });
  }
  const learner = await getLearner();
  if (!learner) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  return NextResponse.json(await quizResults.getLatestForLearner(parsed.data.courseId, learner));
});

// Le score est recalculé côté serveur à partir des réponses : la valeur
// envoyée par le navigateur n'est jamais prise en compte.
export const POST = apiHandler(async (req) => {
  const { courseId, email, answers } = await parseJson(req, quizResultSchema);
  const course = await courses.get(courseId);
  if (!course) throw new NotFoundError("Formation introuvable");
  const learner = await getLearner();
  if (!learner && !email) {
    return NextResponse.json({ error: "Un email est requis pour enregistrer un résultat sans compte." }, { status: 400 });
  }
  const { score, correct, total, passed } = scoreQuiz(course.quiz || [], answers);
  const result = await quizResults.add({
    courseId,
    email: learner?.email || email,
    learnerId: learner?.id || null,
    score, correct, total, passed,
  });
  return NextResponse.json(result, { status: 201 });
});

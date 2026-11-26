import { NextResponse } from "next/server";
import { certificates, quizResults, courses, ForbiddenError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { certificateRequestSchema } from "@/lib/validation";
import { getLearner } from "@/lib/learnerSession.server";

export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await certificates.list());
});

// Une demande de certificat officiel n'est acceptée que si un quiz réussi
// est enregistré (apprenant connecté : son propre quiz ; sinon par email) ;
// le score et le titre proviennent du serveur.
export const POST = apiHandler(async (req) => {
  const body = await parseJson(req, certificateRequestSchema);
  const learner = await getLearner();
  if (!learner && !body.email) {
    return NextResponse.json({ error: "Un email est requis pour demander un certificat sans compte." }, { status: 400 });
  }
  const passed = learner
    ? await quizResults.getLatestPassedForLearner(body.courseId, learner)
    : await quizResults.getLatestPassed(body.courseId, body.email);
  if (!passed) {
    throw new ForbiddenError("Aucun quiz réussi n'est enregistré pour cette formation.");
  }
  const course = await courses.get(body.courseId);
  const created = await certificates.add({
    ...body,
    firstName: learner?.firstName || body.firstName,
    lastName: learner?.lastName || body.lastName,
    email: learner?.email || body.email,
    learnerId: learner?.id || null,
    courseTitle: course?.title || body.courseTitle || body.courseId,
    score: passed.score,
  });
  return NextResponse.json(created, { status: 201 });
});

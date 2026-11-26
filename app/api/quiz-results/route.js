import { NextResponse } from "next/server";
import { quizResults, courses, NotFoundError } from "@/lib/data";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { quizResultSchema } from "@/lib/validation";
import { scoreQuiz } from "@/lib/academyRules";
import { z } from "zod";

const querySchema = z.object({ courseId: z.string().min(1).max(100), email: z.string().trim().min(3).max(160) });

export const GET = apiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ courseId: searchParams.get("courseId"), email: searchParams.get("email") });
  if (!parsed.success) {
    return NextResponse.json({ error: "courseId et email requis" }, { status: 400 });
  }
  return NextResponse.json(await quizResults.getLatest(parsed.data.courseId, parsed.data.email));
});

// Le score est recalculé côté serveur à partir des réponses : la valeur
// envoyée par le navigateur n'est jamais prise en compte.
export const POST = apiHandler(async (req) => {
  const { courseId, email, answers } = await parseJson(req, quizResultSchema);
  const course = await courses.get(courseId);
  if (!course) throw new NotFoundError("Formation introuvable");
  const { score, correct, total, passed } = scoreQuiz(course.quiz || [], answers);
  const result = await quizResults.add({ courseId, email, score, correct, total, passed });
  return NextResponse.json(result, { status: 201 });
});

import { NextResponse } from "next/server";
import { courses } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { courseCreateSchema } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { stripCourseSecrets } from "@/lib/publicCourse";

export const GET = apiHandler(async () => {
  // Route publique : les bonnes réponses du quiz ne sont jamais exposées.
  return NextResponse.json((await courses.list()).map(stripCourseSecrets));
});

export const POST = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const course = await parseJson(req, courseCreateSchema);
  const created = await courses.create(course, await getOperator());
  await logAdminAction({
    action: ACTIONS.CREATE,
    module: MODULES.COURSES,
    target: created.title,
    changes: [
      { field: "Sections", from: null, to: created.sections },
      { field: "Questions du quiz", from: null, to: created.quiz },
    ],
  });
  return NextResponse.json(created, { status: 201 });
});

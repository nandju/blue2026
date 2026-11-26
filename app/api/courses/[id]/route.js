import { NextResponse } from "next/server";
import { courses, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { courseUpdateSchema } from "@/lib/validation";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

const COURSE_LABELS = {
  title: "Titre",
  description: "Description",
  category: "Catégorie",
  level: "Niveau",
  duration: "Durée",
  video: "Vidéo",
  sections: "Sections",
  resources: "Ressources",
  quiz: "Questions du quiz",
};

export const GET = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const course = await courses.get(id);
  if (!course) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  return NextResponse.json(course);
});

export const PATCH = apiHandler(async (req, { params }) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const updates = await parseJson(req, courseUpdateSchema);
  const before = await courses.get(id);
  if (!before) throw new NotFoundError("Formation introuvable");
  const updated = await courses.update(id, updates, await getOperator());
  await logAdminAction({
    action: ACTIONS.UPDATE,
    module: MODULES.COURSES,
    target: updated.title,
    changes: diffFields(before, updates, COURSE_LABELS),
  });
  return NextResponse.json(updated);
});

export const DELETE = apiHandler(async (req, { params }) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const removed = await courses.remove(id);
  await logAdminAction({ action: ACTIONS.DELETE, module: MODULES.COURSES, target: removed.title });
  return NextResponse.json({ ok: true });
});

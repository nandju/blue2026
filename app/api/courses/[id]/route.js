import { NextResponse } from "next/server";
import { courses, NotFoundError, BadRequestError } from "@/lib/data";
import { requireAdmin, getAdminSession, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { courseUpdateSchema } from "@/lib/validation";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { stripCourseSecrets } from "@/lib/publicCourse";
import { isPublished, publishBlockers } from "@/lib/courseRules";

const COURSE_LABELS = {
  title: "Titre",
  description: "Description",
  category: "Catégorie",
  level: "Niveau",
  duration: "Durée",
  video: "Vidéo",
  cover: "Image de couverture",
  status: "Statut",
  price_fcfa: "Prix non-membre",
  pass_threshold: "Seuil de réussite",
  quiz_duration_min: "Durée du quiz",
  sections: "Modules",
  resources: "Ressources",
  quiz: "Questions du quiz",
  objectives: "Objectifs",
  glossary: "Glossaire",
};

export const GET = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const course = await courses.get(id);
  // Brouillon : invisible publiquement ; un admin connecté peut prévisualiser.
  if (!course || (!isPublished(course) && !(await getAdminSession()))) {
    return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  }
  // Route publique : jamais les bonnes réponses ni les explications du quiz.
  return NextResponse.json(stripCourseSecrets(course));
});

export const PATCH = apiHandler(async (req, { params }) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const updates = await parseJson(req, courseUpdateSchema);
  const before = await courses.get(id);
  if (!before) throw new NotFoundError("Formation introuvable");

  // Publication : la formation fusionnée doit être complète (≥5 questions
  // avec bonne réponse, ≥1 module, titre).
  if (updates.status === "published" && !isPublished(before)) {
    const merged = { ...before, ...updates };
    const blockers = publishBlockers(merged);
    if (blockers.length) {
      throw new BadRequestError(`Publication impossible : ${blockers.join(" ")}`);
    }
  }

  const updated = await courses.update(id, updates, await getOperator());
  const action =
    updates.status === "published" && !isPublished(before)
      ? ACTIONS.PUBLISH
      : updates.status === "draft" && isPublished(before)
        ? ACTIONS.UNPUBLISH
        : ACTIONS.UPDATE;
  await logAdminAction({
    action,
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

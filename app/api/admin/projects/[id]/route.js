import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { projects, NotFoundError, ConflictError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { projectUpdateSchema } from "@/lib/validation";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

const LABELS = {
  title: "Titre",
  slug: "Slug",
  year: "Année",
  desc: "Description",
  tech: "Domaines",
  category: "Catégories",
  thumbnail: "Miniature",
  images: "Galerie",
  show: "Visibilité",
  preview: "Lien de prévisualisation",
  code: "Lien du code",
};

export const PATCH = apiHandler(async (req, ctx) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const before = await projects.get(id);
  if (!before) throw new NotFoundError("Projet introuvable.");

  const patch = await parseJson(req, projectUpdateSchema);
  if (patch.slug && patch.slug !== before.slug) {
    const other = await projects.get(patch.slug);
    if (other && String(other.id) !== String(before.id)) {
      throw new ConflictError(`Le slug « ${patch.slug} » est déjà utilisé par un autre projet.`);
    }
  }

  const record = await projects.update(before.id, patch, await getOperator());
  const changes = diffFields(before, record, LABELS);
  const toggled = "show" in patch && patch.show !== before.show;
  await logAdminAction({
    action: toggled ? (record.show ? ACTIONS.PUBLISH : ACTIONS.UNPUBLISH) : ACTIONS.UPDATE,
    module: MODULES.CONTENT,
    target: `Projet « ${record.title} »`,
    changes: changes.length ? changes : [{ field: "Projet", from: null, to: "mis à jour" }],
  });
  revalidateTag("site-content");
  return NextResponse.json(record);
});

export const DELETE = apiHandler(async (req, ctx) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const removed = await projects.remove(id);
  await logAdminAction({
    action: ACTIONS.DELETE,
    module: MODULES.CONTENT,
    target: `Projet « ${removed.title} »`,
    changes: [{ field: "Projet", from: `/${removed.slug}`, to: null }],
  });
  revalidateTag("site-content");
  return NextResponse.json({ ok: true });
});

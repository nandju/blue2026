import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { volunteers, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { volunteerPatchSchema } from "@/lib/validation";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { monthLabel } from "@/lib/volunteerModel";

const LABELS = {
  firstName: "Prénom",
  lastName: "Nom",
  location: "Localisation",
  photo: "Photo",
  actions: "Actions réalisées",
  contribution: "Contribution",
  month: "Mois concerné",
  published: "Publié",
  notifyEnabled: "Notification activée",
  showPopup: "Canal popup",
  showBanner: "Canal bannière",
  showPetals: "Canal pétales",
  notifyFrom: "Notification à partir du",
  notifyUntil: "Notification jusqu'au",
  popupDelayMs: "Délai de la popup",
  frequency: "Fréquence d'affichage",
  texts: "Textes personnalisés",
};

const displayName = (v) => `${v.firstName} ${v.lastName}`.trim();

export const PATCH = apiHandler(async (req, ctx) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const before = await volunteers.get(id);
  if (!before) throw new NotFoundError("Bénévole introuvable.");

  const patch = await parseJson(req, volunteerPatchSchema);
  const otherPublished = (await volunteers.list()).filter((v) => v.published && String(v.id) !== String(id));
  const record = await volunteers.update(id, patch, await getOperator());
  // La publication de cette fiche a retiré celle des autres.
  const unpublished = record.published && "published" in patch ? otherPublished.map(displayName) : [];

  const changes = diffFields(before, record, LABELS);
  const toggled = "published" in patch && patch.published !== before.published;
  await logAdminAction({
    action: toggled ? (record.published ? ACTIONS.PUBLISH : ACTIONS.UNPUBLISH) : ACTIONS.UPDATE,
    module: MODULES.VOLUNTEER,
    target: `${displayName(record)}${record.month ? ` — ${monthLabel(record.month)}` : ""}`,
    changes: changes.length ? changes : [{ field: "Fiche", from: null, to: "mise à jour" }],
  });
  revalidateTag("site-content");
  return NextResponse.json({ record, unpublished });
});

export const DELETE = apiHandler(async (req, ctx) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const removed = await volunteers.remove(id);
  await logAdminAction({
    action: ACTIONS.DELETE,
    module: MODULES.VOLUNTEER,
    target: `${displayName(removed)}${removed.month ? ` — ${monthLabel(removed.month)}` : ""}`,
    changes: [{ field: "Fiche", from: "existante", to: null }],
  });
  revalidateTag("site-content");
  return NextResponse.json({ ok: true });
});

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { volunteers } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { volunteerSchema } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { monthLabel } from "@/lib/volunteerModel";

// GET → toutes les fiches (publiées et brouillons), triées par mois.
export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await volunteers.list());
});

// POST → création d'une fiche. Si publiée, dépublie les autres automatiquement.
export const POST = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await parseJson(req, volunteerSchema);
  const beforePublished = (await volunteers.list()).filter((v) => v.published).map((v) => `${v.firstName} ${v.lastName}`);
  const record = await volunteers.create(body, await getOperator());
  // Publier cette fiche a retiré la publication des autres.
  const unpublished = record.published ? beforePublished : [];

  await logAdminAction({
    action: record.published ? ACTIONS.PUBLISH : ACTIONS.CREATE,
    module: MODULES.VOLUNTEER,
    target: `${record.firstName} ${record.lastName}${record.month ? ` — ${monthLabel(record.month)}` : ""}`,
    changes: [{ field: "Fiche", from: null, to: record.published ? "créée et publiée" : "créée (brouillon)" }],
  });
  revalidateTag("site-content");
  return NextResponse.json({ record, unpublished }, { status: 201 });
});

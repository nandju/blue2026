import { NextResponse } from "next/server";
import { volunteers } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { volunteerSchema } from "@/lib/validation";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import seedVolunteers from "@/lib/data/seed/volunteers.json";

const VOLUNTEER_LABELS = {
  firstName: "Prénom",
  lastName: "Nom",
  location: "Localisation",
  photo: "Photo",
  actions: "Actions réalisées",
  contribution: "Contribution",
  active: "Affiché sur le site",
};

// Lecture publique : en cas d'erreur de lecture, on renvoie la fiche par
// défaut pour que le site s'affiche comme avant.
export async function GET() {
  try {
    return NextResponse.json(await volunteers.getCurrent());
  } catch (e) {
    console.error("[volunteer]", e.message);
    return NextResponse.json(seedVolunteers[0] || null);
  }
}

export const PUT = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await parseJson(req, volunteerSchema);
  const before = await volunteers.getCurrent();
  const updated = await volunteers.setCurrent(body, await getOperator());
  const changes = diffFields(before || {}, body, VOLUNTEER_LABELS);
  const publishChange = before && before.active !== body.active;
  await logAdminAction({
    action: publishChange ? (body.active ? ACTIONS.PUBLISH : ACTIONS.UNPUBLISH) : ACTIONS.UPDATE,
    module: MODULES.VOLUNTEER,
    target: `${updated.firstName} ${updated.lastName}`,
    changes,
  });
  return NextResponse.json(updated);
});

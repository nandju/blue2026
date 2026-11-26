import { NextResponse } from "next/server";
import { volunteers, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { monthLabel } from "@/lib/volunteerModel";

// POST → duplique la fiche en brouillon (mois vidé pour éviter le conflit).
export const POST = apiHandler(async (req, ctx) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const source = await volunteers.get(id);
  if (!source) throw new NotFoundError("Bénévole introuvable.");

  const record = await volunteers.create(
    {
      firstName: source.firstName,
      lastName: source.lastName,
      location: source.location,
      photo: source.photo,
      actions: source.actions,
      contribution: source.contribution,
      month: null, // à choisir — un seul bénévole par mois
      published: false,
      notifyEnabled: source.notifyEnabled,
      showPopup: source.showPopup,
      showBanner: source.showBanner,
      showPetals: source.showPetals,
      notifyFrom: null,
      notifyUntil: null,
      popupDelayMs: source.popupDelayMs,
      frequency: source.frequency,
      texts: source.texts,
    },
    await getOperator()
  );

  await logAdminAction({
    action: ACTIONS.CREATE,
    module: MODULES.VOLUNTEER,
    target: `${record.firstName} ${record.lastName} (copie de ${monthLabel(source.month) || "la fiche"})`,
    changes: [{ field: "Fiche", from: null, to: "dupliquée en brouillon" }],
  });
  return NextResponse.json({ record }, { status: 201 });
});

import { NextResponse } from "next/server";
import { volunteers, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// POST → incrémente la version de la notification : la clé de stockage des
// navigateurs change, tous les visiteurs revoient la popup/bannière.
export const POST = apiHandler(async (req, ctx) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const before = await volunteers.get(id);
  if (!before) throw new NotFoundError("Bénévole introuvable.");

  const record = await volunteers.update(id, { notifyVersion: (before.notifyVersion || 1) + 1 }, await getOperator());
  await logAdminAction({
    action: ACTIONS.PUBLISH,
    module: MODULES.VOLUNTEER,
    target: `${record.firstName} ${record.lastName}`,
    changes: [{ field: "Notification", from: `version ${before.notifyVersion || 1}`, to: `version ${record.notifyVersion}` }],
  });
  return NextResponse.json({ record });
});

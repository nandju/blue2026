import { NextResponse } from "next/server";
import { settings } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { departmentsSchema } from "@/lib/validation";
import { getSetting } from "@/lib/siteSettings.server";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { DEFAULT_SETTINGS } from "@/lib/data/defaults";

export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json({ ...(await getSetting("departments")), defaultValue: DEFAULT_SETTINGS.departments });
});

export const PUT = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { departments } = await parseJson(req, departmentsSchema);
  const before = await getSetting("departments");
  const operator = await getOperator();
  const reset = departments === null;
  if (reset) await settings.reset("departments", operator);
  else await settings.set("departments", departments, operator);

  await logAdminAction({
    action: reset ? ACTIONS.RESET : ACTIONS.UPDATE,
    module: MODULES.WEBMASTER,
    target: "Départements (connexion admin)",
    changes: [{ field: "Départements", from: before.value.join(", "), to: (reset ? DEFAULT_SETTINGS.departments : departments).join(", ") }],
  });
  return NextResponse.json({ ...(await getSetting("departments")), defaultValue: DEFAULT_SETTINGS.departments });
});

import { NextResponse } from "next/server";
import { adminLog } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { getDepartments } from "@/lib/siteSettings.server";
import { ACTION_LIST, MODULE_LIST } from "@/lib/adminLogConstants";

// Valeurs proposées dans les filtres du journal.
export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const facets = await adminLog.facets();
  const merge = (a, b) => [...new Set([...a, ...b])];
  return NextResponse.json({
    names: facets.names,
    departments: merge((await getDepartments()).filter((d) => d !== "Autre"), facets.departments),
    modules: merge(MODULE_LIST, facets.modules),
    actions: merge(ACTION_LIST, facets.actions),
  });
});

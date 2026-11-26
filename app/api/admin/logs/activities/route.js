import { NextResponse } from "next/server";
import { adminLog } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { logFiltersSchema, searchParamsToObject } from "@/lib/validation";

export const GET = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const filters = logFiltersSchema.parse(searchParamsToObject(new URL(req.url).searchParams));
  return NextResponse.json(await adminLog.listActivities(filters));
});

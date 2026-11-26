import { NextResponse } from "next/server";
import { payments } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { paymentFiltersSchema, searchParamsToObject } from "@/lib/validation";

export const GET = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const filters = paymentFiltersSchema.parse(searchParamsToObject(new URL(req.url).searchParams));
	const result = await payments.list(filters);
	return NextResponse.json({ ...result, pendingCount: await payments.countPending() });
});

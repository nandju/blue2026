import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { clearLearnerCookie } from "@/lib/learnerSession.server";

export const POST = apiHandler(async () => {
	await clearLearnerCookie();
	return NextResponse.json({ ok: true });
});

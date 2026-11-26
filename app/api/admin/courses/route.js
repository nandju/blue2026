import { NextResponse } from "next/server";
import { courses } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";

// Formations complètes (réponses du quiz incluses) — réservé à l'admin.
// Les GET publics de /api/courses ne renvoient jamais les bonnes réponses.
export const GET = apiHandler(async () => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	return NextResponse.json(await courses.list());
});

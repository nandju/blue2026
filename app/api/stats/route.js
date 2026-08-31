import { NextResponse } from "next/server";
import { getStatsServer } from "@/lib/db/stats.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const stats = await getStatsServer();
  return NextResponse.json(stats);
}

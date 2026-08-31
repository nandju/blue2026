import { NextResponse } from "next/server";
import { getChatStatsServer } from "@/lib/db/chat.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const stats = await getChatStatsServer();
  return NextResponse.json(stats);
}

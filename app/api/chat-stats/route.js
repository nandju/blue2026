import { NextResponse } from "next/server";
import { chat } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await chat.stats());
});

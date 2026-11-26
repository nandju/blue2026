import { NextResponse } from "next/server";
import { media, NotFoundError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async (req, { params }) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const item = await media.get(id);
  if (!item) throw new NotFoundError("Média introuvable");
  return NextResponse.json({ usages: await media.findUsages(item.url) });
});

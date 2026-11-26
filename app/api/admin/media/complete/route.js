import { NextResponse } from "next/server";
import { media } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// Étape finale d'un envoi par URL signée (phase 7 — Supabase Storage).
// En mode local, le pilote répond 400 : l'envoi direct est utilisé.
export const POST = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const record = await media.completeSignedUpload({ ...body, uploadedBy: await getOperator() });
  await logAdminAction({ action: ACTIONS.UPLOAD, module: MODULES.MEDIA, target: record?.originalName });
  return NextResponse.json(record, { status: 201 });
});

import { NextResponse } from "next/server";
import { media, BadRequestError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { uploadTargetSchema } from "@/lib/validation";
import { validateFileMeta } from "@/lib/uploadLimits";

// Étape 1 de tout envoi : vérifie les limites et indique où envoyer le fichier.
// - mode "direct" (local) : POST multipart vers /api/admin/media
// - mode "signed" (Supabase Storage, phase 7) : PUT vers l'URL signée, puis
//   POST /api/admin/media/complete pour enregistrer le média.
export const POST = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const meta = await parseJson(req, uploadTargetSchema);
  const error = validateFileMeta(meta.type, meta);
  if (error) throw new BadRequestError(error);
  return NextResponse.json(await media.createUploadTarget(meta));
});

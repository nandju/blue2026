import { NextResponse } from "next/server";
import { media, BadRequestError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { mediaFolderSchema, mediaTypeSchema } from "@/lib/validation";
import { UPLOAD_LIMITS, MIME_TO_EXT, sniffMime, validateFileMeta } from "@/lib/uploadLimits";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

export const GET = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const filters = {
    type: searchParams.get("type") || undefined,
    folder: searchParams.get("folder") || undefined,
    q: searchParams.get("q") || undefined,
    url: searchParams.get("url") || undefined,
  };
  return NextResponse.json(await media.list(filters));
});

// Envoi direct (mode local). En phase 7, les fichiers iront directement dans
// Supabase Storage via une URL signée (voir ./upload-target et ./complete).
export const POST = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  let form;
  try {
    form = await req.formData();
  } catch {
    throw new BadRequestError("Envoi invalide : formulaire multipart attendu.");
  }
  const file = form.get("file");
  if (!file || typeof file === "string") throw new BadRequestError("Aucun fichier reçu.");

  const type = mediaTypeSchema.parse(form.get("type"));
  const folder = mediaFolderSchema.parse(form.get("folder") || "general");

  const metaError = validateFileMeta(type, { name: file.name, size: file.size, mime: file.type });
  if (metaError) throw new BadRequestError(metaError);

  const buffer = Buffer.from(await file.arrayBuffer());
  const realMime = sniffMime(buffer.subarray(0, 16));
  if (!realMime || !UPLOAD_LIMITS[type].mimes.includes(realMime)) {
    throw new BadRequestError(`Le contenu du fichier ne correspond pas à un format autorisé (${UPLOAD_LIMITS[type].formats}).`);
  }

  const intOrNull = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.round(Number(v)) : null);
  const { storagePath, url } = await media.saveFile({ folder, ext: MIME_TO_EXT[realMime], buffer });
  const record = await media.create({
    type,
    folder,
    url,
    storagePath,
    originalName: String(form.get("originalName") || file.name).slice(0, 200),
    mime: realMime,
    size: buffer.length,
    width: intOrNull(form.get("width")),
    height: intOrNull(form.get("height")),
    alt: String(form.get("alt") || "").slice(0, 300),
    uploadedBy: await getOperator(),
  });

  await logAdminAction({
    action: ACTIONS.UPLOAD,
    module: MODULES.MEDIA,
    target: record.originalName,
    changes: [{ field: "Fichier", from: null, to: `${record.url} (${type})` }],
  });
  return NextResponse.json(record, { status: 201 });
});

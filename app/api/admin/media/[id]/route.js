import { NextResponse } from "next/server";
import { media, NotFoundError, ConflictError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// Suppression : refusée (409 + liste des utilisations) si le fichier est
// utilisé quelque part, sauf confirmation explicite (?force=1).
export const DELETE = apiHandler(async (req, { params }) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const force = new URL(req.url).searchParams.get("force") === "1";
  const item = await media.get(id);
  if (!item) throw new NotFoundError("Média introuvable");

  const usages = await media.findUsages(item.url);
  if (usages.length && !force) {
    throw new ConflictError("Ce fichier est utilisé sur le site. Confirmez pour le supprimer quand même.", { usages });
  }

  await media.remove(id);
  await media.deleteFile(item.storagePath);
  await logAdminAction({
    action: ACTIONS.DELETE,
    module: MODULES.MEDIA,
    target: item.originalName,
    changes: [
      { field: "Fichier", from: item.url, to: null },
      ...(usages.length ? [{ field: "Utilisé dans", from: usages.map((u) => u.label).join(", "), to: "Supprimé malgré l'avertissement" }] : []),
    ],
  });
  return NextResponse.json({ ok: true });
});

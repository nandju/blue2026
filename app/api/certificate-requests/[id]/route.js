import { NextResponse } from "next/server";
import { certificates, NotFoundError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { certificateStatusSchema } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

const STATUS_LABELS = { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" };
const STATUS_ACTIONS = { approved: ACTIONS.APPROVE, rejected: ACTIONS.REJECT, pending: ACTIONS.UPDATE };

export const PATCH = apiHandler(async (req, { params }) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const { status } = await parseJson(req, certificateStatusSchema);
  const before = await certificates.get(id);
  if (!before) throw new NotFoundError("Demande de certificat introuvable");
  const updated = await certificates.update(id, { status }, await getOperator());
  await logAdminAction({
    action: STATUS_ACTIONS[status],
    module: MODULES.COURSES,
    target: `Certificat officiel — ${updated.firstName} ${updated.lastName} (${updated.courseTitle})`,
    changes: [{ field: "Statut", from: STATUS_LABELS[before.status], to: STATUS_LABELS[status] }],
  });
  return NextResponse.json(updated);
});

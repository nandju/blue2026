import { adminLog } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { logFiltersSchema, searchParamsToObject } from "@/lib/validation";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { changesToText, formatLogDate, formatLogTime, sessionEnd } from "@/lib/adminLogFormat";
import { z } from "zod";

// Export CSV (séparateur « ; » et BOM UTF-8 pour une ouverture correcte dans Excel).
const csvCell = (v) => {
  let s = String(v ?? "");
  // Empêche l'interprétation de formules par le tableur (injection CSV).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
const toCsv = (header, rows) => "\uFEFF" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");

export const GET = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const params = searchParamsToObject(new URL(req.url).searchParams);
  const type = z.enum(["logins", "activities"]).parse(params.type);
  const filters = { ...logFiltersSchema.parse(params), all: true };

  let csv;
  let count;
  if (type === "logins") {
    const { items } = await adminLog.listLogins(filters);
    count = items.length;
    csv = toCsv(
      ["Date", "Heure", "Nom", "Département", "Email", "Résultat", "Motif", "IP", "Navigateur", "Système", "Appareil", "Fin de session"],
      items.map((l) => [
        formatLogDate(l.at), formatLogTime(l.at), l.name, l.department, l.email,
        l.success ? "Réussie" : "Échouée", l.reason || "", l.ip, l.browser, l.os, l.device, sessionEnd(l),
      ])
    );
  } else {
    const { items } = await adminLog.listActivities(filters);
    count = items.length;
    csv = toCsv(
      ["Date", "Heure", "Nom", "Département", "Action", "Module", "Élément", "Modifications"],
      items.map((a) => [formatLogDate(a.at), formatLogTime(a.at), a.name, a.department, a.action, a.module, a.target, changesToText(a.changes)])
    );
  }

  await logAdminAction({
    action: ACTIONS.EXPORT,
    module: MODULES.JOURNAL,
    target: type === "logins" ? "Journal des connexions (CSV)" : "Journal des activités (CSV)",
    changes: [{ field: "Lignes exportées", from: null, to: String(count) }],
  });

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="blue-journal-${type === "logins" ? "connexions" : "activites"}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});

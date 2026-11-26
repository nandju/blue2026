import "server-only";
import { adminLog } from "@/lib/data";
import { getAdminSession } from "@/lib/apiAuth";

const MAX_VALUE_LENGTH = 120;

/** Résumé lisible et tronqué d'une valeur pour le journal. */
export function summarizeValue(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (Array.isArray(v)) return `${v.length} élément${v.length > 1 ? "s" : ""}`;
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > MAX_VALUE_LENGTH ? `${flat.slice(0, MAX_VALUE_LENGTH)}…` : flat;
}

/**
 * Compare deux objets sur les champs listés et renvoie les changements.
 * @param labels { cléTechnique: "Libellé lisible" }
 */
export function diffFields(before = {}, after = {}, labels = {}) {
  const changes = [];
  for (const [key, label] of Object.entries(labels)) {
    if (!(key in after)) continue;
    const a = before?.[key];
    const b = after[key];
    if (JSON.stringify(a ?? null) === JSON.stringify(b ?? null)) continue;
    changes.push({ field: label, from: summarizeValue(a), to: summarizeValue(b) });
  }
  return changes;
}

/**
 * Enregistre une action d'écriture de l'admin. L'opérateur (nom, département)
 * est lu automatiquement dans la session. Ne lève jamais d'erreur : un échec
 * d'écriture du journal ne doit pas annuler l'action déjà effectuée.
 */
export async function logAdminAction({ action, module, target, changes = [] }) {
  try {
    const session = await getAdminSession();
    await adminLog.addActivity({
      name: session?.name || "Inconnu",
      department: session?.department || "—",
      email: session?.email || null,
      loginId: session?.loginId || null,
      action,
      module,
      target: summarizeValue(target),
      changes: (changes || []).map((c) => ({
        field: String(c.field),
        from: summarizeValue(c.from),
        to: summarizeValue(c.to),
      })),
    });
  } catch (e) {
    console.error("[journal] Impossible d'enregistrer l'action :", e.message);
  }
}

import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { settings } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { SETTING_SCHEMAS, settingPutSchema } from "@/lib/validation";
import { FONT_IDS } from "@/lib/content/fonts";
import { DEFAULT_SETTINGS } from "@/lib/data/defaults";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { BadRequestError } from "@/lib/data/errors";

const SETTING_LABELS = {
  identity: "Identité du site",
  contact: "Coordonnées",
  socials: "Réseaux sociaux",
  fonts: "Typographie",
  colors: "Couleurs",
};

const mergedValue = (key, entry) =>
  !entry || entry.isDefault || entry.value == null
    ? DEFAULT_SETTINGS[key]
    : { ...DEFAULT_SETTINGS[key], ...entry.value };

const out = (key, entry) => ({
  value: mergedValue(key, entry),
  isDefault: !entry || !!entry.isDefault,
  updatedAt: entry?.updatedAt || null,
  updatedBy: entry?.updatedBy || null,
  defaultValue: DEFAULT_SETTINGS[key],
});

// GET → { settings: { identity, contact, socials, fonts, colors } }
export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const entries = await settings.getAll();
  const result = {};
  for (const key of Object.keys(SETTING_SCHEMAS)) result[key] = out(key, entries[key]);
  return NextResponse.json({ settings: result });
});

// PUT { key, value|null } — value=null rétablit le bloc par défaut.
export const PUT = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { key, value } = await parseJson(req, settingPutSchema);
  let clean = null;
  if (value !== null) {
    clean = SETTING_SCHEMAS[key].parse(value);
    if (key === "fonts" && (!FONT_IDS.includes(clean.heading) || !FONT_IDS.includes(clean.body))) {
      throw new BadRequestError("Police inconnue.");
    }
  }

  const before = await settings.get(key);
  const operator = await getOperator();
  if (clean === null) await settings.reset(key, operator);
  else await settings.set(key, clean, operator);

  const beforeMerged = mergedValue(key, before);
  const afterMerged = clean === null ? DEFAULT_SETTINGS[key] : { ...DEFAULT_SETTINGS[key], ...clean };
  const labels = Object.fromEntries(Object.keys(afterMerged).map((k) => [k, k]));
  await logAdminAction({
    action: clean === null ? ACTIONS.RESET : ACTIONS.UPDATE,
    module: MODULES.WEBMASTER,
    target: SETTING_LABELS[key] || key,
    changes: diffFields(beforeMerged, afterMerged, labels),
  });

  revalidateTag("site-content");
  return NextResponse.json({ key, ...out(key, await settings.get(key)) });
});

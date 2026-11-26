import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { content } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { BadRequestError } from "@/lib/data/errors";
import { contentPutSchema, homeLayoutSchema, validateSectionOverrides } from "@/lib/content/validate";
import { mergeSection, mergeAllContent, defaultSection } from "@/lib/content/merge";
import { CONTENT_PAGES, sectionSchema } from "@/lib/content/schemas";
import { DEFAULT_CONTENT } from "@/lib/content/defaults";
import { logAdminAction, diffFields } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

const VALID_PAGES = CONTENT_PAGES.map((p) => p.id);
const layoutIds = () => Object.keys(DEFAULT_CONTENT.home).filter((s) => s !== "layout");

const entryOut = (entry, value, defaultValue) => ({
  value,
  overrides: entry && !entry.isDefault ? entry.value : null,
  isDefault: !entry || !!entry.isDefault,
  updatedAt: entry?.updatedAt || null,
  updatedBy: entry?.updatedBy || null,
  defaultValue,
});

// GET → { sections: { "page.section": { value, overrides, isDefault, updatedAt, updatedBy, defaultValue } } }
export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const entries = await content.getAll();
  const merged = mergeAllContent(entries);
  const sections = {};
  for (const [pageId, page] of Object.entries(DEFAULT_CONTENT)) {
    for (const sectionId of Object.keys(page)) {
      const key = `${pageId}.${sectionId}`;
      sections[key] = entryOut(entries[key], merged[pageId][sectionId], DEFAULT_CONTENT[pageId][sectionId]);
    }
  }
  return NextResponse.json({ sections });
});

// PUT { page, section, value|null } — value=null rétablit la section par défaut.
export const PUT = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { page, section, value } = await parseJson(req, contentPutSchema);
  if (!VALID_PAGES.includes(page)) throw new BadRequestError("Page inconnue.");
  const key = `${page}.${section}`;
  if (!(page in DEFAULT_CONTENT) || !(section in DEFAULT_CONTENT[page])) {
    throw new BadRequestError("Section inconnue.");
  }

  let clean = null;
  if (value !== null) {
    if (page === "home" && section === "layout") {
      const layout = homeLayoutSchema.parse(value);
      const known = layoutIds();
      if (layout.order.some((s) => !known.includes(s)) || layout.hidden.some((s) => !known.includes(s))) {
        throw new BadRequestError("Sections inconnues dans la mise en page.");
      }
      clean = layout;
    } else {
      clean = validateSectionOverrides(page, section, value);
    }
  }

  const before = await content.get(key);
  const operator = await getOperator();
  if (value === null) await content.reset(key, operator);
  else await content.set(key, clean, operator);

  // Journal : diff lisible sur les valeurs fusionnées, par champ du schéma.
  const schema = sectionSchema(page, section);
  const beforeMerged = mergeSection(page, section, before?.isDefault ? {} : before?.value || {});
  const afterMerged = mergeSection(page, section, clean || {});
  const labels = schema
    ? Object.fromEntries(schema.fields.map((f) => [(f.path || f.key).split(".")[0], f.label || f.key]))
    : { order: "Ordre des sections", hidden: "Sections masquées" };
  const changes = diffFields(beforeMerged, afterMerged, labels);

  const pageLabel = CONTENT_PAGES.find((p) => p.id === page)?.label || page;
  const sectionLabel = schema?.label || (section === "layout" ? "Ordre & visibilité" : section);
  await logAdminAction({
    action: value === null ? ACTIONS.RESET : ACTIONS.UPDATE,
    module: MODULES.CONTENT,
    target: `${pageLabel} — ${sectionLabel}`,
    changes,
  });

  revalidateTag("site-content");
  const entry = await content.get(key);
  const merged = mergeSection(page, section, entry?.isDefault ? {} : entry?.value || {});
  return NextResponse.json({ key, ...entryOut(entry, merged, DEFAULT_CONTENT[page][section]) });
});

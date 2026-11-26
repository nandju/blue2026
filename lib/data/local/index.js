import "server-only";
import projectsData from "@/json/data.json";
import seedVolunteers from "../seed/volunteers.json";
import { createCollection, createCrudDomain, createKeyValueDomain, nowIso, sameId } from "./collection";
import { normalizeVolunteer } from "@/lib/volunteerModel";
import { ConflictError, NotFoundError } from "../errors";

export { courses, registrations, quizResults, certificates } from "./academy";
export { chat } from "./chat";
export { adminLog } from "./adminLog";
export { media } from "./media";
export { adminAccount } from "./adminAccount";
export { recruitment } from "./recruitment";
export { members } from "./members";
export { payments } from "./payments";

export const content = createKeyValueDomain("content");
export const settings = createKeyValueDomain("settings");

// Projets : amorcés depuis json/data.json (identifiant = slug).
export const projects = createCrudDomain("projects", {
  idType: "string",
  seed: () => projectsData.Projects.map((p) => ({ id: p.slug, ...p })),
});

// Bénévoles du mois (v2) : plusieurs fiches, une seule publiée à la fois.
// Les anciens enregistrements (`active`) sont normalisés à la lecture.
const volunteersCol = createCollection("volunteers", { seed: seedVolunteers });

const VOLUNTEER_FIELDS = [
  "firstName", "lastName", "location", "photo", "actions", "contribution", "month",
  "published", "notifyEnabled", "showPopup", "showBanner", "showPetals",
  "notifyFrom", "notifyUntil", "popupDelayMs", "frequency", "notifyVersion", "texts",
];
const pickVolunteer = (v = {}) =>
  Object.fromEntries(VOLUNTEER_FIELDS.filter((k) => v[k] !== undefined).map((k) => [k, v[k]]));

export const volunteers = {
  /** Le bénévole publié (ou null), normalisé — usage public. */
  async getCurrent() {
    const list = await volunteersCol.all();
    const pub = list.find((v) => normalizeVolunteer(v)?.published);
    return normalizeVolunteer(pub || null);
  },
  async list() {
    const list = await volunteersCol.all();
    return list
      .map(normalizeVolunteer)
      .sort((a, b) => String(b.month || "").localeCompare(String(a.month || "")) || Number(b.id) - Number(a.id));
  },
  async get(id) {
    return normalizeVolunteer(await volunteersCol.get(id));
  },
  create(v, by = null) {
    return volunteersCol.mutate((list) => {
      const rec = normalizeVolunteer(pickVolunteer(v));
      if (rec.month && list.some((o) => normalizeVolunteer(o)?.month === rec.month)) {
        throw new ConflictError(`Un bénévole existe déjà pour ${rec.month}.`);
      }
      rec.id = nextVolunteerId(list);
      rec.createdAt = rec.updatedAt = nowIso();
      rec.createdBy = rec.updatedBy = by;
      if (rec.published) list.forEach((o) => { o.published = false; });
      list.push(rec);
      return rec;
    });
  },
  update(id, patch, by = null) {
    return volunteersCol.mutate((list) => {
      const i = list.findIndex((r) => sameId(r.id, id));
      if (i < 0) throw new NotFoundError("Bénévole introuvable.");
      const merged = normalizeVolunteer({
        ...list[i],
        ...pickVolunteer(patch),
        texts: patch.texts ? { ...(list[i].texts || {}), ...patch.texts } : list[i].texts,
        id: list[i].id,
      });
      if (merged.month && list.some((o, j) => j !== i && normalizeVolunteer(o)?.month === merged.month)) {
        throw new ConflictError(`Un bénévole existe déjà pour ${merged.month}.`);
      }
      merged.updatedAt = nowIso();
      merged.updatedBy = by;
      if (merged.published) list.forEach((o, j) => { if (j !== i) o.published = false; });
      list[i] = { ...list[i], ...merged };
      return list[i];
    });
  },
  remove(id) {
    return volunteersCol.remove(id, "Bénévole introuvable.");
  },
};

const nextVolunteerId = (list) => list.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;

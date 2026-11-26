import "server-only";
import projectsData from "@/json/data.json";
import seedVolunteers from "../seed/volunteers.json";
import { createCollection, createCrudDomain, createKeyValueDomain, nowIso } from "./collection";

export { courses, registrations, quizResults, certificates } from "./academy";
export { chat } from "./chat";
export { adminLog } from "./adminLog";
export { media } from "./media";
export { adminAccount } from "./adminAccount";

export const content = createKeyValueDomain("content");
export const settings = createKeyValueDomain("settings");

// Projets : amorcés depuis json/data.json (identifiant = slug).
export const projects = createCrudDomain("projects", {
  idType: "string",
  seed: () => projectsData.Projects.map((p) => ({ id: p.slug, ...p })),
});

export const recruitment = createCrudDomain("recruitment", { idType: "uuid" });
export const members = createCrudDomain("members", { idType: "uuid" });
export const payments = createCrudDomain("payments", { idType: "uuid" });

// Bénévole du mois : le dernier enregistrement est le bénévole « courant »
// (même logique que lib/db/volunteer.server.js).
const volunteersCol = createCollection("volunteers", { seed: seedVolunteers });

export const volunteers = {
  async getCurrent() {
    const list = await volunteersCol.all();
    return [...list].sort((a, b) => Number(b.id) - Number(a.id))[0] || null;
  },
  async list() {
    return [...(await volunteersCol.all())].sort((a, b) => Number(b.id) - Number(a.id));
  },
  setCurrent(v, by = null) {
    return volunteersCol.mutate((list) => {
      const payload = {
        firstName: v.firstName,
        lastName: v.lastName,
        location: v.location || null,
        photo: v.photo || null,
        actions: v.actions || null,
        contribution: v.contribution || null,
        active: !!v.active,
        updatedAt: nowIso(),
        updatedBy: by,
      };
      const current = [...list].sort((a, b) => Number(b.id) - Number(a.id))[0];
      if (current) {
        Object.assign(current, payload);
        return current;
      }
      const rec = { id: 1, period: nowIso(), ...payload };
      list.push(rec);
      return rec;
    });
  },
};

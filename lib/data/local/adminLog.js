import "server-only";
import { createCollection, nowIso, sameId } from "./collection";

// Journal en lecture seule depuis l'admin : seules des insertions (et la
// clôture d'une session) sont possibles. Aucune fonction de suppression.

const loginsCol = createCollection("admin-logins", { idType: "uuid" });
const activitiesCol = createCollection("admin-activities", { idType: "uuid" });

const norm = (s) => String(s ?? "").toLowerCase();

function matchPeriod(at, from, to) {
  if (from && at < `${from}T00:00:00.000Z`) return false;
  if (to && at > `${to}T23:59:59.999Z`) return false;
  return true;
}

function paginate(list, { page = 1, pageSize = 25 } = {}) {
  const size = Math.min(Math.max(Number(pageSize) || 25, 1), 200);
  const total = list.length;
  const pages = Math.max(Math.ceil(total / size), 1);
  const current = Math.min(Math.max(Number(page) || 1, 1), pages);
  return { items: list.slice((current - 1) * size, current * size), total, page: current, pageSize: size, pages };
}

const sortDesc = (list) => [...list].sort((a, b) => String(b.at).localeCompare(String(a.at)));

function filterLogins(list, f = {}) {
  return list.filter((l) => {
    if (!matchPeriod(l.at, f.from, f.to)) return false;
    if (f.person && !norm(l.name).includes(norm(f.person))) return false;
    if (f.department && l.department !== f.department) return false;
    if (f.result === "success" && !l.success) return false;
    if (f.result === "failure" && l.success) return false;
    if (f.q) {
      const hay = norm([l.name, l.department, l.email, l.reason, l.ip, l.browser, l.os, l.device].join(" "));
      if (!hay.includes(norm(f.q))) return false;
    }
    return true;
  });
}

function filterActivities(list, f = {}) {
  return list.filter((a) => {
    if (!matchPeriod(a.at, f.from, f.to)) return false;
    if (f.person && !norm(a.name).includes(norm(f.person))) return false;
    if (f.department && a.department !== f.department) return false;
    if (f.module && a.module !== f.module) return false;
    if (f.action && a.action !== f.action) return false;
    if (f.q) {
      const changes = (a.changes || []).map((c) => `${c.field} ${c.from} ${c.to}`).join(" ");
      const hay = norm([a.name, a.department, a.action, a.module, a.target, changes].join(" "));
      if (!hay.includes(norm(f.q))) return false;
    }
    return true;
  });
}

export const adminLog = {
  addLogin: (entry) => loginsCol.insert({ ...entry, at: entry.at || nowIso(), logoutAt: null, logoutReason: null }),
  getLogin: (id) => loginsCol.get(id),
  closeLogin(id, { reason = "Déconnexion" } = {}) {
    return loginsCol.mutate((list) => {
      const l = list.find((x) => sameId(x.id, id));
      if (!l || l.logoutAt) return l || null;
      l.logoutAt = nowIso();
      l.logoutReason = reason;
      return l;
    });
  },
  async listLogins(filters = {}) {
    const list = sortDesc(filterLogins(await loginsCol.all(), filters));
    return filters.all ? { items: list, total: list.length } : paginate(list, filters);
  },
  addActivity: (entry) => activitiesCol.insert({ ...entry, at: entry.at || nowIso() }),
  async listActivities(filters = {}) {
    const list = sortDesc(filterActivities(await activitiesCol.all(), filters));
    return filters.all ? { items: list, total: list.length } : paginate(list, filters);
  },
  async facets() {
    const [logins, activities] = await Promise.all([loginsCol.all(), activitiesCol.all()]);
    const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
    return {
      names: uniq([...logins.map((l) => l.name), ...activities.map((a) => a.name)]),
      departments: uniq([...logins.map((l) => l.department), ...activities.map((a) => a.department)]),
      modules: uniq(activities.map((a) => a.module)),
      actions: uniq(activities.map((a) => a.action)),
    };
  },
};

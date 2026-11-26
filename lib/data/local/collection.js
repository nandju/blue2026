import "server-only";
import crypto from "node:crypto";
import { readJson, updateJson } from "./store";
import { NotFoundError } from "../errors";

export const nowIso = () => new Date().toISOString();
export const sameId = (a, b) => String(a) === String(b);
export const sameEmail = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

/** Liste d'enregistrements stockée dans data/<name>.json. */
export function createCollection(name, { seed = [], idType = "number" } = {}) {
  const all = () => readJson(name, seed);

  const nextId = (list) =>
    idType === "number"
      ? list.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
      : crypto.randomUUID();

  return {
    name,
    seed,
    all,
    async get(id) {
      return (await all()).find((r) => sameId(r.id, id)) || null;
    },
    insert(record) {
      return updateJson(name, seed, (list) => {
        const rec = { ...record };
        if (rec.id == null || rec.id === "") rec.id = nextId(list);
        list.push(rec);
        return rec;
      });
    },
    update(id, patch, notFoundMessage) {
      return updateJson(name, seed, (list) => {
        const i = list.findIndex((r) => sameId(r.id, id));
        if (i < 0) throw new NotFoundError(notFoundMessage);
        list[i] = { ...list[i], ...patch };
        return list[i];
      });
    },
    remove(id, notFoundMessage) {
      return updateJson(name, seed, (list) => {
        const i = list.findIndex((r) => sameId(r.id, id));
        if (i < 0) throw new NotFoundError(notFoundMessage);
        const [removed] = list.splice(i, 1);
        return removed;
      });
    },
    /** Modification libre sous verrou : fn(list) modifie la liste en place. */
    mutate(fn) {
      return updateJson(name, seed, fn);
    },
  };
}

/** Domaine CRUD générique (projets, recrutement, membres, paiements…). */
export function createCrudDomain(name, options) {
  const col = createCollection(name, options);
  return {
    list: () => col.all(),
    get: (id) => col.get(id),
    create: (record, by = null) =>
      col.insert({ ...record, createdAt: nowIso(), updatedAt: nowIso(), createdBy: by, updatedBy: by }),
    update: (id, patch, by = null) => col.update(id, { ...patch, updatedAt: nowIso(), updatedBy: by }),
    remove: (id) => col.remove(id),
  };
}

/** Clés/valeurs avec métadonnées de modification (contenus, réglages). */
export function createKeyValueDomain(name) {
  const meta = (by) => ({ updatedAt: nowIso(), updatedBy: by || null });
  return {
    getAll: () => readJson(name, {}),
    async get(key) {
      const all = await readJson(name, {});
      return all[key] ?? null;
    },
    set: (key, value, by) =>
      updateJson(name, {}, (all) => {
        all[key] = { value, isDefault: false, ...meta(by) };
        return all[key];
      }),
    reset: (key, by) =>
      updateJson(name, {}, (all) => {
        all[key] = { value: null, isDefault: true, ...meta(by) };
        return all[key];
      }),
  };
}

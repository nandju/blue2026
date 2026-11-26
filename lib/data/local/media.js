import "server-only";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { createCollection, nowIso } from "./collection";
import { UPLOADS_DIR, atomicWrite, listDataFiles, readDataFileText } from "./store";
import { BadRequestError } from "../errors";

const mediaCol = createCollection("media", { idType: "uuid" });

// Fichiers dont le contenu ne compte pas comme une « utilisation » d'un média.
const IGNORED_FOR_USAGE = new Set(["media", "admin-logins", "admin-activities"]);
const SOURCE_LABELS = {
  content: "Contenu du site",
  settings: "Réglages / Webmaster",
  volunteers: "Bénévole du mois",
  courses: "Formations",
  projects: "Projets",
  recruitment: "Recrutement",
  members: "Membres",
  payments: "Paiements",
};

/** Résout un chemin relatif dans public/uploads/ en refusant toute sortie du dossier. */
function resolveUpload(relPath) {
  const clean = String(relPath || "").replace(/\\/g, "/");
  if (!clean || clean.includes("\0") || clean.split("/").some((p) => p === ".." || p === "")) return null;
  const abs = path.resolve(UPLOADS_DIR, clean);
  if (!abs.startsWith(UPLOADS_DIR + path.sep)) return null;
  return abs;
}

export const media = {
  async list({ type, folder, q, url } = {}) {
    let list = await mediaCol.all();
    if (type) list = list.filter((m) => m.type === type);
    if (folder) list = list.filter((m) => m.folder === folder);
    if (url) list = list.filter((m) => m.url === url);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((m) => `${m.originalName} ${m.alt || ""} ${m.url}`.toLowerCase().includes(needle));
    }
    return [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  },
  get: (id) => mediaCol.get(id),
  async getByUrl(url) {
    return (await mediaCol.all()).find((m) => m.url === url) || null;
  },
  create: (record) => mediaCol.insert({ ...record, createdAt: nowIso() }),
  remove: (id) => mediaCol.remove(id, "Média introuvable"),

  /** Enregistre le fichier dans public/uploads/<dossier>/ avec un nom unique. */
  async saveFile({ folder, ext, buffer }) {
    const name = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}.${ext}`;
    const storagePath = `${folder}/${name}`;
    const abs = resolveUpload(storagePath);
    if (!abs) throw new BadRequestError("Dossier de destination invalide");
    await atomicWrite(abs, buffer);
    return { storagePath, url: `/uploads/${storagePath}` };
  },
  async deleteFile(storagePath) {
    const abs = resolveUpload(storagePath);
    if (abs) await fsp.unlink(abs).catch(() => {});
  },

  /** Ouvre un fichier téléversé (avec prise en charge des requêtes Range pour la vidéo). */
  async openFile(relPath, range) {
    const abs = resolveUpload(relPath);
    if (!abs) return null;
    let stat;
    try {
      stat = await fsp.stat(abs);
    } catch {
      return null;
    }
    if (!stat.isFile()) return null;
    const size = stat.size;
    let start = 0;
    let end = size - 1;
    let partial = false;
    const m = /^bytes=(\d*)-(\d*)$/.exec(range || "");
    if (m && size > 0) {
      if (m[1] === "" && m[2] !== "") {
        start = Math.max(size - Number(m[2]), 0);
      } else {
        start = Number(m[1] || 0);
        if (m[2] !== "") end = Math.min(Number(m[2]), size - 1);
      }
      if (start > end || start >= size) return { size, unsatisfiable: true };
      partial = true;
    }
    const stream = Readable.toWeb(fs.createReadStream(abs, size ? { start, end } : {}));
    return { stream, size, start, end, partial, ext: path.extname(abs).slice(1).toLowerCase() };
  },

  /** Cherche où une URL de média est utilisée dans les données du site. */
  async findUsages(url) {
    if (!url) return [];
    const usages = [];
    for (const name of await listDataFiles()) {
      if (IGNORED_FOR_USAGE.has(name)) continue;
      const text = await readDataFileText(name);
      if (text.includes(JSON.stringify(url).slice(1, -1))) {
        usages.push({ source: name, label: SOURCE_LABELS[name] || name });
      }
    }
    return usages;
  },

  // En local, le fichier est envoyé directement à POST /api/admin/media.
  // En phase 7 (Supabase Storage), ce sera une URL signée (contourne la
  // limite de 4,5 Mo par requête sur Vercel).
  async createUploadTarget() {
    return { mode: "direct", method: "POST", url: "/api/admin/media" };
  },
  async completeSignedUpload() {
    throw new BadRequestError("L'envoi par URL signée n'est pas utilisé en mode local.");
  },
};

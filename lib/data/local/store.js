import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { CorruptedDataError, ReadOnlyStorageError } from "../errors";

// Fichiers JSON dans <racine>/data/. Écriture atomique : fichier temporaire
// puis renommage. Les écritures d'un même fichier passent par une file
// d'attente pour éviter qu'une requête n'écrase les changements d'une autre.

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const READ_ONLY_CODES = new Set(["EROFS", "EACCES", "ENOTSUP"]);
const RETRY_CODES = new Set(["EPERM", "EBUSY"]); // Windows : fichier momentanément verrouillé

const locks = (globalThis.__blueDataLocks ??= new Map());

const fileOf = (name) => path.join(DATA_DIR, `${name}.json`);
const seedOf = (seed) => structuredClone(typeof seed === "function" ? seed() : seed);

async function readRaw(name) {
  try {
    const text = await fs.readFile(fileOf(name), "utf8");
    try {
      return { status: "ok", data: JSON.parse(text) };
    } catch {
      return { status: "corrupted" };
    }
  } catch (e) {
    if (e.code === "ENOENT") return { status: "missing" };
    console.error(`[data] Lecture impossible de ${name}.json :`, e.message);
    return { status: "unreadable" };
  }
}

/** Lecture tolérante : renvoie l'amorçage si le fichier est absent ou illisible. */
export async function readJson(name, seed) {
  const raw = await readRaw(name);
  if (raw.status === "ok") return raw.data;
  if (raw.status === "corrupted") console.error(`[data] ${name}.json est corrompu — valeurs par défaut utilisées.`);
  return seedOf(seed);
}

function withLock(name, fn) {
  const run = (locks.get(name) || Promise.resolve()).then(fn, fn);
  locks.set(name, run.catch(() => {}));
  return run;
}

function rethrowStorage(e) {
  if (READ_ONLY_CODES.has(e.code)) throw new ReadOnlyStorageError();
  throw e;
}

async function renameWithRetry(from, to) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fs.rename(from, to);
    } catch (e) {
      if (!RETRY_CODES.has(e.code) || attempt >= 4) throw e;
      await new Promise((r) => setTimeout(r, 40 * (attempt + 1)));
    }
  }
}

/** Écrit un buffer/texte de façon atomique (dossier créé si besoin). */
export async function atomicWrite(filePath, contents) {
  const tmp = `${filePath}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(tmp, contents);
    await renameWithRetry(tmp, filePath);
  } catch (e) {
    await fs.unlink(tmp).catch(() => {});
    rethrowStorage(e);
  }
}

/**
 * Lit, modifie puis réécrit un fichier JSON sous verrou.
 * `mutator(data)` modifie `data` en place (ou renvoie { data, result }) et
 * sa valeur de retour est renvoyée à l'appelant.
 */
export function updateJson(name, seed, mutator) {
  return withLock(name, async () => {
    const raw = await readRaw(name);
    if (raw.status === "corrupted" || raw.status === "unreadable") throw new CorruptedDataError(`${name}.json`);
    const data = raw.status === "ok" ? raw.data : seedOf(seed);
    const result = await mutator(data);
    await atomicWrite(fileOf(name), JSON.stringify(data, null, 2));
    return result;
  });
}

/** Liste les noms (sans extension) des fichiers JSON présents dans data/. */
export async function listDataFiles() {
  try {
    const entries = await fs.readdir(DATA_DIR);
    return entries.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  } catch {
    return [];
  }
}

export async function readDataFileText(name) {
  try {
    return await fs.readFile(fileOf(name), "utf8");
  } catch {
    return "";
  }
}

export { rethrowStorage };

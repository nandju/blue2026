// Envoi de fichiers depuis l'admin (navigateur uniquement).
// 1. Vérifie format et taille (mêmes règles que le serveur).
// 2. Images : redimensionnées à 2000 px max et converties en webp (canvas).
// 3. Demande la « cible d'envoi » au serveur : envoi direct (local) ou URL
//    signée (Supabase Storage, phase 7 — contourne la limite Vercel de 4,5 Mo).

import { UPLOAD_LIMITS, validateFileMeta, extOf } from "@/lib/uploadLimits";

async function loadImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {}
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Cette image est illisible ou endommagée."));
    };
    img.src = url;
  });
}

/** Redimensionne (2000 px max) et convertit en webp. Renvoie { file, width, height }. */
export async function prepareImage(file) {
  const img = await loadImage(file);
  const srcW = img.width;
  const srcH = img.height;
  const max = UPLOAD_LIMITS.image.maxDimension;
  const scale = Math.min(1, max / Math.max(srcW, srcH));
  const width = Math.round(srcW * scale);
  const height = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  img.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  // Navigateur incapable d'encoder en webp : on garde l'original (déjà validé).
  if (!blob || blob.type !== "image/webp") return { file, width: srcW, height: srcH };
  const name = `${file.name.replace(/\.[^.]+$/, "") || "image"}.webp`;
  return { file: new File([blob], name, { type: "image/webp" }), width, height };
}

function readVideoDimensions(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (dims) => {
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => done({ width: video.videoWidth || null, height: video.videoHeight || null });
    video.onerror = () => done({ width: null, height: null });
    video.src = url;
  });
}

function xhr(method, url, body, { headers = {}, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open(method, url);
    req.withCredentials = true;
    Object.entries(headers).forEach(([k, v]) => req.setRequestHeader(k, v));
    if (onProgress) req.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    req.onload = () => {
      let data = null;
      try {
        data = req.responseText ? JSON.parse(req.responseText) : null;
      } catch {}
      if (req.status >= 200 && req.status < 300) resolve(data);
      else {
        const err = new Error(data?.error || `L'envoi a échoué (erreur ${req.status}).`);
        err.status = req.status;
        reject(err);
      }
    };
    req.onerror = () => reject(new Error("Connexion interrompue pendant l'envoi. Vérifiez votre réseau et réessayez."));
    req.send(body);
  });
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

/**
 * Envoie un fichier et renvoie l'enregistrement de la médiathèque.
 * @param {{ file: File, type: "image"|"video"|"pdf", folder?: string, onProgress?: (pct:number)=>void, onStatus?: (msg:string)=>void }} opts
 */
export async function uploadMedia({ file, type, folder = "general", onProgress, onStatus }) {
  const rules = UPLOAD_LIMITS[type];
  if (!rules) throw new Error("Type de fichier inconnu.");
  // Le format est vérifié sur le fichier d'origine ; pour les images, la
  // taille est vérifiée après redimensionnement (c'est ce qui est envoyé).
  if (!rules.exts.includes(extOf(file.name)) || (file.type && !rules.mimes.includes(file.type))) {
    throw new Error(validateFileMeta(type, { name: file.name, size: file.size || 1, mime: file.type }));
  }

  let toSend = file;
  let dims = { width: null, height: null };
  if (type === "image") {
    onStatus?.("Optimisation de l'image…");
    const prepared = await prepareImage(file);
    toSend = prepared.file;
    dims = { width: prepared.width, height: prepared.height };
  } else if (type === "video") {
    dims = await readVideoDimensions(file);
  }

  const error = validateFileMeta(type, { name: toSend.name, size: toSend.size, mime: toSend.type });
  if (error) throw new Error(error);

  onStatus?.("Envoi en cours…");
  const meta = { type, folder, name: toSend.name, size: toSend.size, mime: toSend.type };
  const target = await postJson("/api/admin/media/upload-target", meta);

  if (target.mode === "signed") {
    await xhr(target.method || "PUT", target.url, toSend, { headers: target.headers || { "Content-Type": toSend.type }, onProgress });
    return postJson("/api/admin/media/complete", { ...meta, ...dims, ...(target.complete || {}), originalName: file.name });
  }

  const form = new FormData();
  form.append("file", toSend, toSend.name);
  form.append("type", type);
  form.append("folder", folder);
  form.append("originalName", file.name);
  if (dims.width) form.append("width", String(dims.width));
  if (dims.height) form.append("height", String(dims.height));
  return xhr(target.method || "POST", target.url, form, { onProgress });
}

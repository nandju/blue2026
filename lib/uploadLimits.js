// Limites de fichiers partagées entre le navigateur et le serveur.

const MB = 1024 * 1024;

export const UPLOAD_LIMITS = {
  image: {
    label: "Image",
    maxBytes: 5 * MB,
    maxDimension: 2000,
    exts: ["jpg", "jpeg", "png", "webp"],
    mimes: ["image/jpeg", "image/png", "image/webp"],
    formats: "JPG, PNG ou WEBP",
  },
  video: {
    label: "Vidéo",
    maxBytes: 50 * MB,
    exts: ["mp4", "webm"],
    mimes: ["video/mp4", "video/webm"],
    formats: "MP4 ou WEBM",
  },
  pdf: {
    label: "PDF",
    maxBytes: 20 * MB,
    exts: ["pdf"],
    mimes: ["application/pdf"],
    formats: "PDF",
  },
};

export const MEDIA_TYPES = Object.keys(UPLOAD_LIMITS);

export const MEDIA_FOLDERS = [
  { value: "general", label: "Général" },
  { value: "accueil", label: "Accueil" },
  { value: "a-propos", label: "À propos" },
  { value: "projets", label: "Projets" },
  { value: "formations", label: "Formations" },
  { value: "benevoles", label: "Bénévoles" },
  { value: "partenaires", label: "Partenaires" },
  { value: "documents", label: "Documents" },
];
export const MEDIA_FOLDER_VALUES = MEDIA_FOLDERS.map((f) => f.value);

export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / MB).toFixed(1).replace(".", ",")} Mo`;
}

export const extOf = (name = "") => (name.split(".").pop() || "").toLowerCase();

/** Vérifie un fichier ({ name, size, mime }) ; renvoie un message d'erreur en français ou null. */
export function validateFileMeta(type, { name, size, mime }) {
  const rules = UPLOAD_LIMITS[type];
  if (!rules) return "Type de fichier inconnu.";
  const ext = extOf(name);
  if (!rules.exts.includes(ext) || (mime && !rules.mimes.includes(mime))) {
    return `Format non accepté (${ext ? `.${ext}` : "inconnu"}). Formats autorisés : ${rules.formats}.`;
  }
  if (!size) return "Le fichier est vide.";
  if (size > rules.maxBytes) {
    return `Fichier trop volumineux (${formatBytes(size)}). Taille maximale pour ${rules.label.toLowerCase() === "pdf" ? "un PDF" : `une ${rules.label.toLowerCase()}`} : ${formatBytes(rules.maxBytes)}.`;
  }
  return null;
}

/** Détecte le vrai type d'un fichier à partir de ses premiers octets. */
export function sniffMime(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const ascii = (start, len) => String.fromCharCode(...b.slice(start, start + len));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && ascii(1, 3) === "PNG") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (ascii(4, 4) === "ftyp") return "video/mp4";
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video/webm";
  if (ascii(0, 5) === "%PDF-") return "application/pdf";
  return null;
}

export const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};

/** Reconnaît un lien YouTube ou Vimeo et renvoie l'URL d'intégration. */
export function parseVideoUrl(url = "") {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id ? { provider: "youtube", id, embedUrl: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id = u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
      return id ? { provider: "youtube", id, embedUrl: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.match(/(?:\/video)?\/(\d+)/)?.[1];
      return id ? { provider: "vimeo", id, embedUrl: `https://player.vimeo.com/video/${id}` } : null;
    }
  } catch {}
  return null;
}

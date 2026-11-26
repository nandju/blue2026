import { media } from "@/lib/data";

// Sert les fichiers téléversés (mode local). Nécessaire car Next.js ne sert
// en production que les fichiers présents dans public/ au moment du build.

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};

export async function GET(req, { params }) {
  const { path } = await params;
  const file = await media.openFile((path || []).join("/"), req.headers.get("range"));
  if (!file) return new Response("Fichier introuvable", { status: 404 });
  if (file.unsatisfiable) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${file.size}` } });
  }

  const contentType = CONTENT_TYPES[file.ext];
  if (!contentType) return new Response("Type de fichier non autorisé", { status: 403 });

  const headers = {
    "Content-Type": contentType,
    "Content-Length": String(file.end - file.start + 1),
    "Accept-Ranges": "bytes",
    // Les noms de fichiers sont uniques : contenu immuable.
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (file.partial) headers["Content-Range"] = `bytes ${file.start}-${file.end}/${file.size}`;
  return new Response(file.stream, { status: file.partial ? 206 : 200, headers });
}

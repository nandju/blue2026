"use client";
import { useEffect, useRef, useState } from "react";
import { getMediaList } from "@/lib/store";
import { uploadMedia } from "@/lib/client/mediaUpload";
import { UPLOAD_LIMITS, formatBytes, parseVideoUrl } from "@/lib/uploadLimits";
import MediaPreview from "./MediaPreview";
import MediaLibraryModal from "./MediaLibraryModal";
import { btnGhost, btnSecondary, inputCls } from "./ui";

/**
 * Sélecteur de média réutilisable.
 * Convention de valeur : null = valeur par défaut · "" = retiré (aucun média) · URL = média choisi.
 */
export default function MediaPicker({
  type = "image",
  value,
  defaultValue = null,
  onChange,
  folder = "general",
  label,
  help,
  previewClassName = "w-full aspect-video",
}) {
  const rules = UPLOAD_LIMITS[type];
  const inputRef = useRef(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [externalOpen, setExternalOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState(null);

  const isDefault = value === null || value === undefined;
  const isRemoved = value === "";
  const effective = isDefault ? defaultValue : value;
  const external = type === "video" && effective ? parseVideoUrl(effective) : null;

  // Taille et dimensions des fichiers de la médiathèque.
  useEffect(() => {
    setMeta(null);
    if (!effective || !effective.startsWith("/uploads/")) return;
    getMediaList({ url: effective })
      .then((list) => list[0] && setMeta({ size: list[0].size, width: list[0].width, height: list[0].height }))
      .catch(() => {});
  }, [effective]);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const record = await uploadMedia({ file, type, folder, onProgress: setProgress, onStatus: setStatus });
      setMeta({ size: record.size, width: record.width, height: record.height });
      onChange(record.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setProgress(null);
      setStatus("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const applyExternal = () => {
    const parsed = parseVideoUrl(externalUrl);
    if (!parsed) {
      setError("Lien non reconnu : collez un lien YouTube ou Vimeo.");
      return;
    }
    setError("");
    onChange(externalUrl.trim());
    setExternalOpen(false);
    setExternalUrl("");
  };

  const badge = isRemoved
    ? { text: "Aucun média", cls: "bg-gray-100 text-gray-500" }
    : isDefault
      ? { text: "Valeur par défaut", cls: "bg-[rgba(13,110,187,0.08)] text-[#0D6EBB]" }
      : { text: "Personnalisé", cls: "bg-[rgba(13,189,159,0.12)] text-[#0DBD9F]" };

  return (
    <div className="space-y-2">
      {label && <p className="block text-gray-700 text-sm font-medium">{label}</p>}
      <div className="rounded-2xl border border-[rgba(13,110,187,0.12)] overflow-hidden bg-white">
        <div className="relative">
          <MediaPreview
            type={type}
            url={isRemoved ? null : effective}
            className={previewClassName}
            onImageLoad={(e) => !meta?.width && setMeta((m) => ({ ...(m || {}), width: e.target.naturalWidth, height: e.target.naturalHeight }))}
          />
          {progress !== null && (
            <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2 px-6">
              <p className="text-sm text-[#0D6EBB] font-medium">{status || "Envoi en cours…"}</p>
              <div className="w-full max-w-xs h-2 bg-[rgba(13,110,187,0.1)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-500">{progress}%</p>
            </div>
          )}
        </div>
        <div className="p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>{badge.text}</span>
            {external && <span className="text-gray-500">Lien {external.provider === "youtube" ? "YouTube" : "Vimeo"}</span>}
            {meta?.size ? <span className="text-gray-500">{formatBytes(meta.size)}</span> : null}
            {meta?.width ? <span className="text-gray-500">{meta.width} × {meta.height} px</span> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnSecondary} disabled={progress !== null} onClick={() => inputRef.current?.click()}>
              ⬆ Téléverser
            </button>
            <button type="button" className={btnSecondary} disabled={progress !== null} onClick={() => setLibraryOpen(true)}>
              🗂 Médiathèque
            </button>
            {type === "video" && (
              <button type="button" className={btnSecondary} disabled={progress !== null} onClick={() => setExternalOpen((o) => !o)}>
                🔗 Lien externe
              </button>
            )}
            {!isRemoved && effective && (
              <button type="button" className={btnGhost} onClick={() => onChange("")}>Retirer</button>
            )}
            {!isDefault && (
              <button type="button" className={btnGhost} onClick={() => onChange(null)}>↺ Rétablir par défaut</button>
            )}
          </div>
          {externalOpen && (
            <div className="flex gap-2">
              <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…"
                className={inputCls} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyExternal())} />
              <button type="button" className={btnSecondary} onClick={applyExternal}>OK</button>
            </div>
          )}
          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2" role="alert">{error}</p>}
          <p className="text-[11px] text-gray-400">
            {help ? `${help} · ` : ""}{rules.formats}, {formatBytes(rules.maxBytes)} max
            {type === "image" ? " — redimensionnée à 2000 px et convertie en WEBP automatiquement" : ""}
            {type === "video" ? " — ou un lien YouTube / Vimeo" : ""}
          </p>
        </div>
      </div>
      <input ref={inputRef} type="file" hidden accept={rules.mimes.join(",")} onChange={(e) => handleFile(e.target.files?.[0])} />
      <MediaLibraryModal open={libraryOpen} type={type} onClose={() => setLibraryOpen(false)}
        onSelect={(item) => { setMeta({ size: item.size, width: item.width, height: item.height }); onChange(item.url); }} />
    </div>
  );
}

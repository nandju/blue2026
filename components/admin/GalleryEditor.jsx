"use client";
import { useRef, useState } from "react";
import { uploadMedia } from "@/lib/client/mediaUpload";
import { UPLOAD_LIMITS, formatBytes } from "@/lib/uploadLimits";
import MediaPreview from "./MediaPreview";
import MediaLibraryModal from "./MediaLibraryModal";
import MoveButtons, { moveItem } from "./MoveButtons";
import { btnGhost, btnSecondary, inputCls } from "./ui";

/**
 * Éditeur de carrousel / galerie.
 * Valeur : null (ou liste vide) = images par défaut ; sinon [{ url, alt, caption }].
 * `defaultItems` : images affichées par défaut sur le site ([{ url, alt, caption }]).
 */
export default function GalleryEditor({ value, defaultItems = [], onChange, folder = "general", label, max = 30 }) {
  const inputRef = useRef(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(null); // { done, total, progress }
  const [errors, setErrors] = useState([]);

  const items = Array.isArray(value) ? value : [];
  const usingDefault = items.length === 0;
  const commit = (next) => onChange(next.length ? next : null);
  const update = (i, patch) => commit(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const addItems = (newItems) => {
    const room = max - items.length;
    if (newItems.length > room) setErrors([`Maximum ${max} images : ${newItems.length - room} image(s) non ajoutée(s).`]);
    commit([...items, ...newItems.slice(0, Math.max(room, 0))]);
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setErrors([]);
    const added = [];
    const errs = [];
    for (let i = 0; i < files.length; i++) {
      setUploading({ done: i, total: files.length, progress: 0 });
      try {
        const rec = await uploadMedia({
          file: files[i],
          type: "image",
          folder,
          onProgress: (p) => setUploading({ done: i, total: files.length, progress: p }),
        });
        added.push({ url: rec.url, alt: "", caption: "" });
      } catch (e) {
        errs.push(`${files[i].name} : ${e.message}`);
      }
    }
    setUploading(null);
    setErrors(errs);
    if (inputRef.current) inputRef.current.value = "";
    if (added.length) addItems(added);
  };

  return (
    <div className="space-y-3">
      {label && <p className="block text-gray-700 text-sm font-medium">{label}</p>}

      {usingDefault ? (
        <div className="rounded-2xl border border-dashed border-[rgba(13,110,187,0.25)] bg-[#f7faff] p-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#0D6EBB]">Images par défaut</span> — {defaultItems.length} image{defaultItems.length > 1 ? "s" : ""} affichée{defaultItems.length > 1 ? "s" : ""} sur le site.
            Ajoutez des images pour les remplacer.
          </p>
          {defaultItems.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {defaultItems.map((it, i) => (
                <MediaPreview key={i} type="image" url={it.url} alt={it.alt} className="w-24 h-16 rounded-lg shrink-0" />
              ))}
            </div>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={`${it.url}-${i}`} className="flex gap-3 items-start bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-3">
              <MoveButtons index={i} length={items.length} onMove={(from, to) => commit(moveItem(items, from, to))} label={`l'image ${i + 1}`} />
              <MediaPreview type="image" url={it.url} alt={it.alt} className="w-24 h-20 rounded-lg shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                <input value={it.alt || ""} onChange={(e) => update(i, { alt: e.target.value })} maxLength={200}
                  placeholder="Texte alternatif (description de l'image)" className={inputCls} aria-label={`Texte alternatif de l'image ${i + 1}`} />
                <input value={it.caption || ""} onChange={(e) => update(i, { caption: e.target.value })} maxLength={200}
                  placeholder="Légende (facultatif)" className={inputCls} aria-label={`Légende de l'image ${i + 1}`} />
              </div>
              <button type="button" onClick={() => commit(items.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded-lg hover:bg-red-50" aria-label={`Retirer l'image ${i + 1}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {uploading && (
        <div className="bg-[rgba(13,110,187,0.06)] rounded-xl px-4 py-3">
          <p className="text-xs text-[#0D6EBB] mb-1.5">Envoi {uploading.done + 1} / {uploading.total} — {uploading.progress}%</p>
          <div className="h-1.5 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F] transition-all" style={{ width: `${uploading.progress}%` }} />
          </div>
        </div>
      )}
      {errors.length > 0 && (
        <ul className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 space-y-0.5" role="alert">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <button type="button" className={btnSecondary} disabled={!!uploading || items.length >= max} onClick={() => inputRef.current?.click()}>
          ⬆ Ajouter des images
        </button>
        <button type="button" className={btnSecondary} disabled={!!uploading || items.length >= max} onClick={() => setLibraryOpen(true)}>
          🗂 Depuis la médiathèque
        </button>
        {!usingDefault && (
          <button type="button" className={btnGhost} onClick={() => onChange(null)}>↺ Rétablir les images par défaut</button>
        )}
        <span className="text-[11px] text-gray-400">
          {items.length}/{max} · {UPLOAD_LIMITS.image.formats}, {formatBytes(UPLOAD_LIMITS.image.maxBytes)} max
        </span>
      </div>

      <input ref={inputRef} type="file" hidden multiple accept={UPLOAD_LIMITS.image.mimes.join(",")} onChange={(e) => handleFiles(e.target.files)} />
      <MediaLibraryModal open={libraryOpen} type="image" multiple onClose={() => setLibraryOpen(false)}
        onSelect={(list) => addItems(list.map((m) => ({ url: m.url, alt: m.alt || "", caption: "" })))} />
    </div>
  );
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaList, deleteMedia, getMediaUsages } from "@/lib/store";
import { uploadMedia } from "@/lib/client/mediaUpload";
import { MEDIA_FOLDERS, UPLOAD_LIMITS, formatBytes } from "@/lib/uploadLimits";
import MediaPreview from "@/components/admin/MediaPreview";
import { inputCls, btnPrimary, formatDateTime, shortName } from "@/components/admin/ui";

const TYPE_LABELS = { image: "Images", video: "Vidéos", pdf: "PDF" };
const folderLabel = (v) => MEDIA_FOLDERS.find((f) => f.value === v)?.label || v;

function UploadPanel({ onUploaded }) {
  const inputRef = useRef(null);
  const [type, setType] = useState("image");
  const [folder, setFolder] = useState("general");
  const [state, setState] = useState(null); // { name, progress, status }
  const [errors, setErrors] = useState([]);

  const handleFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setErrors([]);
    const errs = [];
    for (const file of list) {
      setState({ name: file.name, progress: 0, status: "" });
      try {
        await uploadMedia({
          file, type, folder,
          onProgress: (p) => setState((s) => ({ ...s, progress: p })),
          onStatus: (status) => setState((s) => ({ ...s, status })),
        });
      } catch (e) {
        errs.push(`${file.name} : ${e.message}`);
      }
    }
    setState(null);
    setErrors(errs);
    if (inputRef.current) inputRef.current.value = "";
    onUploaded();
  };

  const rules = UPLOAD_LIMITS[type];
  return (
    <div className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] p-5">
      <h3 className="font-bold text-gray-900 mb-3">Téléverser des fichiers</h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputCls} sm:w-40`} aria-label="Type de fichier">
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} className={`${inputCls} sm:w-48`} aria-label="Dossier">
          {MEDIA_FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <button type="button" className={btnPrimary} disabled={!!state} onClick={() => inputRef.current?.click()}>⬆ Choisir des fichiers</button>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        {rules.formats}, {formatBytes(rules.maxBytes)} max par fichier
        {type === "image" ? " — redimensionnées à 2000 px et converties en WEBP automatiquement" : ""}
      </p>
      {state && (
        <div className="mt-3 bg-[rgba(13,110,187,0.06)] rounded-xl px-4 py-3">
          <p className="text-xs text-[#0D6EBB] mb-1.5 truncate">{state.status || "Envoi"} — {state.name} ({state.progress}%)</p>
          <div className="h-1.5 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F] transition-all" style={{ width: `${state.progress}%` }} />
          </div>
        </div>
      )}
      {errors.length > 0 && (
        <ul className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 space-y-0.5" role="alert">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
      <input ref={inputRef} type="file" hidden multiple accept={rules.mimes.join(",")} onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

export default function AdminMediaPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ type: "", folder: "", q: "" });
  const [copied, setCopied] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { item, usages }

  const load = useCallback(() => {
    setError("");
    getMediaList(filters).then(setItems).catch((e) => setError(e.message));
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  const copyLink = async (item) => {
    const url = new URL(item.url, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copiez le lien :", url);
    }
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1800);
  };

  const askDelete = async (item) => {
    setError("");
    try {
      const { usages } = await getMediaUsages(item.id);
      if (usages.length) setConfirmDelete({ item, usages });
      else if (confirm(`Supprimer définitivement « ${item.originalName} » ?`)) await remove(item);
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (item, force = false) => {
    setError("");
    try {
      await deleteMedia(item.id, force);
      setConfirmDelete(null);
      load();
    } catch (e) {
      if (e.status === 409 && e.data?.usages) setConfirmDelete({ item, usages: e.data.usages });
      else setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <UploadPanel onUploaded={load} />

      <div className="flex flex-col md:flex-row gap-3">
        <input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} placeholder="Rechercher un fichier…" className={inputCls} />
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} className={`${inputCls} md:w-44`} aria-label="Filtrer par type">
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filters.folder} onChange={(e) => setFilters((f) => ({ ...f, folder: e.target.value }))} className={`${inputCls} md:w-48`} aria-label="Filtrer par dossier">
          <option value="">Tous les dossiers</option>
          {MEDIA_FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {items === null && !error ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : items?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] text-center py-16">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-gray-500">Aucun fichier pour ces filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items?.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] overflow-hidden flex flex-col">
              <MediaPreview type={item.type} url={item.url} alt={item.alt} className="w-full aspect-square" compact />
              <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-800 truncate" title={item.originalName}>{item.originalName}</p>
                <p className="text-[11px] text-gray-400">
                  {folderLabel(item.folder)} · {formatBytes(item.size)}{item.width ? ` · ${item.width}×${item.height}` : ""}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {formatDateTime(item.createdAt)}{item.uploadedBy?.name ? ` · ${shortName(item.uploadedBy.name)}` : ""}
                </p>
                <div className="flex gap-1 mt-auto pt-2">
                  <button onClick={() => copyLink(item)} className="flex-1 text-xs text-[#0D6EBB] bg-[rgba(13,110,187,0.06)] hover:bg-[rgba(13,110,187,0.12)] rounded-lg py-1.5 transition-colors">
                    {copied === item.id ? "✓ Copié" : "Copier le lien"}
                  </button>
                  <button onClick={() => askDelete(item)} className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg px-2 py-1.5 transition-colors" aria-label={`Supprimer ${item.originalName}`}>
                    🗑
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" role="alertdialog" aria-modal="true">
              <h3 className="text-lg font-bold text-gray-900">⚠️ Fichier utilisé sur le site</h3>
              <p className="text-sm text-gray-600 mt-2">
                « {confirmDelete.item.originalName} » est utilisé dans :
              </p>
              <ul className="mt-2 text-sm text-gray-800 list-disc pl-5">
                {confirmDelete.usages.map((u) => <li key={u.source} className="list-disc">{u.label}</li>)}
              </ul>
              <p className="text-sm text-gray-600 mt-3">S&apos;il est supprimé, ces emplacements afficheront une image cassée jusqu&apos;à ce qu&apos;un autre fichier soit choisi.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => remove(confirmDelete.item, true)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
                  Supprimer quand même
                </button>
                <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

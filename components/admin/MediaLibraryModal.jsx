"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaList } from "@/lib/store";
import { MEDIA_FOLDERS, formatBytes } from "@/lib/uploadLimits";
import MediaPreview from "./MediaPreview";
import { inputCls } from "./ui";

/** Fenêtre de sélection d'un fichier déjà présent dans la médiathèque. */
export default function MediaLibraryModal({ open, type, onClose, onSelect, multiple = false }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [folder, setFolder] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setItems(null);
    setError("");
    setSelected([]);
    getMediaList({ type, folder, q })
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [open, type, folder, q]);

  const toggle = (item) => {
    if (!multiple) {
      onSelect(item);
      onClose();
      return;
    }
    setSelected((s) => (s.some((x) => x.id === item.id) ? s.filter((x) => x.id !== item.id) : [...s, item]));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Médiathèque">
            <div className="flex items-center justify-between p-5 border-b border-[rgba(13,110,187,0.08)]">
              <h3 className="text-lg font-bold text-gray-900">Choisir dans la médiathèque</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Fermer">✕</button>
            </div>
            <div className="p-5 flex flex-col sm:flex-row gap-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un fichier…" className={inputCls} />
              <select value={folder} onChange={(e) => setFolder(e.target.value)} className={`${inputCls} sm:w-48`}>
                <option value="">Tous les dossiers</option>
                {MEDIA_FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {error ? (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
              ) : items === null ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-square rounded-xl bg-[#f7faff] animate-pulse" />)}
                </div>
              ) : items.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-12">Aucun fichier de ce type dans la médiathèque.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map((item) => {
                    const isSel = selected.some((x) => x.id === item.id);
                    return (
                      <button key={item.id} type="button" onClick={() => toggle(item)}
                        className={`text-left rounded-xl border-2 overflow-hidden transition-colors ${isSel ? "border-[#0DBD9F]" : "border-transparent hover:border-[#0D6EBB]"}`}>
                        <MediaPreview type={item.type} url={item.url} alt={item.alt} className="w-full aspect-square" compact />
                        <div className="p-2 bg-white">
                          <p className="text-xs font-medium text-gray-800 truncate">{item.originalName}</p>
                          <p className="text-[10px] text-gray-400">
                            {formatBytes(item.size)}{item.width ? ` · ${item.width}×${item.height}` : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {multiple && (
              <div className="p-4 border-t border-[rgba(13,110,187,0.08)] flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">Annuler</button>
                <button disabled={!selected.length} onClick={() => { onSelect(selected); onClose(); }}
                  className="bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50">
                  Ajouter {selected.length ? `(${selected.length})` : ""}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

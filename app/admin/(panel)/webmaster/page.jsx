"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDepartmentsSetting, saveDepartmentsSetting } from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import MoveButtons, { moveItem } from "@/components/admin/MoveButtons";
import ComingSoon from "@/components/admin/ComingSoon";
import { inputCls, btnPrimary, btnSecondary, btnGhost } from "@/components/admin/ui";

function DepartmentsEditor() {
  const [list, setList] = useState(null);
  const [entry, setEntry] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const apply = (data) => {
    setEntry(data);
    setList(data.value);
  };

  useEffect(() => {
    getDepartmentsSetting().then(apply).catch((e) => setMessage({ type: "error", text: e.message }));
  }, []);

  const save = async (value) => {
    setSaving(true);
    setMessage(null);
    try {
      apply(await saveDepartmentsSetting(value));
      setMessage({ type: "ok", text: value === null ? "✓ Liste par défaut rétablie" : "✓ Liste enregistrée" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const add = () => {
    const v = newItem.trim();
    if (!v) return;
    if (list.some((d) => d.toLowerCase() === v.toLowerCase())) {
      setMessage({ type: "error", text: "Ce département existe déjà." });
      return;
    }
    setList([...list, v]);
    setNewItem("");
    setMessage(null);
  };

  if (!list) {
    return message ? <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{message.text}</p> : <div className="h-64 bg-white rounded-2xl animate-pulse" />;
  }

  const dirty = JSON.stringify(list) !== JSON.stringify(entry.value);
  const isDefaultList = JSON.stringify(entry.value) === JSON.stringify(entry.defaultValue);

  return (
    <div className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Départements (connexion admin)</h3>
          <p className="text-sm text-gray-500 mt-0.5">Liste proposée à l&apos;étape « Qui êtes-vous ? ». « Autre » est toujours ajouté en dernier.</p>
          <LastModified at={entry.updatedAt} by={entry.updatedBy} isDefault={entry.isDefault} className="mt-1" />
        </div>
        {!isDefaultList && (
          <button type="button" className={btnGhost} disabled={saving} onClick={() => confirm("Rétablir la liste par défaut ?") && save(null)}>
            ↺ Rétablir par défaut
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {list.map((d, i) => (
          <li key={`${d}-${i}`} className="flex items-center gap-3">
            <MoveButtons index={i} length={list.length} onMove={(from, to) => setList(moveItem(list, from, to))} label={d} />
            <input value={d} onChange={(e) => setList(list.map((x, idx) => (idx === i ? e.target.value : x)))} className={inputCls} maxLength={60} aria-label={`Département ${i + 1}`} />
            <button type="button" onClick={() => setList(list.filter((_, idx) => idx !== i))} disabled={list.length <= 1}
              className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-30" aria-label={`Retirer ${d}`}>✕</button>
          </li>
        ))}
        <li className="flex items-center gap-3 pl-10 text-sm text-gray-400 italic">Autre (champ libre)</li>
      </ul>

      <div className="flex gap-2 mt-4">
        <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Nouveau département…" className={inputCls} maxLength={60}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <button type="button" className={btnSecondary} onClick={add}>+ Ajouter</button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={btnPrimary} disabled={!dirty || saving}
          onClick={() => save(list.map((d) => d.trim()).filter(Boolean))}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
        {dirty && <button type="button" className={btnGhost} onClick={() => setList(entry.value)}>Annuler les changements</button>}
        {message && (
          <p className={`text-sm ${message.type === "ok" ? "text-[#0DBD9F]" : "text-red-500"}`} role="status">{message.text}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminWebmasterPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <DepartmentsEditor />
      <ComingSoon icon="🎨" title="Polices et couleurs du site" description="Choix de la police et des couleurs de la charte BLUE, avec aperçu et retour aux valeurs par défaut." />
    </div>
  );
}

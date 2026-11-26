"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getVolunteer, setVolunteer } from "@/lib/store";
import seedVolunteers from "@/lib/data/seed/volunteers.json";
import MediaPicker from "@/components/admin/MediaPicker";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary, btnGhost } from "@/components/admin/ui";

const DEFAULT = seedVolunteers[0];
const FIELDS = ["firstName", "lastName", "location", "photo", "actions", "contribution", "active"];
const pick = (v) => Object.fromEntries(FIELDS.map((k) => [k, v?.[k] ?? (k === "active" ? true : "")]));

function FieldLabel({ htmlFor, children, field, form, setForm }) {
  const changed = (form[field] ?? "") !== (DEFAULT[field] ?? "");
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={htmlFor} className={labelCls}>{children}</label>
      {changed && (
        <button type="button" className={btnGhost} onClick={() => setForm((f) => ({ ...f, [field]: DEFAULT[field] ?? "" }))}>
          ↺ Rétablir par défaut
        </button>
      )}
    </div>
  );
}

export default function AdminVolunteerPage() {
  const [form, setForm] = useState(null);
  const [meta, setMeta] = useState({ updatedAt: null, updatedBy: null });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "ok" | "error", text }

  useEffect(() => {
    getVolunteer()
      .then((v) => {
        setForm(pick(v || DEFAULT));
        setMeta({ updatedAt: v?.updatedAt || null, updatedBy: v?.updatedBy || null });
      })
      .catch((e) => {
        setForm(pick(DEFAULT));
        setMessage({ type: "error", text: e.message });
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const saved = await setVolunteer({ ...form, photo: form.photo || null });
      setForm(pick(saved));
      setMeta({ updatedAt: saved.updatedAt, updatedBy: saved.updatedBy });
      setMessage({ type: "ok", text: "✓ Modifications enregistrées" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return <div className="h-96 bg-white rounded-2xl animate-pulse max-w-3xl" />;
  }

  const labelProps = { form, setForm };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Bénévole du mois</h2>
        <LastModified at={meta.updatedAt} by={meta.updatedBy} className="mt-1" />
      </div>
      <div className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="firstName" field="firstName" {...labelProps}>Prénom</FieldLabel>
            <input id="firstName" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className={inputCls} maxLength={80} />
          </div>
          <div>
            <FieldLabel htmlFor="lastName" field="lastName" {...labelProps}>Nom de famille</FieldLabel>
            <input id="lastName" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className={inputCls} maxLength={80} />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="location" field="location" {...labelProps}>Localisation</FieldLabel>
          <input id="location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className={inputCls} maxLength={120} />
        </div>
        <div className="max-w-sm">
          <MediaPicker
            type="image"
            label="Photo (facultative — les initiales s'affichent sinon)"
            folder="benevoles"
            value={form.photo ? form.photo : null}
            defaultValue={DEFAULT.photo}
            onChange={(url) => setForm((f) => ({ ...f, photo: url || "" }))}
            previewClassName="w-full aspect-square"
            help="Photo publiée uniquement avec l'accord de la personne"
          />
        </div>
        <div>
          <FieldLabel htmlFor="actions" field="actions" {...labelProps}>Actions réalisées</FieldLabel>
          <textarea id="actions" value={form.actions} onChange={(e) => setForm((f) => ({ ...f, actions: e.target.value }))} rows={3} className={`${inputCls} resize-y`} maxLength={2000} />
        </div>
        <div>
          <FieldLabel htmlFor="contribution" field="contribution" {...labelProps}>Contribution environnementale</FieldLabel>
          <textarea id="contribution" value={form.contribution} onChange={(e) => setForm((f) => ({ ...f, contribution: e.target.value }))} rows={3} className={`${inputCls} resize-y`} maxLength={2000} />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="active" checked={!!form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="w-4 h-4 accent-[#0D6EBB]" />
          <label htmlFor="active" className="text-sm text-gray-700">Afficher le bénévole du mois sur le site (popup et page d&apos;accueil)</label>
        </div>
        <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className={`w-full ${btnPrimary}`}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
        {message && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status"
            className={`text-sm text-center rounded-xl px-4 py-2 ${message.type === "ok" ? "text-[#0DBD9F] bg-[rgba(13,189,159,0.08)]" : "text-red-500 bg-red-50"}`}>
            {message.text}
          </motion.p>
        )}
      </div>
    </div>
  );
}

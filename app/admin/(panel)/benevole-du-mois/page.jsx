"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  duplicateVolunteer,
  republishVolunteerNotify,
} from "@/lib/store";
import {
  normalizeVolunteer,
  VOTM_DEFAULT_TEXTS,
  monthLabel,
} from "@/lib/volunteerModel";
import MediaPicker from "@/components/admin/MediaPicker";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary, btnSecondary, btnGhost, cardCls } from "@/components/admin/ui";
import VotmPopup from "@/components/volunteer/VotmPopup";
import VotmBanner from "@/components/volunteer/VotmBanner";

// ISO → valeur d'input datetime-local (heure locale)
const isoToLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const localToIso = (local) => (local ? new Date(local).toISOString() : null);

const NEW_FORM = () =>
  normalizeVolunteer({
    firstName: "",
    lastName: "",
    month: new Date().toISOString().slice(0, 7),
    published: false,
    notifyEnabled: false,
  });

function Toggle({ checked, onChange, disabled, label, hint }) {
  return (
    <div className={`flex items-start gap-3 ${disabled ? "opacity-50" : ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 w-12 h-7 rounded-full transition-colors shrink-0 ${
          checked ? "bg-[#0DBD9F]" : "bg-gray-300"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <span
          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function TextField({ label, field, form, setForm, max = 120, placeholder }) {
  const def = VOTM_DEFAULT_TEXTS[field];
  const custom = form.texts?.[field];
  const changed = (custom ?? "") !== "";
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className={labelCls}>{label}</label>
        {changed && (
          <button
            type="button"
            className={btnGhost}
            onClick={() => setForm((f) => ({ ...f, texts: { ...f.texts, [field]: null } }))}>
            ↺ Rétablir par défaut
          </button>
        )}
      </div>
      <input
        value={custom ?? ""}
        placeholder={placeholder || `Par défaut : « ${def} »`}
        maxLength={max}
        onChange={(e) => setForm((f) => ({ ...f, texts: { ...f.texts, [field]: e.target.value } }))}
        className={inputCls}
      />
    </div>
  );
}

const CHANNELS = [
  { key: "showPopup", label: "Popup" },
  { key: "showBanner", label: "Bannière en haut de page" },
  { key: "showPetals", label: "Pétales (avec la popup)" },
];

const FREQ_OPTIONS = [
  { value: "session", label: "Une fois par session" },
  { value: "day", label: "Une fois par jour" },
  { value: "always", label: "À chaque visite" },
];

export default function AdminVolunteerPage() {
  const [list, setList] = useState(null);
  const [form, setForm] = useState(null); // fiche en cours d'édition
  const [isNew, setIsNew] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [preview, setPreview] = useState(false);

  const reload = useCallback(() => listVolunteers().then(setList).catch((e) => setMessage({ type: "error", text: e.message })), []);

  useEffect(() => {
    listVolunteers()
      .then((l) => {
        setList(l);
        const current = l.find((v) => v.published) || l[0];
        setForm(current ? normalizeVolunteer(current) : NEW_FORM());
      })
      .catch((e) => {
        setList([]);
        setForm(NEW_FORM());
        setMessage({ type: "error", text: e.message });
      });
  }, []);

  const set = useCallback((fn) => {
    setDirty(true);
    setForm((f) => (typeof fn === "function" ? fn(f) : { ...f, ...fn }));
  }, []);

  const select = (v) => {
    setForm(normalizeVolunteer(v));
    setIsNew(false);
    setDirty(false);
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = isNew ? await createVolunteer(form) : await updateVolunteer(form.id, form);
      const saved = res.record || res;
      setForm(normalizeVolunteer(saved));
      setIsNew(false);
      setDirty(false);
      await reload();
      const extra = res.unpublished?.length
        ? ` — ${res.unpublished.join(", ")} n'est plus publié(e)`
        : "";
      setMessage({ type: "ok", text: `✓ Fiche enregistrée${extra}` });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Supprimer la fiche de ${v.firstName} ${v.lastName} (${monthLabel(v.month)}) ?`)) return;
    try {
      await deleteVolunteer(v.id);
      await reload();
      if (form?.id === v.id) { setForm(NEW_FORM()); setIsNew(true); }
      setMessage({ type: "ok", text: "✓ Fiche supprimée" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const handleDuplicate = async (v) => {
    try {
      const res = await duplicateVolunteer(v.id);
      await reload();
      select(res.record);
      setMessage({ type: "ok", text: "✓ Fiche dupliquée en brouillon — choisissez le mois" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const handleRepublish = async () => {
    try {
      const res = await republishVolunteerNotify(form.id);
      setForm(normalizeVolunteer(res.record));
      setMessage({ type: "ok", text: `✓ Notification republiée (version ${res.record.notifyVersion}) — tous les visiteurs la reverront` });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const summary = useMemo(() => {
    if (!form) return "";
    const parts = [form.published ? "Visible sur l'accueil" : "Non visible (brouillon)"];
    if (form.published && form.notifyEnabled) {
      let s = "Notification active";
      const until = form.notifyUntil ? new Date(form.notifyUntil) : null;
      const from = form.notifyFrom ? new Date(form.notifyFrom) : null;
      const now = new Date();
      if (until && until < now) s = "Notification terminée (période passée)";
      else if (from && from > now) s = `Notification à partir du ${from.toLocaleDateString("fr-FR")}`;
      else if (until) s = `Notification active jusqu'au ${until.toLocaleDateString("fr-FR")}`;
      parts.push(s);
      const ch = [form.showPopup && "Popup", form.showBanner && "Bannière", form.showPetals && "Pétales"].filter(Boolean);
      parts.push(ch.length ? ch.join(" + ") : "aucun canal");
    } else {
      parts.push("Pas de notification automatique");
    }
    return parts.join(" · ");
  }, [form]);

  if (!list || !form) return <div className="h-96 bg-white rounded-2xl animate-pulse max-w-4xl" />;

  const notifyAllowed = form.published;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bénévole du mois</h2>
          {!isNew && <LastModified at={form.updatedAt} by={form.updatedBy} className="mt-1" />}
        </div>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => { setForm(NEW_FORM()); setIsNew(true); setDirty(true); setMessage(null); }}>
          + Nouveau bénévole
        </button>
      </div>

      {/* Interrupteurs — très visibles en haut de la fiche */}
      <div className={`${cardCls} p-5 space-y-4`}>
        <Toggle
          checked={form.published}
          onChange={(v) => set((f) => ({ ...f, published: v, notifyEnabled: v ? f.notifyEnabled : false }))}
          label="Publié"
          hint="Le bénévole apparaît dans la section « Bénévole du mois » de l'accueil. Un seul publié à la fois."
        />
        <Toggle
          checked={form.notifyEnabled}
          disabled={!notifyAllowed}
          onChange={(v) => set({ notifyEnabled: v })}
          label="Notification activée"
          hint={
            notifyAllowed
              ? "Affichage automatique à l'ouverture du site (popup, bannière, pétales)."
              : "La notification ne peut être activée que si le bénévole est publié."
          }
        />
        <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">Résumé : {summary}</p>
      </div>

      {/* Notification */}
      {form.notifyEnabled && notifyAllowed && (
        <div className={`${cardCls} p-5 space-y-4`}>
          <h3 className="text-sm font-bold text-gray-900">Canaux d&rsquo;affichage</h3>
          <div className="flex flex-wrap gap-4">
            {CHANNELS.map((ch) => (
              <label key={ch.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[ch.key]}
                  onChange={(e) => set({ [ch.key]: e.target.checked })}
                  className="w-4 h-4 accent-[#0D6EBB]"
                />
                {ch.label}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Du (date et heure, facultatif)</label>
              <input
                type="datetime-local"
                value={isoToLocal(form.notifyFrom)}
                onChange={(e) => set({ notifyFrom: localToIso(e.target.value) })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Au (date et heure, facultatif)</label>
              <input
                type="datetime-local"
                value={isoToLocal(form.notifyUntil)}
                onChange={(e) => set({ notifyUntil: localToIso(e.target.value) })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Délai d&rsquo;apparition de la popup (secondes)</label>
              <input
                type="number"
                min={0}
                max={60}
                step={0.1}
                value={(form.popupDelayMs ?? 1800) / 1000}
                onChange={(e) => set({ popupDelayMs: Math.round(Math.max(0, Math.min(60, +e.target.value || 0)) * 1000) })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Fréquence d&rsquo;affichage</label>
              <select value={form.frequency} onChange={(e) => set({ frequency: e.target.value })} className={inputCls}>
                {FREQ_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap border-t border-gray-100 pt-4">
            <button type="button" className={btnSecondary} onClick={handleRepublish} disabled={isNew}>
              ↻ Republier la notification
            </button>
            <p className="text-xs text-gray-500">
              Version {form.notifyVersion} — tous les visiteurs reverront la notification (clé <code>blue_votm_{form.id ?? "…"}_v{form.notifyVersion}</code>).
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <TextField label="Badge de la popup" field="badge" form={form} setForm={set} max={80} />
            <TextField label="Texte de la bannière" field="bannerText" form={form} setForm={set} max={200} />
            <TextField label="Bouton de la popup" field="popupButton" form={form} setForm={set} max={60} />
            <TextField label="Bouton de la bannière" field="bannerButton" form={form} setForm={set} max={60} />
          </div>
        </div>
      )}

      {/* Fiche */}
      <div className={`${cardCls} p-6 space-y-5`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Prénom *</label>
            <input value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} className={inputCls} maxLength={80} />
          </div>
          <div>
            <label className={labelCls}>Nom de famille *</label>
            <input value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} className={inputCls} maxLength={80} />
          </div>
          <div>
            <label className={labelCls}>Mois concerné</label>
            <input
              type="month"
              value={form.month || ""}
              onChange={(e) => set({ month: e.target.value || null })}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Localisation</label>
          <input value={form.location || ""} onChange={(e) => set({ location: e.target.value })} className={inputCls} maxLength={120} />
        </div>
        <div className="max-w-[180px]">
          <MediaPicker
            type="image"
            label="Photo (initiales si vide)"
            folder="benevoles"
            value={form.photo || null}
            onChange={(url) => set({ photo: url || "" })}
            previewClassName="w-full aspect-square rounded-full overflow-hidden"
            help="Publiée avec l'accord de la personne"
          />
        </div>
        <div>
          <label className={labelCls}>Actions réalisées</label>
          <textarea value={form.actions || ""} onChange={(e) => set({ actions: e.target.value })} rows={3} className={`${inputCls} resize-y`} maxLength={2000} />
        </div>
        <div>
          <label className={labelCls}>Contribution environnementale</label>
          <textarea value={form.contribution || ""} onChange={(e) => set({ contribution: e.target.value })} rows={3} className={`${inputCls} resize-y`} maxLength={2000} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <motion.button onClick={handleSave} disabled={saving || (!dirty && !isNew)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className={`${btnPrimary}`}>
            {saving ? "Enregistrement…" : isNew ? "Créer la fiche" : "Enregistrer"}
          </motion.button>
          <button type="button" className={btnSecondary} onClick={() => setPreview(true)}>
            👁 Prévisualiser
          </button>
        </div>
        {message && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status"
            className={`text-sm rounded-xl px-4 py-2 ${message.type === "ok" ? "text-[#0DBD9F] bg-[rgba(13,189,159,0.08)]" : "text-red-500 bg-red-50"}`}>
            {message.text}
          </motion.p>
        )}
      </div>

      {/* Historique */}
      <div className={`${cardCls} p-5`}>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Historique</h3>
        <ul className="divide-y divide-gray-100">
          {list.map((v) => (
            <li key={v.id} className="py-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full overflow-hidden bg-[rgba(13,110,187,0.1)] flex items-center justify-center text-xs font-bold text-[#0D6EBB] shrink-0 relative">
                {v.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  (v.firstName?.[0] || "") + (v.lastName?.[0] || "")
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{v.firstName} {v.lastName}</p>
                <p className="text-xs text-gray-500">{monthLabel(v.month)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {v.published && <span className="text-[10px] font-bold uppercase tracking-wide bg-[rgba(13,189,159,0.12)] text-[#0a8f76] rounded-full px-2 py-0.5">Publié</span>}
                {!v.published && <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">Brouillon</span>}
                {v.notifyEnabled && <span className="text-[10px] font-bold uppercase tracking-wide bg-[rgba(13,110,187,0.1)] text-[#0D6EBB] rounded-full px-2 py-0.5">Notif</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" className={btnGhost} onClick={() => select(v)}>Modifier</button>
                <button type="button" className={btnGhost} onClick={() => handleDuplicate(v)}>Dupliquer</button>
                <button type="button" className={`${btnGhost} !text-red-500 hover:!bg-red-50`} onClick={() => handleDelete(v)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">Aucune fiche pour le moment.</p>}
      </div>

      {/* Prévisualisation — données en cours d'édition, rien d'enregistré */}
      <AnimatePresence>
        {preview && (
          <>
            <VotmBanner volunteer={form} onViewProfile={null} onClose={() => setPreview(false)} />
            <VotmPopup volunteer={form} petals={form.showPetals} onClose={() => setPreview(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

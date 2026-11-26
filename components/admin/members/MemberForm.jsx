"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createMember, updateMember, memberAccessAction } from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import { MEMBER_STATUSES, MEMBER_ORIGINS, missingForActive } from "@/lib/memberModel";

const EMPTY = {
  firstName: "", lastName: "", phone: "", email: "", commune: "",
  joinedAt: "", status: "pending", activitiesCount: 0, tshirt: false,
  department: "", notes: "", origin: "manual", submissionId: null,
};

// Fiche membre : création / édition + gestion du code d'accès (régénérer,
// désactiver). Le code n'est affiché qu'une seule fois, jamais journalisé.
export default function MemberForm({ member, existing, onClose, onSaved }) {
  const editing = !!member?.id;
  const [form, setForm] = useState(() =>
    member?.id ? { ...EMPTY, ...member } : { ...EMPTY, ...(member || {}) }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null); // membre sauvegardé (pour les actions code)
  const [grant, setGrant] = useState(null); // { code, accessMessage } — une seule fois
  const current = saved || member;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const missing = missingForActive(form);
  const eligible = !missing && form.status !== "active";

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, activitiesCount: Number(form.activitiesCount) || 0 };
      const res = editing ? await updateMember(member.id, payload) : await createMember(payload);
      setSaved(res);
      onSaved?.(res);
      if (!editing) setForm((f) => ({ ...f, id: res.id, identifier: res.identifier }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const accessAction = async (action) => {
    setError("");
    setSaving(true);
    try {
      const res = await memberAccessAction(current.id, action);
      if (res.code) setGrant(res);
      setSaved(res.member);
      onSaved?.(res.member);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = (text) => navigator.clipboard?.writeText(text).catch(() => {});

  const input = inputCls;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {editing || saved ? `Membre ${current?.identifier || ""}` : "Nouveau membre"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {current?.createdAt && <LastModified at={current.updatedAt} by={current.updatedBy} className="mb-4" />}

        {/* Suggestion « passer en Actif » quand la règle est remplie */}
        {eligible && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="text-sm text-emerald-800">
              ✓ 2 activités officielles + T-shirt : ce membre remplit la règle « membre actif ».
            </p>
            <button onClick={() => set("status", "active")}
              className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors">
              Passer en Actif ?
            </button>
          </div>
        )}
        {missing && (
          <p className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
            Règle « membre actif » : il manque {missing.join(" et ")} (au moins 2 activités officielles + T-shirt 5 000 FCFA).
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Prénom *</label>
            <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={input} />
          </div>
          <div>
            <label className={labelCls}>Nom *</label>
            <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={input} />
          </div>
          <div>
            <label className={labelCls}>Téléphone (+225, unique) *</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+225 07 00 00 00 00" className={input} />
          </div>
          <div>
            <label className={labelCls}>Email (facultatif, unique)</label>
            <input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} className={input} />
          </div>
          <div>
            <label className={labelCls}>Commune</label>
            <input value={form.commune || ""} onChange={(e) => set("commune", e.target.value)} className={input} />
          </div>
          <div>
            <label className={labelCls}>Date d&apos;adhésion</label>
            <input type="date" value={(form.joinedAt || "").slice(0, 10)} onChange={(e) => set("joinedAt", e.target.value)} className={input} />
          </div>
          <div>
            <label className={labelCls}>Statut</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={input}>
              {Object.values(MEMBER_STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Activités officielles suivies</label>
            <input type="number" min="0" value={form.activitiesCount ?? 0}
              onChange={(e) => set("activitiesCount", e.target.value)} className={input} />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <button type="button" onClick={() => set("tshirt", !form.tshirt)} aria-pressed={form.tshirt}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.tshirt ? "bg-[#0DBD9F]" : "bg-gray-200"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.tshirt ? "left-[22px]" : "left-0.5"}`} />
            </button>
            <span className="text-sm text-gray-700">T-shirt acheté (5 000 FCFA)</span>
          </div>
          <div>
            <label className={labelCls}>Département / cellule</label>
            <input value={form.department || ""} onChange={(e) => set("department", e.target.value)} className={input} />
          </div>
          <div>
            <label className={labelCls}>Origine</label>
            <select value={form.origin} onChange={(e) => set("origin", e.target.value)} className={input}>
              {Object.entries(MEMBER_ORIGINS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Identifiant</label>
            <input value={current?.identifier || "Généré à l&apos;enregistrement"} disabled className={`${input} opacity-60`} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Notes internes</label>
            <textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${input} resize-y`} />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <motion.button onClick={save} disabled={saving || !form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()}
            whileHover={{ scale: 1.02 }} className={`flex-1 ${btnPrimary}`}>
            {saving ? "Enregistrement…" : saved || editing ? "Enregistrer les modifications" : "Créer le membre"}
          </motion.button>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">
            Fermer
          </button>
        </div>

        {/* Code d'accès — disponible une fois le membre créé */}
        {(current?.id) && (
          <div className="mt-6 rounded-xl border border-[rgba(13,110,187,0.15)] bg-[rgba(13,110,187,0.03)] p-4">
            <p className="font-semibold text-gray-900 text-sm">Accès Blue Academy</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {current.accessDisabled
                ? "L'accès est désactivé : le code ne fonctionne plus."
                : current.codeVersion > 0
                  ? "Un code est actif (régénérer le révoque immédiatement)."
                  : "Aucun code généré pour l'instant."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => accessAction("regenerate")} disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#0D6EBB] text-white text-xs font-bold hover:bg-[#0DBD9F] transition-colors disabled:opacity-50">
                {current.codeVersion > 0 ? "🔁 Régénérer le code" : "🔑 Générer le code"}
              </button>
              {current.accessDisabled ? (
                <button onClick={() => accessAction("enable")} disabled={saving}
                  className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-xs font-bold hover:bg-emerald-50">
                  Réactiver l&apos;accès
                </button>
              ) : (
                <button onClick={() => accessAction("disable")} disabled={saving || !current.codeVersion}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 disabled:opacity-40">
                  Désactiver l&apos;accès
                </button>
              )}
            </div>

            <AnimatePresence>
              {grant && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-4 space-y-3">
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Code affiché une seule fois</p>
                    <p className="mt-1 text-3xl font-extrabold text-gray-900 tracking-[0.4em] text-center">{grant.code}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3">
                    <p className="text-xs font-semibold text-gray-500">Message WhatsApp</p>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{grant.accessMessage}</p>
                    <button onClick={() => copy(grant.accessMessage)}
                      className="mt-2 w-full rounded-lg bg-[#25D366]/15 text-[#128C4B] px-4 py-2 text-xs font-bold hover:bg-[#25D366]/25 transition-colors">
                      📋 Copier le message WhatsApp
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

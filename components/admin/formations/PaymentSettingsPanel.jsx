"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getAdminSettings, saveSiteSetting } from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";

const OPERATORS = [
  { key: "orange", label: "Orange Money" },
  { key: "mtn", label: "MTN MoMo" },
  { key: "moov", label: "Moov Money" },
  { key: "wave", label: "Wave" },
];

// Réglages du paiement manuel : numéros Mobile Money (activables),
// bénéficiaire, instructions, délai de vérification, modèle de message.
export default function PaymentSettingsPanel() {
  const [entry, setEntry] = useState(undefined);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    getAdminSettings()
      .then(({ settings }) => {
        setEntry(settings.payments);
        setForm(settings.payments?.value || null);
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const setOp = (key, patch) =>
    setForm((f) => ({ ...f, operators: { ...f.operators, [key]: { ...f.operators[key], ...patch } } }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await saveSiteSetting("payments", form);
      setEntry(res);
      setForm(res.value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Rétablir les réglages de paiement par défaut ?")) return;
    const res = await saveSiteSetting("payments", null);
    setEntry(res);
    setForm(res.value);
  };

  if (!form) {
    return error
      ? <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      : <div className="h-64 bg-white rounded-xl animate-pulse" />;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Réglages de paiement (Mobile Money)</h2>
        <LastModified at={entry?.updatedAt} by={entry?.updatedBy} />
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
          <p className="font-semibold text-gray-900 mb-4">Numéros de réception des paiements</p>
          <div className="space-y-3">
            {OPERATORS.map(({ key, label }) => {
              const op = form.operators?.[key] || { enabled: false, number: "" };
              return (
                <div key={key} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOp(key, { enabled: !op.enabled })}
                    aria-pressed={op.enabled}
                    className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${op.enabled ? "bg-[#0DBD9F]" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${op.enabled ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                  <span className="w-32 text-sm font-medium text-gray-700">{label}</span>
                  <input
                    value={op.number}
                    onChange={(e) => setOp(key, { number: e.target.value })}
                    placeholder="+225 07 00 00 00 00"
                    disabled={!op.enabled}
                    className={`${inputCls} flex-1 disabled:opacity-40`}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Seuls les opérateurs activés (avec un numéro) sont proposés au visiteur.</p>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5 space-y-4">
          <div>
            <label className={labelCls}>Nom du bénéficiaire</label>
            <input value={form.beneficiary || ""} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Instructions affichées au payeur</label>
            <textarea value={form.instructions || ""} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows={3} className={`${inputCls} resize-y`} />
          </div>
          <div>
            <label className={labelCls}>Délai de vérification (page de confirmation)</label>
            <input value={form.verificationDelay || ""} onChange={(e) => setForm({ ...form, verificationDelay: e.target.value })}
              placeholder="Ex : Votre paiement est vérifié sous 24 à 48 heures." className={inputCls} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
          <label className={labelCls}>Modèle du message d&apos;accès (WhatsApp)</label>
          <textarea value={form.accessMessageTemplate || ""} onChange={(e) => setForm({ ...form, accessMessageTemplate: e.target.value })}
            rows={3} className={`${inputCls} resize-y`} />
          <p className="text-[11px] text-gray-400 mt-1">
            Variables : {"{prénom}"}, {"{identifiant}"}, {"{code}"}, {"{lien}"}
          </p>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <motion.button onClick={save} disabled={saving} whileHover={{ scale: 1.02 }} className={btnPrimary}>
            {saving ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer"}
          </motion.button>
          <button onClick={reset} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">
            ↺ Rétablir par défaut
          </button>
        </div>
      </div>
    </div>
  );
}

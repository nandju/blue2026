"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPayments, decidePayment, paymentsExportUrl, paymentScreenshotUrl } from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";

const OPERATORS = { orange: "Orange Money", mtn: "MTN MoMo", moov: "Moov Money", wave: "Wave" };
const STATUS = {
  pending: { label: "En attente", cls: "bg-amber-100 text-amber-700" },
  validated: { label: "Validé", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Refusé", cls: "bg-red-100 text-red-600" },
};
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—");
const fmtPrice = (n) => (n == null ? "—" : `${Number(n).toLocaleString("fr-FR")} FCFA`);

export default function PaymentsPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [grant, setGrant] = useState(null); // { member, code, accessMessage } — affiché une fois

  const load = useCallback(() => {
    getPayments({ status: status || undefined, q: q || undefined, pageSize: 200 })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [status, q]);
  useEffect(() => { load(); }, [load]);

  const decide = async (action) => {
    if (!detail) return;
    setError("");
    setBusy(true);
    try {
      const res = await decidePayment(detail.id, action, rejectReason);
      if (action === "validate") {
        setGrant(res);
      }
      setDetail(null);
      setRejectReason("");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = (text) => navigator.clipboard?.writeText(text).catch(() => {});

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Paiements{" "}
          {data?.pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 text-amber-700 px-3 py-0.5 text-xs font-bold">
              {data.pendingCount} en attente
            </span>
          )}
        </h2>
        <a href={paymentsExportUrl({ status: status || undefined })} className="text-sm font-semibold text-[#0D6EBB] hover:text-[#0DBD9F] transition-colors">
          Export CSV ↓
        </a>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, téléphone, référence…)" className={`${inputCls} flex-1 min-w-52`} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="validated">Validé</option>
          <option value="rejected">Refusé</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
      {!data && !error && <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>}
      {data?.items?.length === 0 && (
        <div className="text-center py-16 text-gray-400"><p className="text-3xl mb-2">💳</p><p>Aucun paiement</p></div>
      )}

      <div className="space-y-3">
        {data?.items?.map((p) => (
          <button key={p.id} onClick={() => setDetail(p)}
            className="w-full text-left bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-4 hover:border-[#0D6EBB] transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {p.firstName} {p.lastName} — <span className="text-[#0D6EBB]">{fmtPrice(p.amountFcfa)}</span>
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {p.courseTitle} · {OPERATORS[p.operator] || p.operator} · réf. {p.transactionRef}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{fmtDate(p.createdAt)} · {p.phone}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS[p.status]?.cls}`}>
                {STATUS[p.status]?.label || p.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Détail + décision */}
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Paiement {fmtPrice(detail.amountFcfa)} — {detail.courseTitle}</h3>
                <button onClick={() => { setDetail(null); setRejectReason(""); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[["Payeur", `${detail.firstName} ${detail.lastName}`], ["Téléphone", detail.phone],
                  ["Email", detail.email || "—"], ["Opérateur", OPERATORS[detail.operator] || detail.operator],
                  ["Référence", detail.transactionRef], ["Déclaré le", fmtDate(detail.createdAt)],
                  ["Statut", STATUS[detail.status]?.label], ["Motif du refus", detail.rejectReason || "—"],
                ].map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-gray-400">{k}</dt><dd className="font-medium text-gray-800">{v}</dd></div>
                ))}
              </dl>
              {detail.decidedAt && <LastModified at={detail.decidedAt} by={{ name: detail.decidedBy }} className="mt-2" />}

              {detail.screenshot && (
                <div className="mt-4">
                  <p className={labelCls}>Capture du paiement</p>
                  <a href={paymentScreenshotUrl(detail.screenshot)} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={paymentScreenshotUrl(detail.screenshot)} alt="Capture du paiement"
                      className="mt-1 max-h-64 rounded-xl border border-gray-200 object-contain" />
                  </a>
                </div>
              )}

              {detail.status === "pending" && (
                <div className="mt-5 space-y-3">
                  <div>
                    <label className={labelCls}>Motif du refus (obligatoire pour refuser)</label>
                    <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className={inputCls}
                      placeholder="Ex : référence introuvable, montant incorrect…" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => decide("validate")} disabled={busy}
                      className={`flex-1 ${btnPrimary}`}>
                      ✓ Valider — ouvrir l&apos;accès
                    </button>
                    <button onClick={() => decide("reject")} disabled={busy || !rejectReason.trim()}
                      className="px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-40">
                      Refuser
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code d&apos;accès affiché UNE SEULE FOIS après validation */}
      <AnimatePresence>
        {grant && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="text-center">
                <span className="text-4xl">✅</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">Accès ouvert pour {grant.member.firstName}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Compte <strong>{grant.member.identifier}</strong> — l&apos;accès à « {grant.payment.courseTitle} » est activé.
                </p>
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Code d&apos;accès — affiché une seule fois</p>
                <p className="mt-1 text-3xl font-extrabold text-gray-900 tracking-[0.4em] text-center">{grant.code}</p>
              </div>
              <div className="mt-4 rounded-xl border border-gray-200 p-3">
                <p className={labelCls}>Message WhatsApp à envoyer à l&apos;apprenant</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{grant.accessMessage}</p>
                <button onClick={() => copy(grant.accessMessage)} className={`mt-3 w-full ${btnPrimary}`}>
                  📋 Copier le message WhatsApp
                </button>
              </div>
              <button onClick={() => setGrant(null)} className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600">Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

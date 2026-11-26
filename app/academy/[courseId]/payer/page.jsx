"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourseAccess, getPaymentConfig, submitPayment } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import MemberCta from "@/components/academy/MemberCta";

const OPERATOR_LABELS = {
  orange: "Orange Money",
  mtn: "MTN MoMo",
  moov: "Moov Money",
  wave: "Wave",
};
const fmtPrice = (n) => `${Number(n).toLocaleString("fr-FR")} FCFA`;

const input =
  "w-full rounded-xl border border-[rgb(var(--color-primary-rgb)/0.2)] px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none transition-colors";
const label = "block text-xs font-semibold text-gray-600 mb-1.5";

export default function PayCoursePage() {
  const { courseId } = useParams();
  const t = useContent("academy.payment") || {};
  const [accessInfo, setAccessInfo] = useState(undefined);
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", operator: "", transactionRef: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    Promise.all([getCourseAccess(courseId), getPaymentConfig().catch(() => null)]).then(([a, c]) => {
      setAccessInfo(a);
      setConfig(c);
      const firstOp = Object.keys(c?.operators || {})[0];
      if (firstOp) setForm((f) => ({ ...f, operator: firstOp }));
      if (a?.learner) {
        setForm((f) => ({ ...f, firstName: a.learner.firstName || "", lastName: a.learner.lastName || "", phone: a.learner.phone || "", email: a.learner.email || "" }));
      }
    });
  }, [courseId]);

  const course = accessInfo?.course || null;
  const price = accessInfo?.paywall?.price ?? accessInfo?.course?.price_fcfa ?? 0;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("courseId", courseId);
      for (const [k, v] of Object.entries(form)) fd.append(k, v);
      if (file) fd.append("screenshot", file);
      const res = await submitPayment(fd);
      setDone(res);
    } catch (err) {
      setError(err.message || "Envoi impossible.");
      setBusy(false);
    }
  };

  if (accessInfo === undefined) {
    return (
      <main className="min-h-screen bg-[rgb(var(--color-primary-rgb)/0.04)] py-20">
        <div className="mx-auto max-w-2xl px-6 animate-pulse"><div className="h-60 bg-white rounded-2xl border" /></div>
      </main>
    );
  }
  if (!course) {
    return (
      <main className="min-h-screen py-20 text-center">
        <p className="text-gray-500">Formation introuvable.</p>
        <Link href="/academy" className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary)]">← Retour au catalogue</Link>
      </main>
    );
  }

  // ── Écran de confirmation ───────────────────────────────────────────────
  if (done) {
    return (
      <main className="min-h-screen bg-[rgb(var(--color-primary-rgb)/0.04)] py-16">
        <div className="mx-auto max-w-xl px-6">
          <div className="rounded-2xl bg-white border border-emerald-200 shadow-lg p-8 text-center">
            <span className="text-5xl">✅</span>
            <h1 className="mt-4 text-2xl font-extrabold text-[var(--color-navy)]">{t.confirmTitle || "Paiement en cours de vérification"}</h1>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{t.confirmText}</p>
            {done.verificationDelay ? (
              <p className="mt-4 text-sm font-semibold text-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.08)] rounded-xl px-4 py-3">
                {done.verificationDelay}
              </p>
            ) : null}
            <Link href="/academy" className="mt-6 inline-block rounded-full bg-[var(--color-primary)] px-7 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
              Retour aux formations
            </Link>
          </div>
          <MemberCta className="mt-6" />
        </div>
      </main>
    );
  }

  // ── Formulaire de déclaration ───────────────────────────────────────────
  const operators = Object.entries(config?.operators || {});
  return (
    <main className="min-h-screen bg-[rgb(var(--color-primary-rgb)/0.04)] py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-6">
        <Link href={`/academy/${courseId}`} className="text-sm font-semibold text-[var(--color-primary)]">
          ← {course.title}
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold text-[var(--color-navy)]">{t.title || "Payer cette formation"}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {course.title} — <strong className="text-[var(--color-primary)]">{fmtPrice(price)}</strong>
        </p>

        {/* Instructions de l'admin */}
        <div className="mt-6 rounded-2xl bg-white border border-[rgb(var(--color-primary-rgb)/0.12)] p-6">
          <p className="text-sm text-gray-600 leading-relaxed">{config?.instructions}</p>
          {config?.beneficiary ? (
            <p className="mt-2 text-sm text-gray-600">Bénéficiaire : <strong>{config.beneficiary}</strong></p>
          ) : null}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {operators.map(([key, op]) => (
              <div key={key} className="rounded-xl border border-[rgb(var(--color-primary-rgb)/0.15)] px-4 py-3">
                <p className="text-xs font-semibold text-gray-500">{OPERATOR_LABELS[key] || key}</p>
                <p className="text-base font-bold text-[var(--color-navy)] tracking-wide">{op.number}</p>
              </div>
            ))}
            {operators.length === 0 && (
              <p className="text-sm text-amber-700">Aucun numéro de paiement n&apos;est configuré pour le moment.</p>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-2xl bg-white border border-[rgb(var(--color-primary-rgb)/0.12)] shadow-lg p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t.firstNameLabel || "Prénom"} *</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className={input} />
            </div>
            <div>
              <label className={label}>{t.nameLabel || "Nom"} *</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className={input} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t.phoneLabel || "Téléphone"} *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+225 07 00 00 00 00" required className={input} />
            </div>
            <div>
              <label className={label}>{t.emailLabel || "Email (facultatif)"}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t.operatorLabel || "Opérateur"} *</label>
              <select value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} required className={input}>
                {operators.map(([key]) => (
                  <option key={key} value={key}>{OPERATOR_LABELS[key] || key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>{t.refLabel || "Référence de la transaction"} *</label>
              <input value={form.transactionRef} onChange={(e) => setForm({ ...form, transactionRef: e.target.value })} required className={input} />
            </div>
          </div>
          <div>
            <label className={label}>{t.screenshotLabel || "Capture du paiement (facultative, image ≤ 5 Mo)"}</label>
            <input
              type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[rgb(var(--color-primary-rgb)/0.1)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-primary)]"
            />
          </div>
          {error ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p> : null}
          <button
            type="submit" disabled={busy || operators.length === 0}
            className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50">
            {busy ? "Envoi…" : t.submitLabel || "Envoyer ma déclaration de paiement"}
          </button>
        </form>

        <MemberCta className="mt-6" />
      </div>
    </main>
  );
}

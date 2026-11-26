"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { learnerLogin } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useContent("academy.login") || {};
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await learnerLogin(identifier.trim(), code.trim());
      router.push(params.get("retour") || "/academy");
    } catch (err) {
      setError(err.message || "Identifiant ou code incorrect.");
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-[rgb(var(--color-primary-rgb)/0.2)] px-4 py-3 text-sm focus:border-[var(--color-primary)] outline-none transition-colors";

  return (
    <main className="min-h-screen bg-[rgb(var(--color-primary-rgb)/0.04)] py-16 md:py-24">
      <div className="mx-auto max-w-md px-6">
        <div className="text-center">
          <span className="text-4xl">🎓</span>
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--color-navy)]">
            {t.title || "Connexion à Blue Academy"}
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">{t.lead}</p>
        </div>

        <form onSubmit={submit} className="mt-8 rounded-2xl bg-white border border-[rgb(var(--color-primary-rgb)/0.12)] shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.identifierLabel || "Identifiant BLUE"}
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="BLUE-ADH-0001"
              autoComplete="username"
              required
              className={input}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {t.codeLabel || "Code d'accès"}
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6 chiffres"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className={input}
            />
          </div>
          {error ? <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p> : null}
          <button
            type="submit"
            disabled={busy || identifier.trim().length < 4 || code.length !== 6}
            className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50">
            {busy ? "Connexion…" : t.submitLabel || "Me connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 leading-relaxed">{t.help}</p>
          <Link
            href={t.helpCta?.href || "/recrutement"}
            className="mt-3 inline-block text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
            {t.helpCta?.label || "Voir les recrutements"} →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AcademyLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

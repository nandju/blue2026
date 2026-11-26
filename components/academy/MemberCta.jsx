"use client";
import Link from "next/link";
import { useContent } from "@/components/SiteContentProvider";

// Encart d'incitation « Rejoignez BLUE » — affiché après un paiement, à la
// fin d'une formation et sur le certificat d'un apprenant payant.
export default function MemberCta({ className = "" }) {
  const cta = useContent("academy.memberCta") || {};
  return (
    <div
      className={`rounded-2xl border border-[rgb(var(--color-secondary-rgb)/0.35)] bg-[rgb(var(--color-secondary-rgb)/0.08)] p-6 ${className}`}>
      <p className="font-bold text-[var(--color-navy)] text-base leading-snug">
        {cta.title || "Rejoignez BLUE et accédez gratuitement à toutes les formations"}
      </p>
      {cta.text ? <p className="mt-2 text-sm text-gray-600 leading-relaxed">{cta.text}</p> : null}
      <Link
        href={cta.cta?.href || "/recrutement"}
        className="mt-4 inline-block rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
        {cta.cta?.label || "Devenir membre actif"}
      </Link>
    </div>
  );
}

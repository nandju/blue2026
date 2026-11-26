"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLearnerMe, learnerLogout } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";

// Bannière de l'apprenant connecté, affichée en haut des pages Academy :
// « Bonjour {prénom} · Membre actif » (ou « Accès payant ») + déconnexion.
export default function LearnerBanner({ onLearner }) {
  const router = useRouter();
  const t = useContent("academy.mySpace") || {};
  const [learner, setLearner] = useState(undefined); // undefined = chargement

  useEffect(() => {
    getLearnerMe().then((me) => {
      const l = me?.learner || null;
      setLearner(l);
      onLearner?.(l);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!learner) return null;
  const badge =
    learner.kind === "external" ? t.paidAccess || "Accès payant"
    : learner.status === "active" ? t.activeMember || "Membre actif"
    : learner.status === "inactive" ? t.inactiveMember || "Membre inactif"
    : t.pendingMember || "Membre en cours";

  const logout = async () => {
    await learnerLogout().catch(() => {});
    setLearner(null);
    onLearner?.(null);
    router.refresh();
  };

  return (
    <div className="bg-[var(--color-navy)] border-b border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-white/90 text-sm">
          Bonjour <strong>{learner.firstName}</strong>
          <span className="mx-2 text-white/40">·</span>
          <span className="text-[var(--color-secondary)] font-semibold">{badge}</span>
          <span className="mx-2 text-white/40">·</span>
          <span className="text-white/50 text-xs">{learner.identifier}</span>
        </p>
        <div className="flex items-center gap-4">
          <Link href="/academy/mon-espace" className="text-xs font-semibold text-white/80 hover:text-white transition-colors">
            {t.title || "Mon espace"}
          </Link>
          <button
            onClick={logout}
            className="text-xs font-semibold text-white/60 hover:text-white transition-colors underline underline-offset-2">
            {t.logoutLabel || "Me déconnecter"}
          </button>
        </div>
      </div>
    </div>
  );
}

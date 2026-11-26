"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLearnerMe, learnerLogout } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import MemberCta from "@/components/academy/MemberCta";
import { missingMessage } from "@/lib/memberModel";

const fmtPrice = (n) => `${Number(n).toLocaleString("fr-FR")} FCFA`;
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "—");

export default function MySpacePage() {
  const router = useRouter();
  const t = useContent("academy.mySpace") || {};
  const [data, setData] = useState(undefined);

  useEffect(() => {
    getLearnerMe().then((me) => {
      if (!me?.learner) {
        router.replace("/academy/connexion?retour=/academy/mon-espace");
        return;
      }
      setData(me);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    await learnerLogout().catch(() => {});
    router.push("/academy");
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-[rgb(var(--color-primary-rgb)/0.04)] py-20">
        <div className="mx-auto max-w-4xl px-6 animate-pulse space-y-4">
          <div className="h-8 w-56 bg-[var(--color-primary)]/10 rounded" />
          <div className="h-40 bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.1)]" />
        </div>
      </main>
    );
  }

  const { learner, courses } = data;
  const badge =
    learner.kind === "external" ? t.paidAccess || "Accès payant"
    : learner.status === "active" ? t.activeMember || "Membre actif"
    : learner.status === "inactive" ? t.inactiveMember || "Membre inactif"
    : t.pendingMember || "Membre en cours";
  const missing = learner.kind !== "external" ? missingMessage(learner) : null;
  const certs = courses.filter((e) => e.certificate);
  const paidLearner = learner.kind === "external";

  return (
    <main className="min-h-screen bg-[rgb(var(--color-primary-rgb)/0.04)] py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Profil */}
        <div className="rounded-2xl bg-white border border-[rgb(var(--color-primary-rgb)/0.12)] shadow-sm p-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--color-navy)]">{t.title || "Mon espace"}</h1>
            <p className="mt-1 text-sm text-gray-500">
              <strong className="text-gray-700">{learner.firstName} {learner.lastName}</strong>
              <span className="mx-2 text-gray-300">·</span>{learner.identifier}
            </p>
            <span className="mt-3 inline-block rounded-full bg-[rgb(var(--color-secondary-rgb)/0.12)] text-[var(--color-secondary)] px-3 py-1 text-xs font-bold">
              {badge}
            </span>
            {missing ? (
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{missing}</p>
            ) : null}
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-[rgb(var(--color-primary-rgb)/0.25)] px-5 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.06)] transition-colors">
            {t.logoutLabel || "Me déconnecter"}
          </button>
        </div>

        {/* Formations */}
        <h2 className="mt-10 text-lg font-bold text-[var(--color-navy)]">{t.myCourses || "Mes formations"}</h2>
        <div className="mt-4 space-y-3">
          {courses.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-[rgb(var(--color-primary-rgb)/0.25)] p-8 text-center">
              <p className="text-gray-500 text-sm">Aucune formation suivie pour le moment.</p>
              <Link href="/academy" className="mt-4 inline-block rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
                Découvrir le catalogue
              </Link>
            </div>
          ) : (
            courses.map(({ course, access, paywall, bestResult }) => (
              <div key={course.id} className="rounded-2xl bg-white border border-[rgb(var(--color-primary-rgb)/0.12)] p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/academy/${course.id}`} className="font-bold text-[var(--color-navy)] hover:text-[var(--color-primary)] transition-colors">
                    {course.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    {access === "activeMember" && <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 font-semibold">Membre actif — accès gratuit</span>}
                    {access === "free" && <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 font-semibold">Gratuite</span>}
                    {access === "paid" && <span className="rounded-full bg-sky-50 text-sky-700 px-2.5 py-0.5 font-semibold">Accès payant</span>}
                    {!access && (course.price_fcfa || 0) > 0 && (
                      <span className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 font-semibold">Payante — {fmtPrice(course.price_fcfa)}</span>
                    )}
                    {bestResult ? (
                      <span className="text-gray-500">Meilleur score : {bestResult.score}% {bestResult.passed ? "· réussi ✓" : ""}</span>
                    ) : null}
                  </div>
                  {paywall?.missingMessage ? <p className="mt-1.5 text-xs text-amber-700">{paywall.missingMessage}</p> : null}
                </div>
                {access ? (
                  <Link href={`/academy/${course.id}`} className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
                    {bestResult ? "Reprendre" : "Commencer"}
                  </Link>
                ) : (
                  <Link href={`/academy/${course.id}`} className="rounded-full border border-[rgb(var(--color-primary-rgb)/0.3)] px-5 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.06)] transition-colors">
                    Voir les options
                  </Link>
                )}
              </div>
            ))
          )}
        </div>

        {/* Certificats */}
        {certs.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-bold text-[var(--color-navy)]">{t.myCertificates || "Mes certificats"}</h2>
            <div className="mt-4 space-y-3">
              {certs.map(({ course, certificate, bestResult }) => (
                <div key={course.id} className="rounded-2xl bg-white border border-[rgb(var(--color-primary-rgb)/0.12)] p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-[var(--color-navy)]">{certificate.courseTitle || course.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Demandé le {fmtDate(certificate.date)}
                      {bestResult ? ` · score ${bestResult.score}%` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    certificate.status === "approved" ? "bg-emerald-50 text-emerald-700"
                    : certificate.status === "rejected" ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                  }`}>
                    {certificate.status === "approved" ? "Validé" : certificate.status === "rejected" ? "Refusé" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Incitation : apprenant payant ou membre non actif */}
        {(paidLearner || missing) && <MemberCta className="mt-10" />}
      </div>
    </main>
  );
}

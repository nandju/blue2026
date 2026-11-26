"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getStats, getCertificateRequests, getActivityLogs } from "@/lib/store";
import { useAdminSession } from "@/components/admin/AdminSessionContext";
import { formatDateTime, shortName } from "@/components/admin/ui";

function StatCard({ label, value, icon, color = "#0D6EBB", href }) {
  const body = (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-[rgba(13,110,187,0.12)] shadow-sm h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <div className="w-8 h-8 rounded-xl" style={{ background: `${color}22` }} />
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value ?? "—"}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </motion.div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default function AdminDashboardPage() {
  const session = useAdminSession();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats().then(setStats).catch((e) => setError(e.message));
    getCertificateRequests()
      .then((reqs) => setPending(reqs.filter((r) => r.status === "pending").length))
      .catch(() => setPending(null));
    getActivityLogs({ pageSize: 6 }).then((r) => setActivities(r.items || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Bonjour {session?.name ? shortName(session.name) : ""} 👋</h2>
        <p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble de la plateforme BLUE.</p>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Formations" value={stats?.courses} icon="🎓" href="/admin/formations" />
        <StatCard label="Apprenants inscrits" value={stats?.registrations} icon="👥" color="#0DBD9F" href="/admin/formations" />
        <StatCard label="Certificats délivrés" value={stats?.certificates} icon="🏆" href="/admin/formations?onglet=certificats" />
        <StatCard label="Conversations MR BLUE" value={stats?.conversations} icon="💬" color="#0DBD9F" href="/admin/mr-blue" />
        <StatCard label="Bénévole du mois actif" value={stats?.volunteers} icon="🌟" href="/admin/benevole-du-mois" />
        <StatCard label="Demandes en attente" value={pending} icon="⏳" color="#f59e0b" href="/admin/formations?onglet=certificats" />
        <StatCard label="Recrutements ouverts" value={stats?.recruitment?.open} icon="📣" href="/admin/recrutement" />
        <StatCard label="Candidatures (7 j)" value={stats?.recruitment?.submissions7d} icon="📝" color="#0DBD9F" href="/admin/recrutement" />
        <StatCard label="Prochaine clôture" value={stats?.recruitment?.nextClosing ? new Date(stats.recruitment.nextClosing).toLocaleDateString("fr-FR") : "—"} icon="📅" color="#f59e0b" href="/admin/recrutement" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Dernières actions</h3>
            <Link href="/admin/journal" className="text-sm text-[#0D6EBB] hover:text-[#0DBD9F]">Voir le journal →</Link>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Aucune action enregistrée pour le moment.</p>
          ) : (
            <ul className="divide-y divide-[rgba(13,110,187,0.08)]">
              {activities.map((a) => (
                <li key={a.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      <span className="font-semibold">{a.action}</span> · {a.module} — {a.target}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{shortName(a.name)} ({a.department})</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-1">Plateforme BLUE</h3>
          <p className="text-white/80 text-sm">
            Gestion centralisée des formations, certificats, conversations MR BLUE, bénévoles et médias.
            Chaque action est enregistrée dans le journal à votre nom.
          </p>
        </div>
      </div>
    </div>
  );
}

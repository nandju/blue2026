"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminCourses, deleteCourse,
  getCertificateRequests, updateCertificateRequest,
} from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/ui";
import PaymentsPanel from "@/components/admin/formations/PaymentsPanel";
import PaymentSettingsPanel from "@/components/admin/formations/PaymentSettingsPanel";
import AiSettingsPanel from "@/components/admin/formations/AiSettingsPanel";
import CourseEditor from "@/components/admin/formations/CourseEditor";
import GenerateFromPdf from "@/components/admin/formations/GenerateFromPdf";

const TABS = [
  { id: "formations", label: "Formations" },
  { id: "certificats", label: "Demandes de certificats" },
  { id: "paiements", label: "Paiements" },
  { id: "reglages", label: "Réglages de paiement" },
  { id: "ia", label: "Réglages IA" },
];

// ─── Formations ────────────────────────────────────────────────────────────
function CourseManagement() {
  const [courses, setCourses] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(null); // { course, isNew }
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    setLoadError("");
    getAdminCourses().then(setCourses).catch((e) => setLoadError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (c) => {
    if (!confirm(`Supprimer la formation « ${c.title} » ?\nLes inscriptions, résultats, progressions et demandes de certificat associés seront aussi supprimés.`)) return;
    try {
      await deleteCourse(c.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const statusBadge = (c) =>
    (c.status ?? "published") === "published"
      ? { cls: "bg-[rgba(13,189,159,0.12)] text-[#0a8f78]", label: "Publié" }
      : { cls: "bg-amber-100 text-amber-700", label: "Brouillon" };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestion des formations</h2>
        <div className="flex gap-2">
          <motion.button onClick={() => setGenerating(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className={btnSecondary}>
            📄 Créer depuis un PDF
          </motion.button>
          <motion.button onClick={() => setEditing({ course: null, isNew: true })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className={btnPrimary}>
            + Ajouter une formation
          </motion.button>
        </div>
      </div>

      {loadError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{loadError}</p>}
      {courses === null && !loadError && (
        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
      )}
      {courses?.length === 0 && <p className="text-center text-gray-400 py-12">Aucune formation.</p>}

      <div className="space-y-3">
        {courses?.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {c.cover ? <img src={c.cover} alt="" className="w-full h-full object-cover rounded-lg" /> : c.title[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusBadge(c).cls}`}>{statusBadge(c).label}</span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">
                  {c.level} · {c.duration} · {(c.sections || []).length} modules · {(c.quiz || []).length} questions · {c.enrolled || 0} inscrits
                  {(c.price_fcfa || 0) > 0
                    ? ` · ${Number(c.price_fcfa).toLocaleString("fr-FR")} FCFA`
                    : " · Gratuite"}
                  {c.ai_provider ? ` · ✨ ${c.ai_provider}` : ""}
                </p>
                <LastModified at={c.updated_by ? c.updated_at : null} by={c.updated_by} className="mt-0.5" />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing({ course: c, isNew: false })} className="text-[#0D6EBB] hover:text-[#0DBD9F] text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-[rgba(13,110,187,0.06)]">Modifier</button>
              <button onClick={() => handleDelete(c)} className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50">Supprimer</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <CourseEditor
            course={editing.course}
            isNew={editing.isNew}
            onSaved={load}
            onClose={() => setEditing(null)}
          />
        )}
        {generating && (
          <GenerateFromPdf
            onDone={(res) => {
              setGenerating(false);
              load();
              if (res?.course) setEditing({ course: res.course, isNew: false });
            }}
            onClose={() => setGenerating(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Demandes de certificats ───────────────────────────────────────────────
function CertificateManagement() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const load = useCallback(() => {
    getCertificateRequests().then(setRequests).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, status) => {
    setError("");
    try {
      await updateCertificateRequest(id, { status });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const filtered = (requests || []).filter((r) =>
    `${r.firstName} ${r.lastName} ${r.email} ${r.courseTitle}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-[rgba(13,189,159,0.12)] text-[#0DBD9F]", rejected: "bg-red-100 text-red-500" };
  const statusLabel = { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Demandes de certificats officiels ({requests?.length ?? "…"})</h2>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un apprenant..." className={`${inputCls} mb-4`} />
      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
      {requests !== null && filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-3xl mb-2">🏆</p><p>Aucune demande</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{r.firstName} {r.lastName}</p>
                  <p className="text-gray-500 text-xs mt-0.5 break-all">{r.email} · Score : {r.score}%</p>
                  <p className="text-gray-600 text-sm mt-1">{r.courseTitle}</p>
                  {r.paymentInfo && <p className="text-gray-500 text-xs mt-1">ℹ️ {r.paymentInfo}</p>}
                  <p className="text-gray-400 text-xs mt-1">Demande du {new Date(r.date).toLocaleDateString("fr-FR")}</p>
                  {r.updatedBy && <LastModified at={r.updatedAt} by={r.updatedBy} className="mt-1" />}
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadge[r.status]}`}>{statusLabel[r.status]}</span>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(r.id, "approved")} className="text-[#0DBD9F] hover:text-[#0D6EBB] text-xs font-medium transition-colors px-3 py-1 bg-[rgba(13,189,159,0.1)] rounded-lg">Approuver</button>
                      <button onClick={() => handleAction(r.id, "rejected")} className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors px-3 py-1 bg-red-50 rounded-lg">Rejeter</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCoursesPage() {
  const [tab, setTab] = useState("formations");

  useEffect(() => {
    const onglet = new URLSearchParams(window.location.search).get("onglet");
    if (TABS.some((t) => t.id === onglet)) setTab(onglet);
  }, []);

  const selectTab = (id) => {
    setTab(id);
    window.history.replaceState(null, "", id === "formations" ? "/admin/formations" : `/admin/formations?onglet=${id}`);
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-[rgba(13,110,187,0.1)] w-fit" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => selectTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-[#0D6EBB] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "formations" ? <CourseManagement />
            : tab === "certificats" ? <CertificateManagement />
            : tab === "paiements" ? <PaymentsPanel />
            : tab === "reglages" ? <PaymentSettingsPanel />
            : <AiSettingsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

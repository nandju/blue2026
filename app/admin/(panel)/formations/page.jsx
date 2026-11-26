"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminCourses, addCourse, updateCourse, deleteCourse,
  getCertificateRequests, updateCertificateRequest,
} from "@/lib/store";
import seedCourses from "@/lib/data/seed/courses.json";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import PaymentsPanel from "@/components/admin/formations/PaymentsPanel";
import PaymentSettingsPanel from "@/components/admin/formations/PaymentSettingsPanel";

const TABS = [
  { id: "formations", label: "Formations" },
  { id: "certificats", label: "Demandes de certificats" },
  { id: "paiements", label: "Paiements" },
  { id: "reglages", label: "Réglages de paiement" },
];

// ─── Formations ────────────────────────────────────────────────────────────
const EMPTY_COURSE = { id: "", title: "", description: "", category: "environnement", level: "Débutant", duration: "", video: "", sections: [], resources: [], quiz: [], enrolled: 0, price_fcfa: 0 };
const sectionsToText = (sections = []) => sections.map((s) => `${s.title}|${s.content}`).join("\n---\n");
const quizToText = (quiz = []) => quiz.map((q) => `${q.question}|${q.options.join(",")}|${q.answer}`).join("\n");

function CourseManagement() {
  const [courses, setCourses] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_COURSE);
  const [sectionsText, setSectionsText] = useState("");
  const [quizText, setQuizText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoadError("");
    getAdminCourses().then(setCourses).catch((e) => setLoadError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ ...EMPTY_COURSE, id: `course-${Date.now()}` });
    setSectionsText("");
    setQuizText("");
    setError("");
    setModal("add");
  };

  const openEdit = (c) => {
    setForm(c);
    setSectionsText(sectionsToText(c.sections));
    setQuizText(quizToText(c.quiz));
    setError("");
    setModal("edit");
  };

  const seed = seedCourses.find((s) => s.id === form.id);
  const restoreDefault = () => {
    if (!seed) return;
    setForm((f) => ({ ...f, ...seed, id: f.id, enrolled: f.enrolled }));
    setSectionsText(sectionsToText(seed.sections));
    setQuizText(quizToText(seed.quiz));
  };

  const handleSave = async () => {
    const parsedSections = sectionsText.trim() ? sectionsText.trim().split("\n---\n").filter(Boolean).map((line) => {
      const [title, ...content] = line.split("|");
      return { title: title?.trim() || "", content: content.join("|").trim() };
    }) : [];
    const parsedQuiz = quizText.trim() ? quizText.trim().split("\n").filter(Boolean).map((line) => {
      const parts = line.split("|");
      return { question: parts[0]?.trim(), options: parts[1]?.split(",").map((s) => s.trim()).filter(Boolean) || [], answer: parseInt(parts[2]) || 0 };
    }) : [];
    const course = { ...form, sections: parsedSections, quiz: parsedQuiz };
    setSaving(true);
    setError("");
    try {
      if (modal === "add") await addCourse(course);
      else await updateCourse(form.id, course);
      load();
      setModal(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Supprimer la formation « ${c.title} » ?\nLes inscriptions, résultats et demandes de certificat associés seront aussi supprimés.`)) return;
    try {
      await deleteCourse(c.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestion des formations</h2>
        <motion.button onClick={openAdd} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className={btnPrimary}>
          + Ajouter une formation
        </motion.button>
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
                {c.title[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{c.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {c.level} · {c.duration} · {c.enrolled || 0} inscrits
                  {(c.price_fcfa || 0) > 0
                    ? ` · ${Number(c.price_fcfa).toLocaleString("fr-FR")} FCFA (gratuit pour les membres actifs)`
                    : " · Gratuite"}
                </p>
                <LastModified at={c.updated_by ? c.updated_at : null} by={c.updated_by} className="mt-0.5" />
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(c)} className="text-[#0D6EBB] hover:text-[#0DBD9F] text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-[rgba(13,110,187,0.06)]">Modifier</button>
              <button onClick={() => handleDelete(c)} className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50">Supprimer</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{modal === "add" ? "Ajouter une formation" : "Modifier la formation"}</h3>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Fermer">✕</button>
              </div>
              {modal === "edit" && <LastModified at={form.updated_by ? form.updated_at : null} by={form.updated_by} className="mb-4" />}
              <div className="space-y-4">
                {[["Titre", "title"], ["Description", "description"], ["Durée (ex : 2h)", "duration"], ["URL vidéo (YouTube embed)", "video"]].map(([label, key]) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input value={form[key] || ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={inputCls} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Catégorie</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
                      <option value="environnement">Environnement</option>
                      <option value="formation">Formation</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Niveau</label>
                    <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className={inputCls}>
                      <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Prix pour les non-membres (FCFA) — 0 = gratuite pour tout le monde</label>
                  <input type="number" min="0" step="500" value={form.price_fcfa ?? 0}
                    onChange={(e) => setForm((f) => ({ ...f, price_fcfa: Number(e.target.value) || 0 }))} className={inputCls} />
                  <p className="text-[11px] text-gray-400 mt-1">Les membres actifs accèdent toujours gratuitement à toutes les formations.</p>
                </div>
                <div>
                  <label className={labelCls}>Sections (format : Titre|Contenu, séparées par une ligne ---)</label>
                  <textarea value={sectionsText} onChange={(e) => setSectionsText(e.target.value)} rows={5}
                    placeholder={"1. Introduction|Contenu de la section 1...\n---\n2. Partie 2|Contenu de la section 2..."}
                    className={`${inputCls} font-mono resize-y`} />
                </div>
                <div>
                  <label className={labelCls}>Questions du quiz (format : Question|Option A,Option B,Option C|index de la bonne réponse, à partir de 0)</label>
                  <textarea value={quizText} onChange={(e) => setQuizText(e.target.value)} rows={4}
                    placeholder={"Quelle est la capitale ?|Paris,Lyon,Marseille,Bordeaux|0"}
                    className={`${inputCls} font-mono resize-y`} />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2" role="alert">{error}</p>}
                <div className="flex flex-wrap gap-3 pt-2">
                  <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} className={`flex-1 ${btnPrimary}`}>
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </motion.button>
                  {modal === "edit" && seed && (
                    <button onClick={restoreDefault} type="button"
                      className="px-4 py-2.5 border border-[rgba(13,110,187,0.25)] rounded-xl text-[#0D6EBB] text-sm hover:bg-[rgba(13,110,187,0.06)] transition-colors">
                      ↺ Rétablir la version par défaut
                    </button>
                  )}
                  <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                </div>
                {modal === "edit" && seed && (
                  <p className="text-[11px] text-gray-400">« Rétablir » remplit le formulaire avec la version d&apos;origine ; cliquez sur Enregistrer pour l&apos;appliquer.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
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
            : <PaymentSettingsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

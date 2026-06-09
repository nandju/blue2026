"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  isAdminAuthenticated, adminLogout, getStats,
  getCourses, addCourse, updateCourse, deleteCourse,
  getRegistrations, getCertificateRequests, updateCertificateRequest,
  getConversations, getVolunteer, setVolunteer,
} from "@/lib/store";

const TABS = [
  { id: "overview", label: "Tableau de bord", icon: "📊" },
  { id: "courses", label: "Formations", icon: "🎓" },
  { id: "certificates", label: "Certificats", icon: "🏆" },
  { id: "conversations", label: "MR BLUE", icon: "💬" },
  { id: "volunteer", label: "Bénévole du Mois", icon: "🌟" },
];

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = "#0D6EBB" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-[rgba(13,110,187,0.12)] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="w-8 h-8 rounded-xl" style={{ background: `${color}22` }} />
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Overview ──────────────────────────────────────────────────────────────
function Overview({ stats }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tableau de bord global</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Formations" value={stats.courses} icon="🎓" color="#0D6EBB" />
        <StatCard label="Apprenants inscrits" value={stats.registrations} icon="👥" color="#0DBD9F" />
        <StatCard label="Certificats délivrés" value={stats.certificates} icon="🏆" color="#0D6EBB" />
        <StatCard label="Conversations MR BLUE" value={stats.conversations} icon="💬" color="#0DBD9F" />
        <StatCard label="Bénévole du Mois actif" value={stats.volunteers} icon="🌟" color="#0D6EBB" />
        <StatCard label="Demandes en attente" value={getCertificateRequests().filter(r => r.status === "pending").length} icon="⏳" color="#f59e0b" />
      </div>
      <div className="bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-1">Blue Academy — Plateforme BLUE</h3>
        <p className="text-white/80 text-sm">Gestion centralisée des formations, certificats, conversations et bénévoles.</p>
      </div>
    </div>
  );
}

// ─── Course Management ─────────────────────────────────────────────────────
const EMPTY_COURSE = { id: "", title: "", description: "", category: "environnement", level: "Débutant", duration: "", video: "", sections: [], resources: [], quiz: [], enrolled: 0 };

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_COURSE);
  const [sectionsText, setSectionsText] = useState("");
  const [quizText, setQuizText] = useState("");

  const load = useCallback(() => setCourses(getCourses()), []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ ...EMPTY_COURSE, id: `course-${Date.now()}` });
    setSectionsText("");
    setQuizText("");
    setModal("add");
  };

  const openEdit = (c) => {
    setForm(c);
    setSectionsText(c.sections.map(s => `${s.title}|${s.content}`).join("\n---\n"));
    setQuizText(c.quiz.map(q => `${q.question}|${q.options.join(",")}|${q.answer}`).join("\n"));
    setModal("edit");
  };

  const handleSave = () => {
    const parsedSections = sectionsText.trim().split("\n---\n").filter(Boolean).map(line => {
      const [title, content] = line.split("|");
      return { title: title?.trim() || "", content: content?.trim() || "" };
    });
    const parsedQuiz = quizText.trim().split("\n").filter(Boolean).map(line => {
      const parts = line.split("|");
      return { question: parts[0]?.trim(), options: parts[1]?.split(",").map(s => s.trim()) || [], answer: parseInt(parts[2]) || 0 };
    });
    const course = { ...form, sections: parsedSections, quiz: parsedQuiz };
    if (modal === "add") addCourse(course);
    else updateCourse(form.id, course);
    load();
    setModal(null);
  };

  const handleDelete = (id) => {
    if (confirm("Supprimer cette formation ?")) { deleteCourse(id); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestion des Formations</h2>
        <motion.button onClick={openAdd} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          + Ajouter une formation
        </motion.button>
      </div>

      <div className="space-y-3">
        {courses.map((c) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {c.title[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{c.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{c.level} · {c.duration} · {c.enrolled || 0} inscrits</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(c)} className="text-[#0D6EBB] hover:text-[#0DBD9F] text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-[rgba(13,110,187,0.06)]">Modifier</button>
              <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50">Supprimer</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">{modal === "add" ? "Ajouter une formation" : "Modifier la formation"}</h3>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-4">
                {[["Titre", "title", "text"], ["Description", "description", "text"], ["Durée (ex: 2h)", "duration", "text"], ["URL vidéo (YouTube embed)", "video", "text"]].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB]" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Catégorie</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none">
                      <option value="environnement">Environnement</option>
                      <option value="formation">Formation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Niveau</label>
                    <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none">
                      <option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Sections (format: Titre|Contenu, séparées par ligne vide ---)</label>
                  <textarea value={sectionsText} onChange={e => setSectionsText(e.target.value)} rows={5}
                    placeholder={"1. Introduction|Contenu de la section 1...\n---\n2. Partie 2|Contenu de la section 2..."}
                    className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB] font-mono resize-none" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Questions quiz (format: Question|Opt A,Opt B,Opt C,Opt D|index_bonne_réponse)</label>
                  <textarea value={quizText} onChange={e => setQuizText(e.target.value)} rows={4}
                    placeholder={"Quelle est la capitale ?|Paris,Lyon,Marseille,Bordeaux|0"}
                    className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB] font-mono resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }}
                    className="flex-1 bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-xl py-2.5 font-semibold text-sm transition-colors">
                    Enregistrer
                  </motion.button>
                  <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Certificate Management ────────────────────────────────────────────────
function CertificateManagement() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => { setRequests(getCertificateRequests()); }, []);

  const handleAction = (id, status) => {
    updateCertificateRequest(id, { status });
    setRequests(getCertificateRequests());
  };

  const filtered = requests.filter(r =>
    `${r.firstName} ${r.lastName} ${r.email} ${r.courseTitle}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-[rgba(13,189,159,0.12)] text-[#0DBD9F]", rejected: "bg-red-100 text-red-500" };
  const statusLabel = { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Demandes de Certificats ({requests.length})</h2>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un apprenant..."
        className="w-full mb-4 px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB]" />
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><p className="text-3xl mb-2">🏆</p><p>Aucune demande</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{r.firstName} {r.lastName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{r.email} · Score : {r.score}%</p>
                  <p className="text-gray-600 text-sm mt-1">{r.courseTitle}</p>
                  {r.paymentInfo && <p className="text-gray-500 text-xs mt-1">ℹ️ {r.paymentInfo}</p>}
                  <p className="text-gray-400 text-xs mt-1">{new Date(r.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
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

// ─── Conversation Management ───────────────────────────────────────────────
function ConversationManagement() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  useEffect(() => { setConversations(getConversations()); }, []);

  const filtered = conversations.filter(c => {
    const u = c.userInfo || {};
    return `${u.lastName} ${u.firstName} ${u.location} ${u.job}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex gap-4 h-[60vh]">
      {/* List */}
      <div className="w-64 flex flex-col gap-3 overflow-y-auto shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Conversations ({conversations.length})</h2>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
          className="px-3 py-2 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB]" />
        {filtered.map((c, i) => {
          const u = c.userInfo || {};
          return (
            <button key={c.sessionId || i} onClick={() => setSelected(c)}
              className={`text-left p-3 rounded-xl border transition-all ${selected?.sessionId === c.sessionId ? "border-[#0D6EBB] bg-[rgba(13,110,187,0.06)]" : "border-[rgba(13,110,187,0.1)] hover:border-[#0D6EBB] bg-white"}`}>
              <p className="font-semibold text-gray-900 text-sm truncate">{u.firstName || "—"} {u.lastName || ""}</p>
              <p className="text-gray-500 text-xs truncate mt-0.5">{u.location || "Non renseigné"}</p>
              <p className="text-gray-400 text-xs">{c.messages?.length || 0} messages</p>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Aucune conversation</p>}
      </div>

      {/* Detail */}
      <div className="flex-1 bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] overflow-hidden flex flex-col">
        {selected ? (
          <>
            <div className="bg-[#0D6EBB] px-5 py-4 text-white">
              <p className="font-bold">{selected.userInfo?.firstName} {selected.userInfo?.lastName}</p>
              <div className="flex flex-wrap gap-3 text-xs text-white/70 mt-1">
                {[["Âge", selected.userInfo?.age], ["Lieu", selected.userInfo?.location], ["Poste", selected.userInfo?.job], ["Motivation", selected.userInfo?.motivation]].map(([k, v]) =>
                  v ? <span key={k}><strong>{k}:</strong> {v}</span> : null
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f7faff]">
              {(selected.messages || []).map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${m.from === "user" ? "bg-[#0D6EBB] text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm border border-[rgba(13,110,187,0.08)] rounded-bl-sm"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center"><p className="text-4xl mb-3">💬</p><p>Sélectionnez une conversation</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Volunteer Management ──────────────────────────────────────────────────
function VolunteerManagement() {
  const [form, setForm] = useState({ firstName: "", lastName: "", location: "", photo: "", actions: "", contribution: "", active: true });
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(getVolunteer()); }, []);

  const handleSave = () => {
    setVolunteer(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Bénévole du Mois</h2>
      <div className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] p-6 max-w-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[["Prénom", "firstName"], ["Nom de famille", "lastName"]].map(([label, key]) => (
            <div key={key}>
              <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
              <input value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB]" />
            </div>
          ))}
        </div>
        {[["Localisation", "location", "text"], ["URL photo (optionnel)", "photo", "text"]].map(([label, key, type]) => (
          <div key={key}>
            <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
            <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB]" />
          </div>
        ))}
        {[["Actions réalisées", "actions"], ["Contribution environnementale", "contribution"]].map(([label, key]) => (
          <div key={key}>
            <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
            <textarea value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={3}
              className="w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB] resize-none" />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
            className="w-4 h-4 accent-[#0D6EBB]" />
          <label htmlFor="active" className="text-sm text-gray-700">Afficher le popup Bénévole du Mois</label>
        </div>
        <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-xl py-2.5 font-semibold text-sm transition-colors">
          Enregistrer
        </motion.button>
        {saved && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#0DBD9F] text-sm text-center">✓ Modifications enregistrées</motion.p>}
      </div>
    </div>
  );
}

// ─── Dashboard Shell ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ courses: 0, registrations: 0, certificates: 0, conversations: 0, volunteers: 1 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.replace("/admin"); return; }
    setStats(getStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => { adminLogout(); router.replace("/admin"); };

  return (
    <div className="min-h-screen bg-[#f7faff] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-[rgba(13,110,187,0.1)] flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-5 border-b border-[rgba(13,110,187,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D6EBB] flex items-center justify-center text-white font-bold text-sm">B</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">BLUE Admin</p>
              <p className="text-gray-400 text-xs">Tableau de bord</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? "bg-[rgba(13,110,187,0.1)] text-[#0D6EBB]" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[rgba(13,110,187,0.08)]">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-[rgba(13,110,187,0.1)] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-[#0D6EBB] text-xl" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="text-gray-900 font-bold">{TABS.find(t => t.id === tab)?.label}</h1>
          </div>
          <Link href="/" className="text-sm text-[#0D6EBB] hover:text-[#0DBD9F] transition-colors">← Retour au site</Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {tab === "overview" && <Overview stats={stats} />}
              {tab === "courses" && <CourseManagement />}
              {tab === "certificates" && <CertificateManagement />}
              {tab === "conversations" && <ConversationManagement />}
              {tab === "volunteer" && <VolunteerManagement />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

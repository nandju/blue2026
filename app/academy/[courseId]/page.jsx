"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  addRegistration,
  getCourseAccess,
  getCourseProgress,
  setProgress,
  addQuizResult,
  addCertificateRequest,
  markModuleRead,
} from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import MemberCta from "@/components/academy/MemberCta";
import StepThread from "@/components/academy/StepThread";

// Rendu simple du contenu de module : paragraphes (ligne vide), listes
// (« - » en début de ligne) et **gras**.
function RichText({ text = "" }) {
  const inline = (s, key) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong> : part
    );
  return (
    <div className="space-y-4 text-gray-700 leading-relaxed text-base">
      {text.split("\n\n").map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trimStart().startsWith("- "))) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {lines.map((l, j) => <li key={j}>{inline(l.trimStart().slice(2), `${i}-${j}`)}</li>)}
            </ul>
          );
        }
        return <p key={i} className={i === 0 ? "text-lg" : ""}>{inline(block, i)}</p>;
      })}
    </div>
  );
}

// ─── Certificate Print ─────────────────────────────────────────────────────
function printCertificate(reg, course, score) {
  const w = window.open("", "_blank");
  const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificat BLUE</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Outfit', sans-serif; background: #fff; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    .cert { width: 100%; max-width: 800px; margin: 40px auto; border: 3px solid var(--color-primary); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); padding: 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 52px; font-weight: 800; letter-spacing: 6px; margin-bottom: 4px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 13px; letter-spacing: 3px; text-transform: uppercase; }
    .body { padding: 40px; text-align: center; }
    .subtitle { color: #6b7280; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
    .name { color: var(--color-primary); font-size: 38px; font-weight: 700; margin-bottom: 16px; }
    .desc { color: #4b5563; font-size: 15px; line-height: 1.7; max-width: 560px; margin: 0 auto 24px; }
    .course { color: var(--color-primary); font-size: 22px; font-weight: 600; margin-bottom: 8px; border-bottom: 2px solid var(--color-secondary); display: inline-block; padding-bottom: 4px; }
    .score { display: inline-block; background: rgb(var(--color-secondary-rgb)/0.1); color: var(--color-secondary); border: 2px solid var(--color-secondary); border-radius: 50px; padding: 8px 24px; font-weight: 700; margin: 16px 0 32px; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px 40px; }
    .sig { text-align: center; }
    .sig-line { width: 180px; border-bottom: 2px solid var(--color-primary); margin-bottom: 8px; }
    .sig p { color: #6b7280; font-size: 12px; }
    .sig strong { color: var(--color-primary); font-size: 13px; }
    .badge { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,var(--color-primary),var(--color-secondary)); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 18px; text-align: center; line-height: 1.2; }
    .strip { height: 6px; background: linear-gradient(90deg,var(--color-primary),var(--color-secondary)); }
  </style></head><body>
  <div class="cert">
    <div class="strip"></div>
    <div class="header"><h1>BLUE</h1><p>Organisation Non Gouvernementale — Côte d'Ivoire</p></div>
    <div class="body">
      <p class="subtitle">Certificat de Participation</p>
      <p class="name">${reg.firstName} ${reg.lastName}</p>
      <p class="desc">a complété avec succès la formation</p>
      <p class="course">${course.title}</p>
      <div class="score">Score obtenu : ${score}%</div>
      <p style="color:#6b7280;font-size:13px">Délivré le ${date} — Blue Academy, BLUE Côte d'Ivoire</p>
    </div>
    <div class="footer">
      <div class="sig"><div class="sig-line"></div><strong>Président de BLUE</strong><br><p>Organisation BLUE CI</p></div>
      <div class="badge">BLUE<br>CI</div>
      <div class="sig"><div class="sig-line"></div><strong>Directeur Blue Academy</strong><br><p>blue@bluemakers.net</p></div>
    </div>
    <div class="strip"></div>
  </div>
  <script>window.onload=()=>{window.print();}<\/script></body></html>`);
  w.document.close();
}

// ─── Stage: Registration ───────────────────────────────────────────────────
function RegistrationForm({ course, onComplete }) {
  const [form, setForm] = useState({ lastName: "", firstName: "", age: "", organization: "", whatsapp: "", email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.lastName.trim()) e.lastName = "Requis";
    if (!form.firstName.trim()) e.firstName = "Requis";
    if (!form.age || isNaN(form.age) || form.age < 1) e.age = "Âge invalide";
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (!form.whatsapp.trim()) e.whatsapp = "Requis";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setSubmitError("");
    try {
      await addRegistration({ ...form, courseId: course.id });
      onComplete(form);
    } catch (err) {
      // Déjà inscrit à cette formation : on reprend simplement le parcours.
      if (err.status === 409) onComplete(form);
      else setSubmitError(err.message || "L'inscription n'a pas pu être enregistrée. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "lastName", label: "Nom de famille", type: "text", placeholder: "Ex: Kouassi" },
    { key: "firstName", label: "Prénom", type: "text", placeholder: "Ex: Amenan" },
    { key: "age", label: "Âge", type: "number", placeholder: "Ex: 25" },
    { key: "organization", label: "Organisation", type: "text", placeholder: "Ex: Université FHB (optionnel)" },
    { key: "whatsapp", label: "Numéro WhatsApp", type: "tel", placeholder: "Ex: +225 07 00 00 00 00" },
    { key: "email", label: "Adresse Email", type: "email", placeholder: "Ex: vous@email.com" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-white">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring" }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)] rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            🎓 Inscription requise
          </div>
          <h1 className="text-gray-900 text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-500 text-sm">Complétez votre inscription pour accéder à la formation.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.12)] p-6 shadow-lg space-y-4">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-gray-700 text-sm font-medium mb-1">{label}{key !== "organization" && <span className="text-red-400 ml-1">*</span>}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  errors[key] ? "border-red-400 bg-red-50" : "border-[rgb(var(--color-primary-rgb)/0.15)] focus:border-[var(--color-primary)]"
                }`}
              />
              {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}
          {submitError && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{submitError}</p>
          )}
          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white rounded-xl py-3 font-semibold transition-colors duration-300 disabled:opacity-60 mt-2">
            {loading ? "Inscription en cours..." : "S'inscrire à la formation →"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Stage: Course Content ─────────────────────────────────────────────────
// Sommaire latéral avec coches (modules lus), barre de progression, points
// clés en encadré. Progression enregistrée sur le compte pour les apprenants
// connectés, dans le navigateur pour les visiteurs anonymes.
function CourseContent({ course, reg, learner, serverProgress, onFinish }) {
  const sections = course.sections || [];
  const [sectionIdx, setSectionIdx] = useState(() => {
    if (serverProgress?.modulesRead?.length) return Math.min(Math.max(...serverProgress.modulesRead), sections.length - 1);
    return Math.min(getCourseProgress(course.id), Math.max(sections.length - 1, 0));
  });
  const [readSet, setReadSet] = useState(() => new Set(serverProgress?.modulesRead || []));
  const [tocOpen, setTocOpen] = useState(false);

  const section = sections[sectionIdx];
  const isLast = sectionIdx === sections.length - 1;
  const readCount = readSet.size;
  const progress = sections.length ? Math.round((readCount / sections.length) * 100) : 0;

  // Le module affiché est marqué « lu » (compte ou navigateur).
  useEffect(() => {
    if (sectionIdx < 0) return;
    setReadSet((prev) => {
      if (prev.has(sectionIdx)) return prev;
      const next = new Set(prev);
      next.add(sectionIdx);
      return next;
    });
    if (learner) markModuleRead(course.id, sectionIdx);
    else setProgress(course.id, sectionIdx);
  }, [sectionIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    if (isLast) { onFinish(); return; }
    setSectionIdx((i) => i + 1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  const goPrev = () => { if (sectionIdx > 0) { setSectionIdx((i) => i - 1); if (typeof window !== "undefined") window.scrollTo({ top: 0 }); } };

  if (!sections.length || !section) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div><p className="text-5xl mb-4">📭</p><h2 className="text-2xl font-bold text-gray-900 mb-2">Contenu en préparation</h2>
        <p className="text-gray-500 text-sm">Cette formation n&apos;a pas encore de modules.</p></div>
      </div>
    );
  }

  const toc = (
    <div className="space-y-1">
      {sections.map((s, i) => (
        <button key={i} onClick={() => { setSectionIdx(i); setTocOpen(false); }}
          className={`w-full text-left flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
            i === sectionIdx
              ? "bg-[rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)] font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            readSet.has(i) ? "bg-[var(--color-secondary)] text-white" : i === sectionIdx ? "bg-[var(--color-primary)] text-white" : "bg-gray-200 text-gray-500"
          }`}>
            {readSet.has(i) ? "✓" : i + 1}
          </span>
          <span className="truncate">{s.title || `Module ${i + 1}`}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8 pb-20 flex gap-8">
        {/* Sommaire latéral (desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-36 bg-[rgb(var(--color-primary-rgb)/0.03)] border border-[rgb(var(--color-primary-rgb)/0.1)] rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sommaire</p>
            {toc}
          </div>
        </aside>

        {/* Sommaire (mobile, tiroir) */}
        <AnimatePresence>
          {tocOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setTocOpen(false)}>
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-gray-800">Sommaire</p>
                  <button onClick={() => setTocOpen(false)} className="text-gray-400 text-xl">✕</button>
                </div>
                {toc}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu du module */}
        <div className="flex-1 min-w-0">
          {/* En-tête compact : catalogue, sommaire (mobile), progression */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/academy" className="text-[var(--color-primary)] text-sm hover:text-[var(--color-secondary)] transition-colors whitespace-nowrap">← Catalogue</Link>
            <button onClick={() => setTocOpen(true)} className="lg:hidden text-[var(--color-primary)] text-sm font-medium border border-[rgb(var(--color-primary-rgb)/0.2)] rounded-lg px-3 py-1">
              ☰ Sommaire
            </button>
            <div className="flex-1 bg-[rgb(var(--color-primary-rgb)/0.08)] rounded-full h-2">
              <motion.div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-2 rounded-full" animate={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{readCount} / {sections.length} lus</span>
          </div>

          {sectionIdx === 0 && course.video && (
            <motion.div className="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-video"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <iframe src={course.video} title="Vidéo de formation" className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={sectionIdx}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="mb-6">
                <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider">Module {sectionIdx + 1} / {sections.length}</span>
                <h2 className="text-[var(--color-primary)] text-2xl md:text-3xl font-bold mt-1 mb-5">{section.title}</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full mb-6" />
              </div>
              <RichText text={section.content || ""} />

              {/* Points clés */}
              {(section.keyPoints || []).length > 0 && (
                <div className="mt-8 p-5 bg-[rgb(var(--color-secondary-rgb)/0.06)] rounded-2xl border border-[rgb(var(--color-secondary-rgb)/0.2)]">
                  <p className="text-[var(--color-secondary)] font-semibold text-sm mb-3">🔑 À retenir</p>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    {section.keyPoints.map((k, i) => (
                      <li key={i} className="flex gap-2"><span className="text-[var(--color-secondary)] font-bold">✓</span>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Ressources */}
          {isLast && course.resources?.length > 0 && (
            <motion.div className="mt-10 p-5 bg-[rgb(var(--color-primary-rgb)/0.04)] rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.1)]"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
              <h3 className="text-[var(--color-primary)] font-semibold mb-3">📎 Ressources téléchargeables</h3>
              <div className="space-y-2">
                {course.resources.map((r, i) => (
                  <a key={i} href={r.url} download className="flex items-center gap-3 text-sm text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                    <span className="w-8 h-8 bg-[rgb(var(--color-primary-rgb)/0.1)] rounded-lg flex items-center justify-center text-lg">📄</span>
                    {r.name}
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Glossaire */}
          {isLast && course.glossary?.length > 0 && (
            <motion.div className="mt-6 p-5 bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.1)]"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
              <h3 className="text-[var(--color-primary)] font-semibold mb-3">📖 Glossaire</h3>
              <dl className="space-y-2 text-sm">
                {course.glossary.map((g, i) => (
                  <div key={i}><dt className="font-semibold text-gray-800">{g.term}</dt><dd className="text-gray-600">{g.definition}</dd></div>
                ))}
              </dl>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10">
            <motion.button onClick={goPrev} disabled={sectionIdx === 0}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm transition-colors hover:bg-[rgb(var(--color-primary-rgb)/0.06)] disabled:opacity-30">
              ← Précédent
            </motion.button>
            <motion.button onClick={goNext}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold text-sm transition-colors">
              {isLast ? "Passer au Quiz →" : "Module suivant →"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stage: Quiz ───────────────────────────────────────────────────────────
// Une question à la fois, compteur et minuteur (durée réglable par formation),
// puis la correction avec les explications — renvoyées par le serveur
// uniquement après la soumission.
function Quiz({ course, reg, onComplete }) {
  const threshold = course.pass_threshold || 80;
  const duration = (course.quiz_duration_min || 20) * 60;
  const [answers, setAnswers] = useState({});
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const timerRef = useRef(null);
  const total = course.quiz.length;
  const answered = Object.keys(answers).length;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmitRef.current(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [retryKey]);

  const handleSubmitRef = useRef();
  handleSubmitRef.current = (auto = false) => {
    clearInterval(timerRef.current);
    // Les bonnes réponses ne quittent jamais le serveur : le score est
    // calculé et enregistré côté serveur, puis affiché ici (seul fait foi).
    setSubmitted(true);
    setResult(null);
    addQuizResult({ courseId: course.id, email: reg.email || "", answers })
      .then((saved) => setResult({
        courseId: course.id, email: reg.email, score: saved.score,
        correct: saved.correct, total: saved.total, passed: saved.passed,
        threshold: saved.threshold ?? threshold,
        corrections: saved.corrections || [],
      }))
      .catch((e) => setResult({ error: e.message || "La correction n'a pas pu être enregistrée. Réessayez." }));
  };

  const retry = () => { setSubmitted(false); setResult(null); setAnswers({}); setQIdx(0); setTimeLeft(duration); setRetryKey((k) => k + 1); };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const timerColor = timeLeft < 120 ? "text-red-500" : "text-[var(--color-primary)]";

  if (submitted) {
    if (!result) {
      return (
        <div className="flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
            <p className="mt-4 text-gray-500 text-sm">Correction en cours…</p>
          </div>
        </div>
      );
    }
    if (result.error) {
      return (
        <div className="flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-6">{result.error}</p>
            <button onClick={() => { setSubmitted(false); }}
              className="w-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl py-3 font-semibold hover:bg-[rgb(var(--color-primary-rgb)/0.06)] transition-colors">
              Retenter l&apos;envoi
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="px-4 py-10">
        <motion.div className="max-w-2xl mx-auto"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{result.passed ? "🎉" : "📚"}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{result.passed ? "Félicitations !" : "Continuez vos efforts !"}</h2>
            <div className={`inline-block rounded-full px-6 py-2 text-2xl font-bold mb-4 ${result.passed ? "bg-[rgb(var(--color-secondary-rgb)/0.12)] text-[var(--color-secondary)]" : "bg-red-50 text-red-500"}`}>
              {result.score}%
            </div>
            <p className="text-gray-500 mb-1">{result.correct} / {result.total} bonnes réponses</p>
            <p className="text-gray-500 text-sm">{result.passed ? `Vous avez atteint le seuil de ${result.threshold}% requis.` : `Le seuil requis est de ${result.threshold}%. Vous pouvez retenter le quiz.`}</p>
          </div>

          {/* Correction détaillée : bonne réponse + explication par question */}
          <div className="space-y-4 mb-8">
            {course.quiz.map((q, qi) => {
              const corr = result.corrections[qi];
              const chosen = answers[qi];
              const good = corr && chosen === corr.answer;
              return (
                <div key={qi} className={`rounded-2xl border-2 p-4 ${good ? "border-[rgb(var(--color-secondary-rgb)/0.4)] bg-[rgb(var(--color-secondary-rgb)/0.04)]" : "border-red-200 bg-red-50/40"}`}>
                  <p className="font-semibold text-gray-800 text-sm mb-2">
                    {good ? "✅" : "❌"} {qi + 1}. {q.question}
                  </p>
                  <ul className="space-y-1 text-sm">
                    {q.options.map((opt, oi) => (
                      <li key={oi} className={
                        oi === corr?.answer ? "text-[var(--color-secondary)] font-semibold" :
                        oi === chosen ? "text-red-500 line-through" : "text-gray-600"
                      }>
                        {oi === corr?.answer ? "✓ " : oi === chosen ? "✗ " : "· "}
                        {String.fromCharCode(65 + oi)}. {opt}
                      </li>
                    ))}
                  </ul>
                  {corr?.explanation && (
                    <p className="mt-2 text-xs text-gray-500 bg-white/70 rounded-lg px-3 py-2">💡 {corr.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>

          {result.passed ? (
            <motion.button onClick={() => onComplete(result)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white rounded-xl py-3 font-semibold transition-colors">
              Obtenir mon certificat →
            </motion.button>
          ) : (
            <motion.button onClick={retry}
              whileHover={{ scale: 1.04 }} className="w-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl py-3 font-semibold hover:bg-[rgb(var(--color-primary-rgb)/0.06)] transition-colors">
              Retenter le quiz
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  const q = course.quiz[qIdx];
  const isLastQ = qIdx === total - 1;

  return (
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quiz — {course.title}</h2>
            <p className="text-gray-500 text-sm mt-0.5">Score minimum requis : {threshold}% · {answered}/{total} répondues</p>
          </div>
          <div className={`text-2xl font-mono font-bold ${timerColor} bg-[rgb(var(--color-primary-rgb)/0.06)] rounded-xl px-4 py-2`}>
            {mm}:{ss}
          </div>
        </div>

        {/* Pastilles de progression */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {course.quiz.map((_, i) => (
            <button key={i} onClick={() => setQIdx(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                i === qIdx ? "bg-[var(--color-primary)] text-white" :
                answers[i] !== undefined ? "bg-[rgb(var(--color-secondary-rgb)/0.2)] text-[var(--color-secondary)]" : "bg-gray-100 text-gray-400"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${retryKey}-${qIdx}`}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.12)] p-6 shadow-sm">
            <p className="text-xs font-medium text-[var(--color-secondary)] uppercase tracking-wider mb-2">Question {qIdx + 1} / {total}</p>
            <p className="font-semibold text-gray-800 mb-5 text-lg">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [qIdx]: oi }))}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border-2 ${
                    answers[qIdx] === oi
                      ? "border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)] font-medium"
                      : "border-[rgb(var(--color-primary-rgb)/0.1)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.04)]"
                  }`}>
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-6 gap-3">
          <button onClick={() => setQIdx((i) => Math.max(0, i - 1))} disabled={qIdx === 0}
            className="px-5 py-2.5 rounded-xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm disabled:opacity-30">
            ← Précédente
          </button>
          {isLastQ ? (
            <motion.button onClick={() => handleSubmitRef.current(false)} disabled={answered < total}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold text-sm transition-colors disabled:opacity-40">
              Soumettre ({answered}/{total})
            </motion.button>
          ) : (
            <motion.button onClick={() => setQIdx((i) => Math.min(total - 1, i + 1))}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white font-semibold text-sm transition-colors">
              Suivante →
            </motion.button>
          )}
        </div>
        {answered < total && isLastQ && (
          <p className="text-center text-xs text-amber-600 mt-3">Répondez à toutes les questions pour soumettre ({total - answered} restante{total - answered > 1 ? "s" : ""}).</p>
        )}
      </div>
    </div>
  );
}

// ─── Stage: Certificate ────────────────────────────────────────────────────
function CertificateStage({ course, reg, quizResult, learner }) {
  const [officialRequested, setOfficialRequested] = useState(false);
  const [officialForm, setOfficialForm] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState("");
  const [sending, setSending] = useState(false);
  const [requestError, setRequestError] = useState("");

  const handleOfficialRequest = async () => {
    setSending(true);
    setRequestError("");
    try {
      await addCertificateRequest({
        courseId: course.id,
        courseTitle: course.title,
        email: reg.email,
        firstName: reg.firstName,
        lastName: reg.lastName,
        score: quizResult.score,
        paymentInfo,
      });
      setOfficialRequested(true);
      setOfficialForm(false);
    } catch (e) {
      setRequestError(e.message || "La demande n'a pas pu être envoyée. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-white">
      <motion.div className="max-w-lg w-full"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring" }}>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bravo {reg.firstName} !</h1>
          <p className="text-gray-500">Vous avez complété la formation avec un score de <strong className="text-[var(--color-secondary)]">{quizResult.score}%</strong></p>
        </div>

        <div className="space-y-4">
          {/* Free certificate */}
          <div className="bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.15)] p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-secondary-rgb)/0.1)] flex items-center justify-center text-2xl shrink-0">📄</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Certificat de participation gratuit</h3>
                <p className="text-gray-500 text-sm mb-3">Téléchargez immédiatement votre attestation de réussite.</p>
                <motion.button
                  onClick={() => printCertificate(reg, course, quizResult.score)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="bg-[var(--color-secondary)] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[var(--color-primary)] transition-colors">
                  Télécharger le certificat (PDF)
                </motion.button>
              </div>
            </div>
          </div>

          {/* Official certificate */}
          <div className="bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.15)] p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-primary-rgb)/0.1)] flex items-center justify-center text-2xl shrink-0">🎖️</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Certificat officiel signé</h3>
                <p className="text-gray-500 text-sm mb-3">Demandez un certificat officiel signé par le Président de BLUE. Validation administrative requise.</p>
                {officialRequested ? (
                  <div className="bg-[rgb(var(--color-secondary-rgb)/0.1)] text-[var(--color-secondary)] rounded-xl px-4 py-2 text-sm font-medium">
                    ✓ Demande envoyée — vous serez contacté par email ou WhatsApp.
                  </div>
                ) : officialForm ? (
                  <div className="space-y-3">
                    <textarea value={paymentInfo} onChange={(e) => setPaymentInfo(e.target.value)}
                      placeholder="Informations complémentaires (optionnel) : référence de paiement, numéro WhatsApp..."
                      className="w-full border border-[rgb(var(--color-primary-rgb)/0.2)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none h-20" />
                    {requestError && (
                      <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{requestError}</p>
                    )}
                    <div className="flex gap-2">
                      <motion.button onClick={handleOfficialRequest} disabled={sending}
                        whileHover={{ scale: 1.02 }} className="bg-[var(--color-primary)] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-60">
                        {sending ? "Envoi en cours..." : "Envoyer la demande"}
                      </motion.button>
                      <button onClick={() => setOfficialForm(false)} className="text-gray-400 text-sm hover:text-gray-600">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <motion.button onClick={() => setOfficialForm(true)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl px-5 py-2 text-sm font-semibold hover:bg-[rgb(var(--color-primary-rgb)/0.06)] transition-colors">
                    Demander le certificat officiel
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Incitation : l'apprenant payant peut devenir membre actif */}
        {learner?.kind === "external" && <MemberCta className="mt-6" />}

        <div className="text-center mt-6">
          <Link href="/academy" className="text-[var(--color-primary)] text-sm hover:text-[var(--color-secondary)] transition-colors">
            ← Retour au catalogue des formations
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Stage: Paywall ────────────────────────────────────────────────────────
// Formation payante devant un visiteur sans accès : trois choix clairs, ou
// le message « il vous manque… » pour un membre non actif connecté.
function Paywall({ course, paywall }) {
  const t = useContent("academy.paywall") || {};
  const price = (paywall?.price ?? course?.price_fcfa ?? 0).toLocaleString("fr-FR");
  const payText = (t.payOption || "Payer cette formation — {prix} FCFA").replace("{prix}", price);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-[rgb(var(--color-primary-rgb)/0.04)]">
      <motion.div className="w-full max-w-lg" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring" }}>
        <div className="text-center mb-8">
          <span className="text-5xl">🔒</span>
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--color-navy)]">
            {t.title || "Cette formation est payante pour les non-membres"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {course.title} — <strong className="text-[var(--color-primary)]">{price} FCFA</strong>
          </p>
          {paywall?.missingMessage ? (
            <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              {paywall.missingMessage}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {/* 1. Membre BLUE → connexion */}
          <Link
            href={`/academy/connexion?retour=/academy/${course.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white border-2 border-[var(--color-primary)] px-5 py-4 hover:bg-[rgb(var(--color-primary-rgb)/0.05)] transition-colors">
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              {t.loginOption || "Je suis membre BLUE — me connecter"}
            </span>
            <span className="text-[var(--color-primary)] font-bold">→</span>
          </Link>

          {/* 2. Devenir membre actif */}
          <Link
            href="/recrutement"
            className="flex items-center justify-between gap-4 rounded-2xl bg-white border-2 border-[var(--color-secondary)] px-5 py-4 hover:bg-[rgb(var(--color-secondary-rgb)/0.05)] transition-colors">
            <span className="text-sm font-semibold text-[var(--color-navy)]">
              {t.memberOption || "Devenir membre actif — toutes les formations gratuites"}
            </span>
            <span className="text-[var(--color-secondary)] font-bold">→</span>
          </Link>

          {/* 3. Payer */}
          <Link
            href={`/academy/${course.id}/payer`}
            className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--color-primary)] px-5 py-4 hover:bg-[var(--color-secondary)] transition-colors">
            <span className="text-sm font-semibold text-white">{payText}</span>
            <span className="text-white font-bold">→</span>
          </Link>
        </div>

        <MemberCta className="mt-8" />
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [paywall, setPaywall] = useState(null);
  const [learner, setLearner] = useState(null);
  const [serverProgress, setServerProgress] = useState(null);
  const [stage, setStage] = useState("loading"); // loading | notfound | paywall | register | content | quiz | certificate
  const [reg, setReg] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const info = await getCourseAccess(courseId);
      if (cancelled) return;
      if (!info?.course) { setStage("notfound"); return; }
      setCourse(info.course);
      setPaywall(info.paywall);
      setLearner(info.learner || null);
      setServerProgress(info.progress || null);

      // Pas d'accès → paywall (connecté ou non).
      if (!info.access?.allowed) { setStage("paywall"); return; }

      // Apprenant connecté : pas de formulaire d'inscription — les infos
      // viennent de son compte. Son dernier résultat réussi ouvre le certificat.
      if (info.learner) {
        setReg({
          firstName: info.learner.firstName,
          lastName: info.learner.lastName,
          email: info.learner.email || "",
          whatsapp: info.learner.phone,
          learnerId: info.learner.id,
        });
        if (info.lastResult?.passed) { setQuizResult(info.lastResult); setStage("certificate"); }
        else setStage("content");
        return;
      }

      // Visiteur anonyme sur formation gratuite : parcours d'inscription classique.
      const stored = typeof window !== "undefined" ? localStorage.getItem(`blue_reg_${courseId}`) : null;
      if (stored) { setReg(JSON.parse(stored)); setStage("content"); }
      else { setStage("register"); }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  const handleRegistered = (formData) => {
    setReg(formData);
    localStorage.setItem(`blue_reg_${courseId}`, JSON.stringify(formData));
    setStage("content");
  };

  const handleContentFinish = () => setStage("quiz");

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setStage("certificate");
  };

  if (stage === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
    </div>
  );
  if (stage === "notfound") return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div><p className="text-5xl mb-4">🔍</p><h2 className="text-2xl font-bold text-gray-900 mb-2">Formation introuvable</h2>
      <Link href="/academy" className="text-[var(--color-primary)] hover:underline">← Retour au catalogue</Link></div>
    </div>
  );
  if (stage === "paywall") return <Paywall course={course} paywall={paywall} />;

  return (
    <div className="min-h-screen bg-white">
      {/* Fil d'étapes permanent */}
      <div className="pt-24 md:pt-28">
        <StepThread stage={stage} />
      </div>
      {stage === "register" && <RegistrationForm course={course} onComplete={handleRegistered} />}
      {stage === "content" && <CourseContent course={course} reg={reg} learner={learner} serverProgress={serverProgress} onFinish={handleContentFinish} />}
      {stage === "quiz" && <Quiz course={course} reg={reg} onComplete={handleQuizComplete} />}
      {stage === "certificate" && <CertificateStage course={course} reg={reg} quizResult={quizResult} learner={learner} />}
    </div>
  );
}

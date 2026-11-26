"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  addRegistration,
  getCourseProgress,
  setProgress,
  getCourseQuizResult,
  addQuizResult,
  addCertificateRequest,
} from "@/lib/store";
import { QUIZ_DURATION_SECONDS, QUIZ_PASS_THRESHOLD, scoreQuiz } from "@/lib/academyRules";

const QUIZ_DURATION = QUIZ_DURATION_SECONDS;

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
function CourseContent({ course, reg, onFinish }) {
  const [sectionIdx, setSectionIdx] = useState(() => getCourseProgress(course.id));

  const section = course.sections[sectionIdx];
  const isLast = sectionIdx === course.sections.length - 1;

  const goNext = () => {
    if (isLast) { onFinish(); return; }
    const next = sectionIdx + 1;
    setProgress(course.id, next);
    setSectionIdx(next);
  };
  const goPrev = () => { if (sectionIdx > 0) setSectionIdx(sectionIdx - 1); };

  const progress = ((sectionIdx + 1) / (course.sections.length + 1)) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-white border-b border-[rgb(var(--color-primary-rgb)/0.1)] px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/academy" className="text-[var(--color-primary)] text-sm hover:text-[var(--color-secondary)] transition-colors">← Catalogue</Link>
          <div className="flex-1 bg-[rgb(var(--color-primary-rgb)/0.08)] rounded-full h-2">
            <motion.div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-2 rounded-full" animate={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{sectionIdx + 1} / {course.sections.length}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-36 pb-20">
        {/* Video (first section only) */}
        {sectionIdx === 0 && course.video && (
          <motion.div className="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-video"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <iframe src={course.video} title="Vidéo de formation" className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </motion.div>
        )}

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div key={sectionIdx}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="mb-6">
              <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider">Section {sectionIdx + 1}</span>
              <h2 className="text-[var(--color-primary)] text-2xl md:text-3xl font-bold mt-1 mb-5">{section.title}</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full mb-6" />
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base">
              {section.content.split("\n\n").map((para, i) => (
                <p key={i} className={i === 0 ? "text-lg" : ""}>{para}</p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Resources */}
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
            {isLast ? "Passer au Quiz →" : "Section suivante →"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Stage: Quiz ───────────────────────────────────────────────────────────
function Quiz({ course, reg, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmitRef.current(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSubmitRef = useRef();
  handleSubmitRef.current = (auto = false) => {
    clearInterval(timerRef.current);
    // Affichage immédiat, puis remplacement par le résultat calculé et
    // enregistré par le serveur (seul celui-ci fait foi pour le certificat).
    const local = { courseId: course.id, email: reg.email, ...scoreQuiz(course.quiz, answers) };
    setResult(local);
    setSubmitted(true);
    addQuizResult({ courseId: course.id, email: reg.email, answers })
      .then((saved) => setResult({ ...local, score: saved.score, correct: saved.correct, total: saved.total, passed: saved.passed }))
      .catch(() => {});
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const timerColor = timeLeft < 120 ? "text-red-500" : "text-[var(--color-primary)]";

  if (submitted && result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-white">
        <motion.div className="max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
          <div className={`text-6xl mb-4`}>{result.passed ? "🎉" : "📚"}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{result.passed ? "Félicitations !" : "Continuez vos efforts !"}</h2>
          <div className={`inline-block rounded-full px-6 py-2 text-2xl font-bold mb-4 ${result.passed ? "bg-[rgb(var(--color-secondary-rgb)/0.12)] text-[var(--color-secondary)]" : "bg-red-50 text-red-500"}`}>
            {result.score}%
          </div>
          <p className="text-gray-500 mb-2">{result.correct} / {result.total} bonnes réponses</p>
          <p className="text-gray-500 mb-6 text-sm">{result.passed ? `Vous avez atteint le seuil de ${QUIZ_PASS_THRESHOLD}% requis.` : `Le seuil requis est de ${QUIZ_PASS_THRESHOLD}%. Vous pouvez retenter le quiz.`}</p>
          {result.passed ? (
            <motion.button onClick={() => onComplete(result)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white rounded-xl py-3 font-semibold transition-colors">
              Obtenir mon certificat →
            </motion.button>
          ) : (
            <motion.button onClick={() => { setSubmitted(false); setAnswers({}); setTimeLeft(QUIZ_DURATION); }}
              whileHover={{ scale: 1.04 }} className="w-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl py-3 font-semibold hover:bg-[rgb(var(--color-primary-rgb)/0.06)] transition-colors">
              Retenter le quiz
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quiz — {course.title}</h2>
            <p className="text-gray-500 text-sm mt-1">Répondez à toutes les questions. Score minimum requis : {QUIZ_PASS_THRESHOLD}%</p>
          </div>
          <div className={`text-2xl font-mono font-bold ${timerColor} bg-[rgb(var(--color-primary-rgb)/0.06)] rounded-xl px-4 py-2`}>
            {mm}:{ss}
          </div>
        </div>
        <div className="space-y-6">
          {course.quiz.map((q, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}
              className="bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.12)] p-5">
              <p className="font-semibold text-gray-800 mb-4">{qi + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border-2 ${
                      answers[qi] === oi
                        ? "border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)] font-medium"
                        : "border-[rgb(var(--color-primary-rgb)/0.1)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.04)]"
                    }`}>
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.button
          onClick={() => handleSubmitRef.current(false)}
          disabled={Object.keys(answers).length < course.quiz.length}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full mt-8 bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-40">
          Soumettre mes réponses ({Object.keys(answers).length}/{course.quiz.length})
        </motion.button>
      </div>
    </div>
  );
}

// ─── Stage: Certificate ────────────────────────────────────────────────────
function CertificateStage({ course, reg, quizResult }) {
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

        <div className="text-center mt-6">
          <Link href="/academy" className="text-[var(--color-primary)] text-sm hover:text-[var(--color-secondary)] transition-colors">
            ← Retour au catalogue des formations
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [stage, setStage] = useState("loading"); // loading | register | content | quiz | certificate
  const [reg, setReg] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await getCourse(courseId);
      if (cancelled) return;
      if (!c) { setStage("notfound"); return; }
      setCourse(c);
      // Check if user already registered (try stored email)
      const stored = typeof window !== "undefined" ? localStorage.getItem(`blue_reg_${courseId}`) : null;
      if (stored) {
        const r = JSON.parse(stored);
        setReg(r);
        const qr = await getCourseQuizResult(courseId, r.email).catch(() => null);
        if (cancelled) return;
        if (qr?.passed) { setQuizResult(qr); setStage("certificate"); }
        else setStage("content");
      } else { setStage("register"); }
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

  return (
    <>
      {stage === "register" && <RegistrationForm course={course} onComplete={handleRegistered} />}
      {stage === "content" && <CourseContent course={course} reg={reg} onFinish={handleContentFinish} />}
      {stage === "quiz" && <Quiz course={course} reg={reg} onComplete={handleQuizComplete} />}
      {stage === "certificate" && <CertificateStage course={course} reg={reg} quizResult={quizResult} />}
    </>
  );
}

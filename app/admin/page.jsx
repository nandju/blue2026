"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { adminLogin, isAdminAuthenticated, getLoginDepartments } from "@/lib/store";

const IDENTITY_KEY = "blue_admin_identity";
const OTHER = "Autre";
const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[rgba(13,110,187,0.2)] focus:border-[#0D6EBB] outline-none text-sm transition-colors";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [identity, setIdentity] = useState({ name: "", department: "", departmentOther: "" });
  const [identityErrors, setIdentityErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    isAdminAuthenticated().then((ok) => { if (ok) router.replace("/admin/dashboard"); });
    getLoginDepartments()
      .then((d) => setDepartments(d.departments || []))
      .catch(() => setDepartments([]));
    // Pré-remplit l'identité utilisée sur cet appareil lors de la dernière connexion.
    try {
      const saved = JSON.parse(localStorage.getItem(IDENTITY_KEY) || "null");
      if (saved) setIdentity((i) => ({ ...i, ...saved }));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitIdentity = (e) => {
    e.preventDefault();
    const errs = {};
    if (identity.name.trim().length < 2) errs.name = "Indiquez votre nom et prénom";
    if (!identity.department) errs.department = "Choisissez votre département";
    if (identity.department === OTHER && !identity.departmentOther.trim()) errs.departmentOther = "Précisez votre département";
    setIdentityErrors(errs);
    if (Object.keys(errs).length) return;
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin({ ...identity, name: identity.name.trim(), email, password });
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Connexion impossible. Réessayez.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D6EBB] to-[#0a5a9a] flex items-center justify-center px-4 py-10">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[300, 500, 700].map((s, i) => (
          <div key={i} className="absolute rounded-full border border-white/10"
            style={{ width: s, height: s, top: `${20 + i * 20}%`, right: `${-10 + i * 10}%` }} />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 25 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-[#0D6EBB] text-2xl font-bold">B</span>
          </div>
          <h1 className="text-white text-3xl font-bold">BLUE Admin</h1>
          <p className="text-white/60 text-sm mt-1">Tableau de bord administrateur</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 overflow-hidden">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((n) => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= n ? "bg-[#0D6EBB]" : "bg-[rgba(13,110,187,0.12)]"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="identity" onSubmit={submitIdentity} className="space-y-4"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div>
                  <h2 className="text-gray-900 text-xl font-bold mb-1">Qui êtes-vous ?</h2>
                  <p className="text-gray-500 text-sm">Chaque connexion est nominative et enregistrée dans le journal.</p>
                </div>
                <div>
                  <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1.5">Nom et prénom <span className="text-red-400">*</span></label>
                  <input id="name" value={identity.name} autoComplete="name"
                    onChange={(e) => setIdentity((i) => ({ ...i, name: e.target.value }))}
                    placeholder="Ex : Awa Koné" className={inputCls} maxLength={80} />
                  {identityErrors.name && <p className="text-red-500 text-xs mt-1">{identityErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="department" className="block text-gray-700 text-sm font-medium mb-1.5">Département <span className="text-red-400">*</span></label>
                  <select id="department" value={identity.department}
                    onChange={(e) => setIdentity((i) => ({ ...i, department: e.target.value }))}
                    className={`${inputCls} bg-white`}>
                    <option value="">Choisir…</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {identityErrors.department && <p className="text-red-500 text-xs mt-1">{identityErrors.department}</p>}
                  {departments.length === 0 && <p className="text-amber-600 text-xs mt-1">Chargement de la liste… (vérifiez votre connexion)</p>}
                </div>
                {identity.department === OTHER && (
                  <div>
                    <label htmlFor="departmentOther" className="block text-gray-700 text-sm font-medium mb-1.5">Précisez votre département <span className="text-red-400">*</span></label>
                    <input id="departmentOther" value={identity.departmentOther}
                      onChange={(e) => setIdentity((i) => ({ ...i, departmentOther: e.target.value }))}
                      className={inputCls} maxLength={80} />
                    {identityErrors.departmentOther && <p className="text-red-500 text-xs mt-1">{identityErrors.departmentOther}</p>}
                  </div>
                )}
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-xl py-3 font-semibold transition-colors duration-300 mt-2">
                  Continuer →
                </motion.button>
              </motion.form>
            ) : (
              <motion.form key="credentials" onSubmit={handleSubmit} className="space-y-4"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                <div>
                  <h2 className="text-gray-900 text-xl font-bold mb-1">Connexion</h2>
                  <p className="text-gray-500 text-sm">
                    {identity.name.trim()} — {identity.department === OTHER ? identity.departmentOther : identity.department}
                    <button type="button" onClick={() => setStep(1)} className="ml-2 text-[#0D6EBB] hover:text-[#0DBD9F] underline text-xs">Modifier</button>
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1.5">Adresse email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"
                    placeholder="admin@bluemakers.net" className={inputCls} required autoFocus />
                </div>
                <div>
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input id="password" type={showPw ? "text" : "password"} value={password} autoComplete="current-password"
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className={`${inputCls} pr-16`} required />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D6EBB] transition-colors text-sm">
                      {showPw ? "Cacher" : "Voir"}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="alert"
                    className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl border border-[rgba(13,110,187,0.2)] text-[#0D6EBB] text-sm font-semibold hover:bg-[rgba(13,110,187,0.06)] transition-colors">
                    ← Retour
                  </button>
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-xl py-3 font-semibold transition-colors duration-300 disabled:opacity-60">
                    {loading ? "Connexion..." : "Se connecter"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} BLUE — Accès restreint · Session de 8 heures
        </p>
      </motion.div>
    </div>
  );
}

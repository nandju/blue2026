"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { adminLogin, isAdminAuthenticated } from "@/lib/store";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) router.replace("/admin/dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = adminLogin(email, password);
      if (ok) { router.replace("/admin/dashboard"); }
      else { setError("Email ou mot de passe incorrect."); setLoading(false); }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D6EBB] to-[#0a5a9a] flex items-center justify-center px-4">
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-[#0D6EBB] text-2xl font-bold">B</span>
          </div>
          <h1 className="text-white text-3xl font-bold">BLUE Admin</h1>
          <p className="text-white/60 text-sm mt-1">Tableau de bord administrateur</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-900 text-xl font-bold mb-1">Connexion</h2>
          <p className="text-gray-500 text-sm mb-6">Accès réservé aux administrateurs BLUE</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">Adresse Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@blueacademy.ci"
                className="w-full px-4 py-3 rounded-xl border border-[rgba(13,110,187,0.2)] focus:border-[#0D6EBB] outline-none text-sm transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-[rgba(13,110,187,0.2)] focus:border-[#0D6EBB] outline-none text-sm transition-colors pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D6EBB] transition-colors text-sm">
                  {showPw ? "Cacher" : "Voir"}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-xl py-3 font-semibold transition-colors duration-300 mt-2 disabled:opacity-60">
              {loading ? "Connexion..." : "Se connecter"}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} BLUE — Accès restreint
        </p>
      </motion.div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { getCourses } from "@/lib/store";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";

import HeroImg from "@/public/ong_blue/images/illustrations/page-landing/blue_training_1.png";

const CATEGORIES = ["Tous", "environnement", "formation"];
const LEVELS = ["Tous niveaux", "Débutant", "Intermédiaire", "Avancé"];

const levelColor = {
  Débutant: "bg-[rgb(var(--color-secondary-rgb)/0.12)] text-[var(--color-secondary)]",
  Intermédiaire: "bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]",
  Avancé: "bg-[rgb(var(--color-primary-rgb)/0.18)] text-[var(--color-primary-dark)]",
};

const categoryLabel = { environnement: "Environnement", formation: "Formation" };

const PERKS = [
  "Formations 100% gratuites et en ligne",
  "Vidéos, sections pédagogiques et PDF téléchargeables",
  "Quiz chronométré — certificat dès 80% de réussite",
];

export default function AcademyPage() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [level, setLevel] = useState("Tous niveaux");

  const loadCourses = () => {
    setError(false);
    setCourses(null);
    getCourses().then(setCourses).catch(() => setError(true));
  };

  useEffect(() => {
    loadCourses();
    window.scrollTo(0, 0);
  }, []);

  const list = courses || [];
  const filtered = list.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tous" || c.category === category;
    const matchLevel = level === "Tous niveaux" || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <PageHero
        image={HeroImg}
        eyebrow="Blue Academy"
        title="Formez-vous, devenez ambassadeur de l'environnement"
        description="Notre plateforme de formation en ligne vous donne les clés pour comprendre la pollution plastique, le recyclage et la mobilisation communautaire — avec certificat à la clé."
      />

      {/* Perks */}
      <section className="bg-[var(--color-navy)] py-8">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
          {PERKS.map((p) => (
            <p key={p} className="flex items-center gap-2.5 text-white/85 text-sm text-center md:text-left">
              <span className="w-5 h-5 rounded-full bg-[var(--color-secondary)]/30 text-[var(--color-secondary)] flex items-center justify-center text-[10px] shrink-0">✓</span>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Catalogue */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <SectionHeader
            eyebrow="Catalogue"
            title="Nos formations"
            description="Choisissez une formation, inscrivez-vous et progressez à votre rythme jusqu'au quiz de certification."
          />

          {/* Search & Filters */}
          <motion.div
            className="mt-10 bg-white rounded-2xl shadow-lg p-5 border border-[rgb(var(--color-primary-rgb)/0.1)]"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une formation..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgb(var(--color-primary-rgb)/0.15)] focus:border-[var(--color-primary)] outline-none text-sm transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      category === cat ? "bg-[var(--color-primary)] text-white" : "bg-[rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.15)]"
                    }`}>
                    {cat === "Tous" ? "Tous" : categoryLabel[cat] || cat}
                  </button>
                ))}
              </div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="px-4 py-2 rounded-xl border border-[rgb(var(--color-primary-rgb)/0.15)] text-sm text-gray-700 focus:border-[var(--color-primary)] outline-none bg-white">
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </motion.div>

          {/* Course Grid */}
          <div className="mt-10 pb-10">
            {error ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🌊</p>
                <p className="text-lg text-gray-600 font-medium">Le catalogue est momentanément indisponible</p>
                <p className="text-sm text-gray-400 mt-2">Vérifiez votre connexion puis réessayez.</p>
                <button
                  onClick={loadCourses}
                  className="mt-6 rounded-full bg-[var(--color-primary)] px-7 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
                  Réessayer
                </button>
              </div>
            ) : courses === null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.12)] overflow-hidden animate-pulse">
                    <div className="h-36 bg-[var(--color-primary)]/10" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[var(--color-primary)]/10 rounded w-2/3" />
                      <div className="h-3 bg-[var(--color-primary)]/10 rounded" />
                      <div className="h-3 bg-[var(--color-primary)]/10 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-4">📚</p>
                <p className="text-lg">Aucune formation trouvée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl border border-[rgb(var(--color-primary-rgb)/0.12)] hover:border-[var(--color-primary)] hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] h-36 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white" />
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full border-2 border-white" />
                      </div>
                      <span className="text-white text-5xl relative z-10">🌿</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${levelColor[course.level] || "bg-gray-100 text-gray-600"}`}>
                          {course.level}
                        </span>
                        <span className="text-gray-400 text-xs">⏱ {course.duration}</span>
                      </div>
                      <h3 className="text-gray-900 font-bold text-base mb-2 group-hover:text-[var(--color-primary)] transition-colors leading-snug">{course.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{course.enrolled || 0} apprenants</span>
                        <Link href={`/academy/${course.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors duration-300">
                            Commencer
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getCourses } from "@/lib/store";
import FixedButton from "@/components/FixedButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = ["Tous", "environnement", "formation"];
const LEVELS = ["Tous niveaux", "Débutant", "Intermédiaire", "Avancé"];

const levelColor = {
  Débutant: "bg-[rgba(13,189,159,0.12)] text-[#0DBD9F]",
  Intermédiaire: "bg-[rgba(13,110,187,0.12)] text-[#0D6EBB]",
  Avancé: "bg-[rgba(13,110,187,0.18)] text-[#0a5a9a]",
};

const categoryLabel = { environnement: "Environnement", formation: "Formation" };

export default function AcademyPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [level, setLevel] = useState("Tous niveaux");

  useEffect(() => { setCourses(getCourses()); }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tous" || c.category === category;
    const matchLevel = level === "Tous niveaux" || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <FixedButton href="/">
        <FontAwesomeIcon icon={faChevronLeft} className="text-black pr-10" />
      </FixedButton>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0D6EBB] to-[#0a5a9a] pt-28 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border-2 border-white"
              style={{ width: `${120 + i * 80}px`, height: `${120 + i * 80}px`, top: `${10 + i * 8}%`, right: `${-10 + i * 5}%`, opacity: 0.4 - i * 0.05 }} />
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.p
            className="text-[#0DBD9F] uppercase tracking-[0.4rem] text-sm font-medium mb-3"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            BLUE
          </motion.p>
          <motion.h1
            className="text-white text-5xl md:text-7xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring" }}>
            Blue Academy
          </motion.h1>
          <motion.p
            className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            Formez-vous gratuitement sur l&apos;environnement, devenez ambassadeur et obtenez un certificat reconnu par BLUE.
          </motion.p>
          {/* Stats */}
          <motion.div
            className="flex justify-center gap-8 mt-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {[["Formations", courses.length], ["Certifications", "Gratuites"], ["Accès", "100% en ligne"]].map(([label, val]) => (
              <div key={label} className="text-center">
                <p className="text-white text-2xl font-bold">{val}</p>
                <p className="text-white/60 text-xs uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="max-w-5xl mx-auto px-6 -mt-6 mb-10">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-5 border border-[rgba(13,110,187,0.1)]"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une formation..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgba(13,110,187,0.15)] focus:border-[#0D6EBB] outline-none text-sm transition-colors"
              />
            </div>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    category === cat ? "bg-[#0D6EBB] text-white" : "bg-[rgba(13,110,187,0.08)] text-[#0D6EBB] hover:bg-[rgba(13,110,187,0.15)]"
                  }`}>
                  {cat === "Tous" ? "Tous" : categoryLabel[cat] || cat}
                </button>
              ))}
            </div>
            {/* Level filter */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[rgba(13,110,187,0.15)] text-sm text-gray-700 focus:border-[#0D6EBB] outline-none bg-white">
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </motion.div>
      </section>

      {/* Course Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
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
                transition={{ delay: i * 0.07, type: "spring" }}
                className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] hover:border-[#0D6EBB] hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Card thumb */}
                <div className="bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] h-36 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white" />
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full border-2 border-white" />
                  </div>
                  <span className="text-white text-5xl relative z-10">🌿</span>
                </div>
                {/* Card body */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${levelColor[course.level] || "bg-gray-100 text-gray-600"}`}>
                      {course.level}
                    </span>
                    <span className="text-gray-400 text-xs">⏱ {course.duration}</span>
                  </div>
                  <h3 className="text-gray-900 font-bold text-base mb-2 group-hover:text-[#0D6EBB] transition-colors leading-snug">{course.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{course.enrolled || 0} apprenants</span>
                    <Link href={`/academy/${course.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors duration-300">
                        Commencer
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

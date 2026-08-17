"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { getCourses } from "@/lib/store";
import Button from "@/components/Button";
import Hr from "@/components/Hr";

// images
import AcademyHero from "@/public/ong_blue/images/illustrations/page-landing/blue_training_1.png";

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero */}
      <div className="relative h-screen w-screen  gap-4 p-10 flex justify-center items-center flex-col mb-10 overflow-hidden">
        <div className="z-0 mb-48 md:mb-0  md:absolute top-1/4  md:right-[10%] md:-translate-y-16 ">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.6 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="relative bg-slate-300 rounded-sm h-[400px] md:h-[600px] w-[80vw] md:w-[30vw] grayscale hover:grayscale-0 ">
            <Image
              src={AcademyHero}
              alt="Blue Academy"
              fill
              placeholder="blur"
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 30vw"
            />
          </motion.div>
        </div>
        <div className="z-10 w-full absolute md:w-auto md:left-[10%] top-[60%] md:top-1/3 col-span-2 flex flex-col justify-center items-start md:items-start text-start px-10 pt-4 backdrop-filter backdrop-blur-sm md:backdrop-blur-none md:backdrop-filter-none bg-gray-100 bg-opacity-50 md:bg-transparent md:pt-0">
          <h1 className="md:bg-white bg-transparent lg:bg-transparent bg-opacity-50 md-px-0 text-[#0D6EBB] text-5xl md:text-8xl font-bold">
            Blue Academy
          </h1>
          <Hr />
          <p className="title  text-xl mt-4 tracking-wider text-gray-900 leading-[1.7rem] mb-5">
            Formez-vous gratuitement, devenez ambassadeur et{" "}
            <span className="bg-transparent md:bg-gray-100 bg-opacity-50 xl:bg-transparent">
              obtenez un certificat reconnu par BLUE.
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            onClick={() => {
              window.scrollTo({
                top: 1000,
                behavior: "smooth",
              });
            }}
            className="mb-3">
            <Button variation="primary">Défiler</Button>
          </motion.div>
        </div>
      </div>

      {/* Section title */}
      <div className="mt-10 flex flex-col justify-start items-center w-full pl-10 md:pl-32">
        <div className="flex justify-center items-center flex-col my-5 self-start ">
          <Hr variant="long"></Hr>
          <h1 className="text-3xl font-bold mt-3 text-[#0D6EBB]">Nos Formations</h1>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        className="flex justify-center flex-wrap gap-8 md:gap-16 my-8 px-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring" }}>
        {[["Formations", courses.length], ["Certifications", "Gratuites"], ["Accès", "100% en ligne"]].map(([label, val]) => (
          <div key={label} className="text-center">
            <p className="text-[#0D6EBB] text-3xl font-bold">{val}</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <section className="max-w-5xl mx-auto px-6 mb-10">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-5 border border-[rgba(13,110,187,0.1)]"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ type: "spring" }}>
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

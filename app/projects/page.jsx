"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "./components/ProjectCard";
import Projects from "@/json/data.json";

import HeroImg from "@/public/ong_blue/images/illustrations/page-landing/sustainable-future-ocean-protection.jpg";
import Featured1 from "@/public/ong_blue/images/illustrations/page-landing/action_1.jpg";
import Featured2 from "@/public/ong_blue/images/illustrations/page-landing/community-cleanup-volunteers-beach.jpg";

const CATEGORIES = {
	1: "Projets Environnementaux",
	2: "Formations & Éducation",
	9: "Autres Initiatives",
};

export default function ProjectsPage() {
	const [activeCategory, setActiveCategory] = useState(1);
	const projects = Projects.Projects.filter((item) => item.show === true);
	const featured = Projects.Projects.find((p) => p.slug === "recycl-day");

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={HeroImg}
				eyebrow="Nos actions"
				title="Des projets concrets contre la pollution plastique"
				description="Nettoyages de plages et de lagunes, sensibilisation, reforestation, recyclage et formations : découvrez ce que BLUE réalise avec sa communauté.">
				<HeroButton href="/benevolat">Participer à une action</HeroButton>
				<HeroButton href="/projects/archive" variant="secondary">Voir les archives</HeroButton>
			</PageHero>

			{/* Projet phare */}
			{featured && (
				<section className="py-20 md:py-28 bg-white">
					<div className="mx-auto max-w-7xl px-6 md:px-8">
						<SectionHeader
							align="left"
							eyebrow="Projet phare"
							title={featured.title}
						/>
						<div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div className="relative">
								<motion.div
									className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
									initial={{ opacity: 0, scale: 0.95 }}
									whileInView={{ opacity: 1, scale: 1 }}
									viewport={{ once: true }}
									transition={{ duration: 0.6 }}>
									<Image src={Featured1} alt={featured.title} fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" placeholder="blur" />
								</motion.div>
								<motion.div
									className="absolute -bottom-6 -right-4 md:right-10 w-36 md:w-48 aspect-square rounded-2xl overflow-hidden border-8 border-white shadow-xl"
									initial={{ opacity: 0, scale: 0.8 }}
									whileInView={{ opacity: 1, scale: 1 }}
									viewport={{ once: true }}
									transition={{ delay: 0.25, duration: 0.5 }}>
									<Image src={Featured2} alt="Bénévoles RECYCL'DAY" fill sizes="200px" className="object-cover" placeholder="blur" />
								</motion.div>
							</div>
							<motion.div
								initial={{ opacity: 0, x: 40 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.7 }}>
								<span className="inline-block bg-[#0DBD9F]/10 text-[#0DBD9F] text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
									Événement récurrent · {featured.year}
								</span>
								<h3 className="mt-4 text-2xl md:text-3xl font-bold text-[#073A63]">
									Nettoyer, sensibiliser, mobiliser
								</h3>
								<p className="mt-4 text-gray-600 leading-relaxed text-justify">
									{featured.desc[0]}
								</p>
								<div className="mt-5 flex flex-wrap gap-2">
									{featured.tech.map((t) => (
										<span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[#0D6EBB]/8 text-[#0D6EBB] font-medium">
											{t}
										</span>
									))}
								</div>
								<Link
									href={`/projects/${featured.slug}`}
									className="mt-7 inline-block rounded-full bg-[#0D6EBB] px-7 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#0DBD9F] transition-colors duration-300">
									Découvrir le projet →
								</Link>
							</motion.div>
						</div>
					</div>
				</section>
			)}

			{/* Tous les projets */}
			<section className="py-20 md:py-24 bg-[#f4f9fd]">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Catalogue"
						title="Tous nos programmes"
						description="Filtrez par type d'action pour explorer les projets menés par BLUE."
					/>

					{/* Filtres */}
					<motion.div
						className="mt-10 flex flex-wrap justify-center gap-3"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						{Object.entries(CATEGORIES).map(([key, label]) => (
							<button
								key={key}
								onClick={() => setActiveCategory(Number(key))}
								className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
									activeCategory === Number(key)
										? "bg-[#0D6EBB] text-white shadow-lg"
										: "bg-white text-[#0D6EBB] border border-[#0D6EBB]/20 hover:border-[#0D6EBB]"
								}`}>
								{label}
							</button>
						))}
					</motion.div>

					{/* Grille */}
					<div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{projects.map((project, index) => (
							<ProjectCard
								project={project}
								key={project.slug}
								index={index}
								activeCategory={activeCategory}
							/>
						))}
					</div>

					<div className="mt-12 text-center">
						<Link
							href="/projects/archive"
							className="inline-block rounded-full border-2 border-[#0D6EBB] px-8 py-3 text-sm font-semibold text-[#0D6EBB] hover:bg-[#0D6EBB] hover:text-white transition-colors duration-300">
							Consulter les archives →
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}

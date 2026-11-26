"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import ProjectCard from "./components/ProjectCard";
import { getProjects } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import { PROJECT_CATEGORIES } from "@/lib/content/defaults";

export default function ProjectsPage() {
	const c = useContent("projectsPage") || {};
	const { hero = {}, featured: feat = {}, catalog = {} } = c;
	const [activeCategory, setActiveCategory] = useState(1);
	const [projects, setProjects] = useState([]);
	const featured = projects.find((p) => p.slug === feat.slug) || projects[0];

	useEffect(() => {
		window.scrollTo(0, 0);
		getProjects()
			.then(setProjects)
			.catch(() => setProjects([]));
	}, []);

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={hero.image}
				eyebrow={hero.eyebrow}
				title={hero.title}
				description={hero.description}>
				{(hero.buttons || []).map((b, i) =>
					b?.href ? (
						<HeroButton key={i} href={b.href} variant={b.variant}>
							{b.label}
						</HeroButton>
					) : null
				)}
			</PageHero>

			{/* Projet phare */}
			{featured && (
				<section className="py-20 md:py-28 bg-white">
					<div className="mx-auto max-w-7xl px-6 md:px-8">
						<SectionHeader
							align="left"
							eyebrow={feat.eyebrow}
							title={featured.title}
						/>
						<div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div className="relative">
								{feat.image && (
									<motion.div
										className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
										initial={{ opacity: 0, scale: 0.95 }}
										whileInView={{ opacity: 1, scale: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6 }}>
										<Image src={feat.image} alt={featured.title} fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
									</motion.div>
								)}
								{feat.imageOverlay && (
									<motion.div
										className="absolute -bottom-6 -right-4 md:right-10 w-36 md:w-48 aspect-square rounded-2xl overflow-hidden border-8 border-white shadow-xl"
										initial={{ opacity: 0, scale: 0.8 }}
										whileInView={{ opacity: 1, scale: 1 }}
										viewport={{ once: true }}
										transition={{ delay: 0.25, duration: 0.5 }}>
										<Image src={feat.imageOverlay} alt={feat.imageOverlayAlt || ""} fill sizes="200px" className="object-cover" />
									</motion.div>
								)}
							</div>
							<motion.div
								initial={{ opacity: 0, x: 40 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.7 }}>
								<span className="inline-block bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
									Événement récurrent · {featured.year}
								</span>
								<h3 className="mt-4 text-2xl md:text-3xl font-bold text-[var(--color-dark)]">
									{feat.tagline}
								</h3>
								<p className="mt-4 text-gray-600 leading-relaxed text-justify">
									{featured.desc?.[0]}
								</p>
								<div className="mt-5 flex flex-wrap gap-2">
									{(featured.tech || []).map((t) => (
										<span key={t} className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] font-medium">
											{t}
										</span>
									))}
								</div>
								<Link
									href={`/projects/${featured.slug}`}
									className="mt-7 inline-block rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-secondary)] transition-colors duration-300">
									{feat.ctaLabel || "Découvrir le projet →"}
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
						eyebrow={catalog.eyebrow}
						title={catalog.title}
						description={catalog.description}
					/>

					{/* Filtres */}
					<motion.div
						className="mt-10 flex flex-wrap justify-center gap-3"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						{PROJECT_CATEGORIES.map((cat) => (
							<button
								key={cat.value}
								onClick={() => setActiveCategory(cat.value)}
								className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
									activeCategory === cat.value
										? "bg-[var(--color-primary)] text-white shadow-lg"
										: "bg-white text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]"
								}`}>
								{cat.label}
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

					{catalog.archiveCta && (
						<div className="mt-12 text-center">
							<Link
								href="/projects/archive"
								className="inline-block rounded-full border-2 border-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-300">
								{catalog.archiveCta}
							</Link>
						</div>
					)}
				</div>
			</section>
		</main>
	);
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import SectionHeader from "@/components/SectionHeader";
import { useContent } from "@/components/SiteContentProvider";
import { getProjects } from "@/lib/store";
import BlurImage from "@/public/image/placeholder/blur.jpg";

export default function ProjectsSection() {
	const c = useContent("home.projects");
	const [projects, setProjects] = useState([]);

	useEffect(() => {
		getProjects()
			.then(setProjects)
			.catch(() => setProjects([]));
	}, []);

	if (!c) return null;

	const featured = (c.featured || []).length
		? c.featured.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean)
		: projects.slice(0, 3);

	return (
		<section id="projects" className="py-20 md:py-28 bg-white scroll-mt-20">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow={c.eyebrow}
					title={c.title}
					description={c.description}
				/>
				<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
					{featured.map((p, i) => (
						<motion.div
							key={p.slug}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-60px" }}
							transition={{ delay: i * 0.1, duration: 0.55 }}>
							<Link
								href={`/projects/${p.slug}`}
								className="group block rounded-3xl overflow-hidden bg-white border border-[var(--color-primary)]/10 shadow-sm hover:shadow-2xl transition-all duration-300">
								<div className="relative aspect-[16/10] overflow-hidden">
									{p.thumbnail && (
										<Image
											src={p.thumbnail}
											alt={p.title}
											fill
											sizes="(max-width: 768px) 100vw, 33vw"
											className="object-cover group-hover:scale-105 transition-transform duration-700"
											placeholder="blur"
											blurDataURL={BlurImage.src}
										/>
									)}
									<span className="absolute top-4 left-4 bg-[var(--color-secondary)] text-white text-xs font-semibold px-3 py-1 rounded-full">
										{p.year}
									</span>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors">
										{p.title}
									</h3>
									<p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
										{p.desc?.[0]}
									</p>
									<div className="mt-4 flex flex-wrap gap-2">
										{(p.tech || []).slice(0, 3).map((t) => (
											<span key={t} className="text-xs px-3 py-1 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
												{t}
											</span>
										))}
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
				{c.cta?.href && (
					<div className="mt-12 text-center">
						<Link
							href={c.cta.href}
							className="inline-block rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-secondary)] transition-colors duration-300">
							{c.cta.label}
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import PageHero from "@/components/PageHero";
import { getProjects } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";

export default function ArchivePage() {
	const arch = useContent("projectsPage.archive") || {};
	const hero = arch.hero || {};
	const [projects, setProjects] = useState([]);

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
				description={hero.description}
			/>

			<section className="py-16 md:py-24 bg-white">
				<div className="mx-auto max-w-5xl px-6 md:px-8">
					<div className="overflow-x-auto rounded-2xl border border-[var(--color-primary)]/10 shadow-sm">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="bg-[var(--color-primary)] text-white">
									<th className="py-4 px-5 font-semibold">Année</th>
									<th className="py-4 px-5 font-semibold">Projet</th>
									<th className="py-4 px-5 font-semibold hidden md:table-cell">Domaines</th>
									<th className="py-4 px-5 font-semibold">Lien</th>
								</tr>
							</thead>
							<tbody>
								{projects.map((project, index) => (
									<motion.tr
										key={project.slug}
										className="border-t border-[var(--color-primary)]/8 hover:bg-[#f4f9fd] transition-colors"
										initial={{ opacity: 0, y: 10 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.04 }}>
										<td className="py-4 px-5 text-[var(--color-secondary)] font-semibold whitespace-nowrap">
											{project.year}
										</td>
										<td className="py-4 px-5 font-medium text-[var(--color-dark)]">
											{project.title}
										</td>
										<td className="py-4 px-5 text-gray-500 hidden md:table-cell">
											{(project.tech || []).join(", ")}
										</td>
										<td className="py-4 px-5">
											<Link
												href={`/projects/${project.slug}`}
												className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-secondary)] transition-colors whitespace-nowrap">
												Voir →
											</Link>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>
					{arch.backCta && (
						<div className="mt-10 text-center">
							<Link
								href="/projects"
								className="inline-block rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
								{arch.backCta}
							</Link>
						</div>
					)}
				</div>
			</section>
		</main>
	);
}

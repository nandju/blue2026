"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import PageHero from "@/components/PageHero";
import Projects from "@/json/data.json";
import HeroImg from "@/public/ong_blue/images/illustrations/page-landing/marine-research-ocean-pollution-study.jpg";

export default function ArchivePage() {
	const projects = Projects.Projects;

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={HeroImg}
				eyebrow="Archives"
				title="L'historique de nos actions"
				description="Retrouvez l'ensemble des projets et programmes menés par BLUE depuis sa création en 2022."
			/>

			<section className="py-16 md:py-24 bg-white">
				<div className="mx-auto max-w-5xl px-6 md:px-8">
					<div className="overflow-x-auto rounded-2xl border border-[#0D6EBB]/10 shadow-sm">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="bg-[#0D6EBB] text-white">
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
										className="border-t border-[#0D6EBB]/8 hover:bg-[#f4f9fd] transition-colors"
										initial={{ opacity: 0, y: 10 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.04 }}>
										<td className="py-4 px-5 text-[#0DBD9F] font-semibold whitespace-nowrap">
											{project.year}
										</td>
										<td className="py-4 px-5 font-medium text-[#073A63]">
											{project.title}
										</td>
										<td className="py-4 px-5 text-gray-500 hidden md:table-cell">
											{project.tech.join(", ")}
										</td>
										<td className="py-4 px-5">
											<Link
												href={`/projects/${project.slug}`}
												className="text-[#0D6EBB] font-semibold hover:text-[#0DBD9F] transition-colors whitespace-nowrap">
												Voir →
											</Link>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="mt-10 text-center">
						<Link
							href="/projects"
							className="inline-block rounded-full bg-[#0D6EBB] px-8 py-3 text-sm font-semibold text-white hover:bg-[#0DBD9F] transition-colors">
							← Retour aux projets
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}

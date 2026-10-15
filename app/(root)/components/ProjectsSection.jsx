"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import SectionHeader from "@/components/SectionHeader";
import data from "@/json/data.json";
import BlurImage from "@/public/image/placeholder/blur.jpg";

const FEATURED_SLUGS = ["recycl-day", "journee-mondiale-oceans", "one-blue-maker-one-tree"];

export default function ProjectsSection() {
	const featured = FEATURED_SLUGS
		.map((slug) => data.Projects.find((p) => p.slug === slug))
		.filter(Boolean);

	return (
		<section id="projects" className="py-20 md:py-28 bg-white scroll-mt-20">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow="Nos Actions"
					title="Des projets concrets sur le terrain"
					description="Nettoyages de plages, sensibilisation, reforestation et recyclage : découvrez les programmes menés par BLUE et ses bénévoles."
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
								className="group block rounded-3xl overflow-hidden bg-white border border-[#0D6EBB]/10 shadow-sm hover:shadow-2xl transition-all duration-300">
								<div className="relative aspect-[16/10] overflow-hidden">
									<Image
										src={p.thumbnail}
										alt={p.title}
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover group-hover:scale-105 transition-transform duration-700"
										placeholder="blur"
										blurDataURL={BlurImage.src}
									/>
									<span className="absolute top-4 left-4 bg-[#0DBD9F] text-white text-xs font-semibold px-3 py-1 rounded-full">
										{p.year}
									</span>
								</div>
								<div className="p-6">
									<h3 className="text-xl font-bold text-[#073A63] group-hover:text-[#0D6EBB] transition-colors">
										{p.title}
									</h3>
									<p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
										{p.desc[0]}
									</p>
									<div className="mt-4 flex flex-wrap gap-2">
										{p.tech.slice(0, 3).map((t) => (
											<span key={t} className="text-xs px-3 py-1 rounded-full bg-[#0D6EBB]/8 text-[#0D6EBB]">
												{t}
											</span>
										))}
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
				<div className="mt-12 text-center">
					<Link
						href="/projects"
						className="inline-block rounded-full bg-[#0D6EBB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#0DBD9F] transition-colors duration-300">
						Voir toutes nos actions →
					</Link>
				</div>
			</div>
		</section>
	);
}

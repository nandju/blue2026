"use client";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import SectionHeader from "@/components/SectionHeader";
import { useContent } from "@/components/SiteContentProvider";

export default function CommunitySection() {
	const c = useContent("home.community");
	const zones = useContent("shared.zones.list") || [];
	if (!c) return null;

	return (
		<section className="py-20 md:py-28 bg-white">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow={c.eyebrow}
					title={c.title}
					description={c.description}
				/>
				<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
					{zones.map((z, i) => (
						<motion.a
							key={`${z.name}-${i}`}
							href={z.link}
							target="_blank"
							rel="noopener noreferrer"
							className="group rounded-3xl border border-[var(--color-primary)]/10 bg-[#f4f9fd] p-8 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-60px" }}
							transition={{ delay: i * 0.1, duration: 0.5 }}>
							<span className="inline-flex w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] items-center justify-center text-2xl">
								<FontAwesomeIcon icon={faWhatsapp} />
							</span>
							<h3 className="mt-5 text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors">
								{z.name}
							</h3>
							<p className="mt-2 text-sm text-gray-600 leading-relaxed">{z.areas}</p>
							<span className="mt-5 inline-block text-sm font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors">
								{c.ctaLabel}
							</span>
						</motion.a>
					))}
				</div>
			</div>
		</section>
	);
}

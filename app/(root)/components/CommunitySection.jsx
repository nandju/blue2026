"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faUsers } from "@fortawesome/free-solid-svg-icons";

import SectionHeader from "@/components/SectionHeader";
import { useContent } from "@/components/SiteContentProvider";

export default function CommunitySection() {
	const c = useContent("home.community");
	if (!c) return null;

	return (
		<section className="py-20 md:py-28 bg-white">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow={c.eyebrow}
					title={c.title}
					description={c.description}
				/>
				<motion.div
					className="mt-14 max-w-3xl mx-auto rounded-3xl border border-[var(--color-primary)]/10 bg-[#f4f9fd] p-10 text-center"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-60px" }}
					transition={{ duration: 0.5 }}>
					<span className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-3xl shadow-lg">
						<FontAwesomeIcon icon={faUsers} />
					</span>
					{c.cta?.href && (
						<Link
							href={c.cta.href}
							className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-3.5 text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
							{c.cta.label || "Rejoindre →"}
							<FontAwesomeIcon icon={faArrowRight} />
						</Link>
					)}
				</motion.div>
			</div>
		</section>
	);
}

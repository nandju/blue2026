"use client";
import { motion } from "framer-motion";
import Link from "next/link";

import { useContent } from "@/components/SiteContentProvider";

export default function PartnersCtaSection() {
	const c = useContent("home.partnersCta");
	if (!c) return null;

	return (
		<section className="py-16 md:py-20 bg-[#f4f9fd] border-t border-[var(--color-primary)]/10">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<motion.div
					className="flex flex-col md:flex-row items-center justify-between gap-8"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}>
					<div className="max-w-xl text-center md:text-left">
						{c.eyebrow && (
							<span className="text-[var(--color-secondary)] text-xs font-bold uppercase tracking-[0.3em]">
								{c.eyebrow}
							</span>
						)}
						<h2 className="mt-3 text-2xl md:text-4xl font-bold text-[var(--color-dark)]">
							{c.title}
						</h2>
						{c.text && (
							<p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">
								{c.text}
							</p>
						)}
					</div>
					{c.cta?.href && (
						<Link
							href={c.cta.href}
							className="shrink-0 rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-secondary)] transition-colors duration-300">
							{c.cta.label}
						</Link>
					)}
				</motion.div>
			</div>
		</section>
	);
}

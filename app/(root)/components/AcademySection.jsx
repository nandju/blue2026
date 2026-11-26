"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { useContent } from "@/components/SiteContentProvider";

export default function AcademySection() {
	const c = useContent("home.academy");
	if (!c) return null;

	return (
		<section id="academy" className="relative py-24 md:py-36 overflow-hidden scroll-mt-20">
			{/* Background */}
			{c.bgImage && (
				<div className="absolute inset-0">
					<Image src={c.bgImage} alt="" fill sizes="100vw" className="object-cover" />
					<div className="absolute inset-0 bg-[var(--color-navy)]/70" />
				</div>
			)}

			<div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
				<div className="max-w-2xl">
					<motion.h2
						className="text-white text-4xl md:text-6xl font-bold leading-tight"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.7 }}>
						{c.title}
					</motion.h2>
				</div>

				<div className="mt-10 flex justify-end">
					<motion.div
						className="w-full max-w-lg bg-[var(--color-secondary)] rounded-3xl p-8 md:p-10 shadow-2xl"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.7 }}>
						<p className="text-white text-lg md:text-xl font-medium leading-relaxed">
							{c.lead}
						</p>
						<ul className="mt-5 space-y-2.5">
							{(c.perks || []).map((p) => (
								<li key={p} className="flex items-start gap-3 text-white/95 text-sm">
									<span className="mt-1 w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px]">✓</span>
									{p}
								</li>
							))}
						</ul>
						{c.cta?.href && (
							<Link
								href={c.cta.href}
								className="mt-7 inline-block rounded-full bg-white text-[var(--color-primary)] px-7 py-3 text-sm font-bold shadow-lg hover:bg-[var(--color-dark)] hover:text-white transition-colors duration-300">
								{c.cta.label}
							</Link>
						)}
					</motion.div>
				</div>
			</div>
		</section>
	);
}

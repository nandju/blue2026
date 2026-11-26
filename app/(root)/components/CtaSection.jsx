"use client";
import { motion } from "framer-motion";
import Link from "next/link";

import { useContent } from "@/components/SiteContentProvider";

export default function CtaSection() {
	const c = useContent("home.cta");
	if (!c) return null;

	return (
		<section id="contact" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-navy)] scroll-mt-20">
			{/* Decorative waves */}
			<div className="absolute inset-0 opacity-10 pointer-events-none">
				{[320, 520, 720].map((s, i) => (
					<div
						key={i}
						className="absolute rounded-full border-2 border-white"
						style={{ width: s, height: s, top: `${-10 + i * 15}%`, left: `${60 + i * 8}%` }}
					/>
				))}
			</div>
			<div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
				<motion.h2
					className="text-white text-3xl md:text-5xl font-bold leading-tight"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.7 }}>
					{c.title}
				</motion.h2>
				{c.text && (
					<motion.p
						className="mt-5 text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.7 }}>
						{c.text}
					</motion.p>
				)}
				{(c.buttons || []).length > 0 && (
					<motion.div
						className="mt-10 flex flex-wrap items-center justify-center gap-4"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.3, duration: 0.6 }}>
						{c.buttons.map((b, i) =>
							b?.href ? (
								<Link
									key={i}
									href={b.href}
									className={`rounded-full px-8 py-3.5 text-sm md:text-base font-semibold transition-all duration-300 ${
										b.variant === "secondary"
											? "border-2 border-white/60 text-white hover:bg-white hover:text-[var(--color-primary)]"
											: "bg-[var(--color-secondary)] text-white shadow-xl hover:bg-white hover:text-[var(--color-primary)]"
									}`}>
									{b.label}
								</Link>
							) : null
						)}
					</motion.div>
				)}
			</div>
		</section>
	);
}

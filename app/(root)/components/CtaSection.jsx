"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CtaSection() {
	return (
		<section id="contact" className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-[#0D6EBB] via-[#0a5a9a] to-[#062E52] scroll-mt-20">
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
					Prêt à agir pour la planète ?
				</motion.h2>
				<motion.p
					className="mt-5 text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.7 }}>
					Rejoignez la communauté BLUE : participez à nos nettoyages, formez-vous
					avec Blue Academy ou échangez avec MR BLUE, notre assistant.
				</motion.p>
				<motion.div
					className="mt-10 flex flex-wrap items-center justify-center gap-4"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3, duration: 0.6 }}>
					<Link
						href="/benevolat"
						className="rounded-full bg-[#0DBD9F] px-8 py-3.5 text-sm md:text-base font-semibold text-white shadow-xl hover:bg-white hover:text-[#0D6EBB] transition-all duration-300">
						Devenir bénévole
					</Link>
					<Link
						href="/contact"
						className="rounded-full border-2 border-white/60 px-8 py-3.5 text-sm md:text-base font-semibold text-white hover:bg-white hover:text-[#0D6EBB] transition-all duration-300">
						Nous contacter
					</Link>
				</motion.div>
			</div>
		</section>
	);
}

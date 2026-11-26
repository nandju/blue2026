"use client";
import { motion } from "framer-motion";
import Image from "next/image";

import { useContent } from "@/components/SiteContentProvider";

export default function QuoteSection() {
	const c = useContent("home.quote");
	if (!c) return null;

	return (
		<section className="py-20 md:py-28 bg-white">
			<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
				{/* Photo duo */}
				<div className="grid grid-cols-2 gap-4 md:gap-6">
					{c.imageLeft && (
						<motion.div
							className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl mt-10"
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-80px" }}
							transition={{ duration: 0.7 }}>
							<Image src={c.imageLeft} alt={c.imageLeftAlt || ""} fill sizes="(max-width: 1024px) 45vw, 25vw" className="object-cover" />
						</motion.div>
					)}
					{c.imageRight && (
						<motion.div
							className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl"
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-80px" }}
							transition={{ delay: 0.15, duration: 0.7 }}>
							<Image src={c.imageRight} alt={c.imageRightAlt || ""} fill sizes="(max-width: 1024px) 45vw, 25vw" className="object-cover" />
						</motion.div>
					)}
				</div>

				{/* Quote */}
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7 }}>
					<span className="text-[var(--color-secondary)] text-6xl leading-none font-serif">&ldquo;</span>
					<blockquote className="text-2xl md:text-4xl font-medium text-[var(--color-dark)] leading-snug italic whitespace-pre-line">
						{c.quote}
					</blockquote>
					{c.text && (
						<p className="mt-6 text-gray-600 text-base md:text-lg leading-relaxed">
							{c.text}
						</p>
					)}
					<div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
				</motion.div>
			</div>
		</section>
	);
}

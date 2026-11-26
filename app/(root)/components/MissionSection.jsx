"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useContent } from "@/components/SiteContentProvider";
import { contentIcon } from "@/lib/content/icons";

export default function MissionSection() {
	const c = useContent("home.mission");
	if (!c) return null;

	return (
		<section id="about" className="py-20 md:py-28 bg-white scroll-mt-20">
			<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
				{/* Images */}
				<motion.div
					className="relative"
					initial={{ opacity: 0, x: -50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7 }}>
					{c.image && (
						<div className="relative aspect-[4/5] max-w-md rounded-3xl overflow-hidden shadow-2xl">
							<Image src={c.image} alt={c.imageAlt || ""} fill sizes="(max-width: 1024px) 90vw, 40vw" className="object-cover" />
						</div>
					)}
					{c.imageOverlay && (
						<motion.div
							className="absolute -bottom-8 -right-2 md:right-6 w-40 md:w-52 aspect-square rounded-2xl overflow-hidden border-8 border-white shadow-xl"
							initial={{ opacity: 0, scale: 0.8 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.3, duration: 0.6 }}>
							<Image src={c.imageOverlay} alt={c.imageOverlayAlt || ""} fill sizes="220px" className="object-cover" />
						</motion.div>
					)}
					<div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl bg-[var(--color-secondary)]/15 -z-10" />
				</motion.div>

				{/* Text */}
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7 }}>
					{c.eyebrow && (
						<span className="text-[var(--color-secondary)] text-xs md:text-sm font-bold uppercase tracking-[0.3em]">
							{c.eyebrow}
						</span>
					)}
					<h2 className="mt-3 text-3xl md:text-5xl font-bold text-[var(--color-dark)] leading-tight">
						{c.title}
					</h2>
					{c.text && (
						<p className="mt-6 text-gray-600 text-base md:text-lg leading-relaxed">
							{c.text}
						</p>
					)}

					<div className="mt-8 space-y-5">
						{(c.features || []).map((f, i) => (
							<motion.div
								key={`${f.title}-${i}`}
								className="flex gap-4 items-start"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.15 * i, duration: 0.5 }}>
								<span className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center shadow-md">
									<FontAwesomeIcon icon={contentIcon(f.icon)} />
								</span>
								<div>
									<h3 className="font-bold text-[var(--color-dark)]">{f.title}</h3>
									<p className="text-sm text-gray-600 leading-relaxed mt-1">{f.text}</p>
								</div>
							</motion.div>
						))}
					</div>

					{c.cta?.href && (
						<Link
							href={c.cta.href}
							className="mt-8 inline-block rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-secondary)] transition-colors duration-300">
							{c.cta.label}
						</Link>
					)}
				</motion.div>
			</div>
		</section>
	);
}

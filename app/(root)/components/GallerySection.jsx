"use client";
import { motion } from "framer-motion";
import Image from "next/image";

import { useContent } from "@/components/SiteContentProvider";

export default function GallerySection() {
	const c = useContent("home.gallery");
	if (!c) return null;
	const images = c.images || [];

	return (
		<section className="py-16 md:py-20 bg-[var(--color-navy)] overflow-hidden">
			<div className="mx-auto max-w-7xl px-6 md:px-8 mb-10">
				<motion.h2
					className="text-white text-3xl md:text-4xl font-bold"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}>
					{c.title}
				</motion.h2>
				{c.subtitle && (
					<motion.p
						className="text-white/60 mt-2 text-sm md:text-base"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}>
						{c.subtitle}
					</motion.p>
				)}
			</div>
			<div className="flex gap-4 md:gap-6 px-6 md:px-8 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:thin]">
				{images.map((img, i) => (
					<motion.div
						key={`${img.url}-${i}`}
						className="relative shrink-0 w-72 md:w-96 aspect-[4/3] rounded-2xl overflow-hidden snap-start group"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: i * 0.08, duration: 0.5 }}>
						<Image
							src={img.url}
							alt={img.alt || ""}
							fill
							sizes="(max-width: 768px) 288px, 384px"
							className="object-cover group-hover:scale-105 transition-transform duration-700"
						/>
						{img.caption && (
							<span className="absolute bottom-0 inset-x-0 px-4 py-2 text-xs text-white bg-gradient-to-t from-black/60 to-transparent">
								{img.caption}
							</span>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					</motion.div>
				))}
			</div>
		</section>
	);
}

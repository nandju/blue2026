"use client";
import { motion } from "framer-motion";
import Image from "next/image";

import g1 from "@/public/ong_blue/images/illustrations/page-landing/action_1.jpg";
import g2 from "@/public/ong_blue/images/illustrations/page-landing/action_2.jpg";
import g3 from "@/public/ong_blue/images/illustrations/page-landing/action_4.jpg";
import g4 from "@/public/ong_blue/images/illustrations/page-landing/testimonials/ocean-cleanup-volunteers-collecting-plastic-waste-.jpg";
import g5 from "@/public/ong_blue/images/illustrations/page-landing/testimonials/volunteers-beach-cleanup-teamwork-ocean-conservat.jpg";

const IMAGES = [
	{ src: g1, alt: "Action de collecte BLUE" },
	{ src: g2, alt: "Nettoyage communautaire" },
	{ src: g3, alt: "Sensibilisation environnementale" },
	{ src: g4, alt: "Collecte de déchets plastiques" },
	{ src: g5, alt: "Bénévoles sur la plage" },
];

export default function GallerySection() {
	return (
		<section className="py-16 md:py-20 bg-[#062E52] overflow-hidden">
			<div className="mx-auto max-w-7xl px-6 md:px-8 mb-10">
				<motion.h2
					className="text-white text-3xl md:text-4xl font-bold"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}>
					Notre Galerie
				</motion.h2>
				<motion.p
					className="text-white/60 mt-2 text-sm md:text-base"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}>
					Nos actions sur le terrain, en images.
				</motion.p>
			</div>
			<div className="flex gap-4 md:gap-6 px-6 md:px-8 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:thin]">
				{IMAGES.map((img, i) => (
					<motion.div
						key={i}
						className="relative shrink-0 w-72 md:w-96 aspect-[4/3] rounded-2xl overflow-hidden snap-start group"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: i * 0.08, duration: 0.5 }}>
						<Image
							src={img.src}
							alt={img.alt}
							fill
							sizes="(max-width: 768px) 288px, 384px"
							className="object-cover group-hover:scale-105 transition-transform duration-700"
							placeholder="blur"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#062E52]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					</motion.div>
				))}
			</div>
		</section>
	);
}

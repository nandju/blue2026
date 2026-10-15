"use client";
import { motion } from "framer-motion";
import Image from "next/image";

import Left from "@/public/ong_blue/images/illustrations/page-landing/testimonials/marine-conservation-team.jpg";
import Right from "@/public/ong_blue/images/illustrations/page-landing/testimonials/coastal-cleanup-group.jpg";

export default function QuoteSection() {
	return (
		<section className="py-20 md:py-28 bg-white">
			<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
				{/* Photo duo */}
				<div className="grid grid-cols-2 gap-4 md:gap-6">
					<motion.div
						className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl mt-10"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.7 }}>
						<Image src={Left} alt="Équipe de conservation marine" fill sizes="(max-width: 1024px) 45vw, 25vw" className="object-cover" placeholder="blur" />
					</motion.div>
					<motion.div
						className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ delay: 0.15, duration: 0.7 }}>
						<Image src={Right} alt="Groupe de nettoyage côtier" fill sizes="(max-width: 1024px) 45vw, 25vw" className="object-cover" placeholder="blur" />
					</motion.div>
				</div>

				{/* Quote */}
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7 }}>
					<span className="text-[#0DBD9F] text-6xl leading-none font-serif">&ldquo;</span>
					<blockquote className="text-2xl md:text-4xl font-medium text-[#073A63] leading-snug italic">
						Pour la nature. Pour les peuples.
						Pour les générations à venir.
					</blockquote>
					<p className="mt-6 text-gray-600 text-base md:text-lg leading-relaxed">
						Chaque geste compte. En rejoignant BLUE, vous faites partie d&apos;une
						communauté qui transforme la lutte contre la pollution plastique en
						actions concrètes — sur les plages, dans les écoles et auprès des
						populations.
					</p>
					<div className="mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F]" />
				</motion.div>
			</div>
		</section>
	);
}

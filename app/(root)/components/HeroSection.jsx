"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import Poster from "@/public/ong_blue/images/illustrations/page-landing/ocean-conservation-initiative-blue.jpg";

export default function HeroSection() {
	return (
		<section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
			{/* Video background */}
			<video
				className="absolute inset-0 w-full h-full object-cover"
				src="/ong_blue/videos/ocean-waves-drone.mp4"
				poster={Poster.src}
				autoPlay
				muted
				loop
				playsInline
				preload="metadata"
				aria-hidden="true"
			/>
			{/* Overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-[#062E52]/75 via-[#0D6EBB]/35 to-[#062E52]/80" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
				<motion.span
					className="inline-block text-[#0DBD9F] text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.7 }}>
					ONG Environnementale · Abidjan, Côte d&apos;Ivoire
				</motion.span>
				<motion.h1
					className="text-white text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.08]"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.45, duration: 0.8 }}>
					Pour les Océans.
					<br />
					Pour les Hommes.
					<br />
					<span className="text-[#0DBD9F]">Pour les Générations Futures.</span>
				</motion.h1>
				<motion.p
					className="mt-6 text-white/85 text-base md:text-xl leading-relaxed max-w-2xl mx-auto"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.65, duration: 0.7 }}>
					Depuis janvier 2022, BLUE mobilise citoyens et communautés pour lutter
					contre la pollution plastique et protéger l&apos;environnement en Côte d&apos;Ivoire.
				</motion.p>
				<motion.div
					className="mt-10 flex flex-wrap items-center justify-center gap-4"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8, duration: 0.7 }}>
					<Link
						href="/benevolat"
						className="rounded-full bg-[#0DBD9F] px-8 py-3.5 text-sm md:text-base font-semibold text-white shadow-xl hover:bg-white hover:text-[#0D6EBB] transition-all duration-300">
						Devenir bénévole
					</Link>
					<Link
						href="/projects"
						className="rounded-full border-2 border-white/70 px-8 py-3.5 text-sm md:text-base font-semibold text-white hover:bg-white hover:text-[#0D6EBB] transition-all duration-300">
						Découvrir nos actions
					</Link>
				</motion.div>
			</div>

			{/* Scroll indicator */}
			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.4, duration: 0.8 }}>
				<span className="text-[10px] uppercase tracking-[4px] text-white/80 font-medium">
					Défiler
				</span>
				<motion.div
					className="w-[1.5px] h-14 bg-white/80 origin-top"
					animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
					transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
				/>
			</motion.div>
		</section>
	);
}

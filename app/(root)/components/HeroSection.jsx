"use client";
import { motion } from "framer-motion";
import Link from "next/link";

import { useContent } from "@/components/SiteContentProvider";
import { parseVideoUrl } from "@/lib/uploadLimits";

export default function HeroSection() {
	const hero = useContent("home.hero");
	if (!hero) return null;

	const external = hero.video ? parseVideoUrl(hero.video) : null;

	return (
		<section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
			{/* Video background : fichier téléversé ou lien YouTube/Vimeo */}
			{external ? (
				<iframe
					className="absolute inset-0 w-full h-full object-cover pointer-events-none"
					src={`${external.embedUrl}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1${external.provider === "youtube" ? `&playlist=${external.id}` : ""}`}
					title="Vidéo de fond BLUE"
					allow="autoplay; encrypted-media; picture-in-picture"
					aria-hidden="true"
					tabIndex={-1}
				/>
			) : hero.video ? (
				<video
					className="absolute inset-0 w-full h-full object-cover"
					src={hero.video}
					poster={hero.poster || undefined}
					autoPlay
					muted
					loop
					playsInline
					preload="metadata"
					aria-hidden="true"
				/>
			) : hero.poster ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={hero.poster} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
			) : null}
			{/* Overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/75 via-[var(--color-primary)]/35 to-[var(--color-navy)]/80" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
				{hero.eyebrow && (
					<motion.span
						className="inline-block text-[var(--color-secondary)] text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.7 }}>
						{hero.eyebrow}
					</motion.span>
				)}
				<motion.h1
					className="text-white text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.08]"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.45, duration: 0.8 }}>
					{hero.titleLine1}
					{hero.titleLine2 && <br />}
					{hero.titleLine2}
					{hero.titleLine3 && (
						<>
							<br />
							<span className="text-[var(--color-secondary)]">{hero.titleLine3}</span>
						</>
					)}
				</motion.h1>
				{hero.subtitle && (
					<motion.p
						className="mt-6 text-white/85 text-base md:text-xl leading-relaxed max-w-2xl mx-auto"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.65, duration: 0.7 }}>
						{hero.subtitle}
					</motion.p>
				)}
				{hero.buttons?.length > 0 && (
					<motion.div
						className="mt-10 flex flex-wrap items-center justify-center gap-4"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.7 }}>
						{hero.buttons.map((b, i) =>
							b?.href ? (
								<Link
									key={i}
									href={b.href}
									className={`rounded-full px-8 py-3.5 text-sm md:text-base font-semibold transition-all duration-300 ${
										b.variant === "secondary"
											? "border-2 border-white/70 text-white hover:bg-white hover:text-[var(--color-primary)]"
											: "bg-[var(--color-secondary)] text-white shadow-xl hover:bg-white hover:text-[var(--color-primary)]"
									}`}>
									{b.label}
								</Link>
							) : null
						)}
					</motion.div>
				)}
			</div>

			{/* Scroll indicator */}
			{hero.scrollHint && (
				<motion.div
					className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.4, duration: 0.8 }}>
					<span className="text-[10px] uppercase tracking-[4px] text-white/80 font-medium">
						{hero.scrollHint}
					</span>
					<motion.div
						className="w-[1.5px] h-14 bg-white/80 origin-top"
						animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
					/>
				</motion.div>
			)}
		</section>
	);
}

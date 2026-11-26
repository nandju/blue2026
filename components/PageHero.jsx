"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function PageHero({ image, eyebrow, title, description, children }) {
	return (
		<section className="relative min-h-[62vh] flex items-end overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0">
				<Image
					src={image}
					alt=""
					fill
					priority
					sizes="100vw"
					className="object-cover"
					{...(typeof image === "string" ? {} : { placeholder: "blur" })}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/70 via-[var(--color-primary)]/45 to-[var(--color-navy)]/85" />
			</div>

			{/* Content */}
			<div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8 pb-16 pt-40">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: "easeOut" }}>
					{eyebrow && (
						<span className="inline-block text-[var(--color-secondary)] text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-4">
							{eyebrow}
						</span>
					)}
					<h1 className="text-white text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
						{title}
					</h1>
					{description && (
						<p className="mt-5 text-white/80 text-base md:text-lg leading-relaxed max-w-2xl">
							{description}
						</p>
					)}
					{children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
				</motion.div>
			</div>
		</section>
	);
}

export function HeroButton({ href, children, variant = "primary", external = false }) {
	const cls =
		variant === "primary"
			? "bg-[var(--color-secondary)] text-white hover:bg-white hover:text-[var(--color-primary)]"
			: "border-2 border-white/70 text-white hover:bg-white hover:text-[var(--color-primary)]";
	const inner = (
		<span className={`inline-block rounded-full px-7 py-3 text-sm font-semibold transition-all duration-300 shadow-lg ${cls}`}>
			{children}
		</span>
	);
	return external ? (
		<a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
	) : (
		<Link href={href}>{inner}</Link>
	);
}

"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
	faShirt,
	faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import { useContent } from "@/components/SiteContentProvider";
import { contentIcon } from "@/lib/content/icons";

export default function BenevolatPage() {
	const c = useContent("benevolat") || {};
	const zones = useContent("shared.zones.list") || [];
	const { hero = {}, fields = {}, steps = {}, zones: zonesSec = {}, mrblue = {} } = c;

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={hero.image}
				eyebrow={hero.eyebrow}
				title={hero.title}
				description={hero.description}>
				{(hero.buttons || []).map((b, i) =>
					b?.href ? (
						<HeroButton key={i} href={b.href} variant={b.variant} external={!b.href.startsWith("/") && !b.href.startsWith("#")}>
							{b.label}
						</HeroButton>
					) : null
				)}
			</PageHero>

			{/* Pourquoi */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={fields.eyebrow}
						title={fields.title}
						description={fields.description}
					/>
					<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{(fields.items || []).map((f, i) => (
							<motion.div
								key={`${f.title}-${i}`}
								className="bg-[#f4f9fd] rounded-3xl border border-[var(--color-primary)]/10 p-7 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.08, duration: 0.5 }}>
								<span className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-xl">
									<FontAwesomeIcon icon={contentIcon(f.icon)} />
								</span>
								<h3 className="mt-4 font-bold text-[var(--color-dark)]">{f.title}</h3>
								<p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.text}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Étapes */}
			<section className="py-20 md:py-28 bg-[var(--color-navy)]">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={steps.eyebrow}
						title={steps.title}
						description={steps.description}
						dark
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{(steps.items || []).map((s, i) => (
							<motion.div
								key={`${s.num}-${i}`}
								className="relative bg-white/8 border border-white/10 rounded-3xl p-7 backdrop-blur-sm"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="text-5xl font-extrabold text-[var(--color-secondary)]/40">{s.num}</span>
								<h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
								<p className="mt-2 text-sm text-white/70 leading-relaxed">{s.text}</p>
							</motion.div>
						))}
					</div>
					{steps.transparency && (
						<motion.div
							className="mt-10 bg-white/8 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}>
							<FontAwesomeIcon icon={faShirt} className="text-[var(--color-secondary)] text-2xl shrink-0" />
							<p className="text-white/80 text-sm leading-relaxed">{steps.transparency}</p>
						</motion.div>
					)}
				</div>
			</section>

			{/* Zones WhatsApp */}
			<section id="zones" className="py-20 md:py-28 bg-white scroll-mt-20">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={zonesSec.eyebrow}
						title={zonesSec.title}
						description={zonesSec.description}
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
						{zones.map((z, i) => (
							<motion.a
								key={`${z.name}-${i}`}
								href={z.link}
								target="_blank"
								rel="noopener noreferrer"
								className="group rounded-3xl border-2 border-[var(--color-primary)]/10 bg-[#f4f9fd] p-8 hover:border-[#25D366]/40 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="inline-flex w-14 h-14 rounded-2xl bg-[#25D366] text-white items-center justify-center text-3xl shadow-lg">
									<FontAwesomeIcon icon={faWhatsapp} />
								</span>
								<h3 className="mt-5 text-xl font-bold text-[var(--color-dark)]">{z.name}</h3>
								<p className="mt-2 text-sm text-gray-600 leading-relaxed">{z.areas}</p>
								<span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#25D366]">
									<FontAwesomeIcon icon={faCircleCheck} />
									{zonesSec.ctaLabel || "Rejoindre le groupe officiel →"}
								</span>
							</motion.a>
						))}
					</div>
				</div>
			</section>

			{/* MR BLUE */}
			<section className="py-16 bg-[#f4f9fd] border-t border-[var(--color-primary)]/10">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						<p className="text-4xl mb-4">💬</p>
						<h2 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)]">
							{mrblue.title}
						</h2>
						{mrblue.text && (
							<p className="mt-4 text-gray-600 leading-relaxed">{mrblue.text}</p>
						)}
						{mrblue.cta?.href && (
							<Link
								href={mrblue.cta.href}
								className="mt-7 inline-block rounded-full border-2 border-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
								{mrblue.cta.label}
							</Link>
						)}
					</motion.div>
				</div>
			</section>
		</main>
	);
}

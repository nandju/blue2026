"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import { useContent } from "@/components/SiteContentProvider";
import { contentIcon } from "@/lib/content/icons";

function Buttons({ buttons }) {
	return (buttons || []).map((b, i) =>
		b?.href ? (
			<HeroButton key={i} href={b.href} variant={b.variant} external={!b.href.startsWith("/")}>
				{b.label}
			</HeroButton>
		) : null
	);
}

export default function AboutPage() {
	const c = useContent("about") || {};
	const { hero = {}, story = {}, missionVision = {}, axes = {}, timeline = {}, team = {}, cta = {} } = c;

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={hero.image}
				eyebrow={hero.eyebrow}
				title={hero.title}
				description={hero.description}>
				<Buttons buttons={hero.buttons} />
			</PageHero>

			{/* Histoire */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.7 }}>
						{story.eyebrow && (
							<span className="text-[var(--color-secondary)] text-xs md:text-sm font-bold uppercase tracking-[0.3em]">
								{story.eyebrow}
							</span>
						)}
						<h2 className="mt-3 text-3xl md:text-5xl font-bold text-[var(--color-dark)] leading-tight">
							{story.title}
						</h2>
						<div className="mt-6 space-y-4 text-gray-600 text-base md:text-lg leading-relaxed">
							{(story.paragraphs || []).map((p, i) => (
								<p key={i}>{p}</p>
							))}
						</div>
					</motion.div>
					<motion.div
						className="relative"
						initial={{ opacity: 0, x: 40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.7 }}>
						{story.image && (
							<div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
								<Image src={story.image} alt={story.imageAlt || ""} fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
							</div>
						)}
						{story.imageOverlay && (
							<div className="absolute -bottom-6 -left-6 w-36 md:w-48 aspect-square rounded-2xl overflow-hidden border-8 border-white shadow-xl hidden sm:block">
								<Image src={story.imageOverlay} alt={story.imageOverlayAlt || ""} fill sizes="200px" className="object-cover" />
							</div>
						)}
					</motion.div>
				</div>
			</section>

			{/* Mission / Vision */}
			<section className="py-20 md:py-24 bg-[#f4f9fd]">
				<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
					{(missionVision.cards || []).map((card, i) => (
						<motion.div
							key={`${card.title}-${i}`}
							className="bg-white rounded-3xl border border-[var(--color-primary)]/10 p-8 md:p-10 shadow-sm"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.12, duration: 0.6 }}>
							<span className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-2xl shadow-md">
								<FontAwesomeIcon icon={contentIcon(card.icon)} />
							</span>
							<h3 className="mt-6 text-2xl font-bold text-[var(--color-dark)]">{card.title}</h3>
							<p className="mt-3 text-gray-600 leading-relaxed">{card.text}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Axes */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={axes.eyebrow}
						title={axes.title}
						description={axes.description}
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
						{(axes.items || []).map((a, i) => (
							<motion.div
								key={`${a.title}-${i}`}
								className="rounded-3xl bg-gradient-to-b from-white to-[#f4f9fd] border border-[var(--color-primary)]/10 p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="inline-flex w-16 h-16 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] items-center justify-center text-2xl">
									<FontAwesomeIcon icon={contentIcon(a.icon)} />
								</span>
								<h3 className="mt-5 text-xl font-bold text-[var(--color-dark)]">{a.title}</h3>
								<p className="mt-3 text-sm text-gray-600 leading-relaxed">{a.text}</p>
							</motion.div>
						))}
					</div>
					{/* Valeurs */}
					<motion.div
						className="mt-14 flex flex-wrap justify-center gap-3"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.6 }}>
						{(axes.values || []).map((v, i) => (
							<span
								key={`${v.name}-${i}`}
								className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-dark)]">
								<FontAwesomeIcon icon={contentIcon(v.icon)} className="text-[var(--color-secondary)]" />
								{v.name}
							</span>
						))}
					</motion.div>
				</div>
			</section>

			{/* Chronologie */}
			<section className="py-20 md:py-28 bg-[var(--color-navy)]">
				<div className="mx-auto max-w-5xl px-6 md:px-8">
					<SectionHeader
						eyebrow={timeline.eyebrow}
						title={timeline.title}
						dark
					/>
					<div className="mt-14 relative">
						<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/15 md:-translate-x-1/2" />
						{(timeline.items || []).map((t, i) => (
							<motion.div
								key={`${t.title}-${i}`}
								className={`relative flex md:w-1/2 mb-10 ${i % 2 === 0 ? "md:pr-12 md:justify-end" : "md:ml-auto md:pl-12"} pl-12 md:pl-0`}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ duration: 0.5 }}>
								<span className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--color-secondary)] border-4 border-[var(--color-navy)] left-[9px] md:left-auto ${i % 2 === 0 ? "md:-right-2" : "md:-left-2"}`} />
								<div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:max-w-md">
									<span className="text-[var(--color-secondary)] text-xs font-bold uppercase tracking-[0.25em]">{t.year}</span>
									<h3 className="mt-2 text-lg font-bold text-white">{t.title}</h3>
									<p className="mt-2 text-sm text-white/70 leading-relaxed">{t.text}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Équipe dirigeante */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={team.eyebrow}
						title={team.title}
						description={team.description}
					/>
					<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{(team.members || []).map((m, i) => (
							<motion.div
								key={`${m.name}-${i}`}
								className="bg-[#f4f9fd] rounded-3xl border border-[var(--color-primary)]/10 p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.08, duration: 0.5 }}>
								<span className="mx-auto flex w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-2xl font-extrabold shadow-md">
									{(m.name || "").split(" ").map((n) => n[0]).slice(0, 2).join("")}
								</span>
								<h3 className="mt-5 text-lg font-bold text-[var(--color-dark)]">{m.name}</h3>
								<p className="mt-1 text-sm text-[var(--color-secondary)] font-medium">{m.role}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 bg-[#f4f9fd]">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<motion.h2
						className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						{cta.title}
					</motion.h2>
					{cta.text && <p className="mt-4 text-gray-600">{cta.text}</p>}
					<div className="mt-8 flex flex-wrap justify-center gap-4">
						{(cta.buttons || []).map((b, i) =>
							b?.href ? (
								<Link
									key={i}
									href={b.href}
									className={`rounded-full px-8 py-3.5 text-sm font-semibold transition-colors shadow-lg ${
										b.variant === "secondary"
											? "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
											: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
									}`}>
									{b.label}
								</Link>
							) : null
						)}
					</div>
				</div>
			</section>
		</main>
	);
}

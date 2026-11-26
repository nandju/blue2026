"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEnvelope,
	faPhone,
} from "@fortawesome/free-solid-svg-icons";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import { useContent, useSiteSettings } from "@/components/SiteContentProvider";
import { contentIcon } from "@/lib/content/icons";

export default function PartenairesPage() {
	const c = useContent("partenaires") || {};
	const { contact = {} } = useSiteSettings();
	const { hero = {}, types = {}, partners = {}, cta = {} } = c;

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const list = partners.list || [];

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={hero.image}
				eyebrow={hero.eyebrow}
				title={hero.title}
				description={hero.description}>
				{(hero.buttons || []).map((b, i) =>
					b?.href ? (
						<HeroButton key={i} href={b.href} variant={b.variant} external={!b.href.startsWith("/")}>
							{b.label}
						</HeroButton>
					) : null
				)}
			</PageHero>

			{/* Types de partenariat */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={types.eyebrow}
						title={types.title}
						description={types.description}
					/>
					<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{(types.items || []).map((p, i) => (
							<motion.div
								key={`${p.title}-${i}`}
								className="bg-[#f4f9fd] rounded-3xl border border-[var(--color-primary)]/10 p-7 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.08, duration: 0.5 }}>
								<span className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-xl">
									<FontAwesomeIcon icon={contentIcon(p.icon)} />
								</span>
								<h3 className="mt-4 font-bold text-[var(--color-dark)]">{p.title}</h3>
								<p className="mt-2 text-sm text-gray-600 leading-relaxed">{p.text}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Logos des partenaires */}
			<section className="py-20 md:py-24 bg-[#f4f9fd]">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={partners.eyebrow}
						title={partners.title}
						description={partners.description}
					/>
					{list.length > 0 ? (
						<div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
							{list.map((p, i) => (
								<div key={`${p.name}-${i}`} className="bg-white rounded-2xl border border-[var(--color-primary)]/10 p-6 flex items-center justify-center">
									{p.logo ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={p.logo} alt={p.name} className="max-h-16 object-contain" />
									) : (
										p.name
									)}
								</div>
							))}
						</div>
					) : (
						<motion.div
							className="mt-12 mx-auto max-w-2xl bg-white rounded-3xl border border-dashed border-[var(--color-primary)]/30 p-10 text-center"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}>
							<p className="text-4xl mb-4">{partners.emptyIcon || "🤝"}</p>
							<h3 className="text-xl font-bold text-[var(--color-dark)]">
								{partners.emptyTitle}
							</h3>
							<p className="mt-3 text-sm text-gray-600 leading-relaxed">
								{partners.emptyText}
							</p>
							<div className="mt-6 flex flex-wrap justify-center gap-3">
								{contact.email && (
									<a
										href={`mailto:${contact.email}?subject=Proposition%20de%20partenariat%20BLUE&body=Bonjour%20BLUE%2C`}
										className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
										<FontAwesomeIcon icon={faEnvelope} />
										{contact.email}
									</a>
								)}
								{contact.phones?.[0] && (
									<a
										href={`tel:${contact.phones[0].replace(/\s/g, "")}`}
										className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
										<FontAwesomeIcon icon={faPhone} />
										{contact.phones[0]}
									</a>
								)}
							</div>
						</motion.div>
					)}
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 bg-white">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<motion.h2
						className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						{cta.title}
					</motion.h2>
					{cta.text && <p className="mt-4 text-gray-600">{cta.text}</p>}
					{cta.button?.href && (
						<Link
							href={cta.button.href}
							className="mt-8 inline-block rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-secondary)] transition-colors">
							{cta.button.label}
						</Link>
					)}
				</div>
			</section>
		</main>
	);
}

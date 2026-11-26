"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebookF,
	faInstagram,
	faLinkedinIn,
	faWhatsapp,
	faTiktok,
	faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
	faPhone,
	faEnvelope,
	faLocationDot,
	faComments,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import { useContent, useSiteSettings } from "@/components/SiteContentProvider";

const SOCIAL_ICONS = {
	facebook: faFacebookF,
	instagram: faInstagram,
	linkedin: faLinkedinIn,
	whatsapp: faWhatsapp,
	tiktok: faTiktok,
	youtube: faYoutube,
};

export default function ContactPage() {
	const c = useContent("contact") || {};
	const { contact = {}, socials = {} } = useSiteSettings();
	const { hero = {}, channels = {}, recruit = {}, mrblue = {} } = c;

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const phones = (contact.phones || []).filter(Boolean);
	const cards = [
		phones.length > 0 && {
			icon: faPhone,
			title: "Téléphone",
			lines: phones.map((p) => ({ label: p, href: `tel:${p.replace(/\s/g, "")}` })),
		},
		contact.email && {
			icon: faEnvelope,
			title: "Email",
			lines: [{ label: contact.email, href: `mailto:${contact.email}` }],
		},
		contact.address && {
			icon: faLocationDot,
			title: "Localisation",
			lines: [{ label: contact.address }],
		},
	].filter(Boolean);

	const socialLinks = Object.entries(SOCIAL_ICONS)
		.map(([key, icon]) => ({ icon, label: key[0].toUpperCase() + key.slice(1), href: socials[key] }))
		.filter((s) => s.href);

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

			{/* Coordonnées */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={channels.eyebrow}
						title={channels.title}
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
						{cards.map((card, i) => (
							<motion.div
								key={card.title}
								className="bg-[#f4f9fd] rounded-3xl border border-[var(--color-primary)]/10 p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="mx-auto inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-xl shadow-md">
									<FontAwesomeIcon icon={card.icon} />
								</span>
								<h3 className="mt-5 text-lg font-bold text-[var(--color-dark)]">{card.title}</h3>
								<div className="mt-3 space-y-1">
									{card.lines.map((l) =>
										l.href ? (
											<a key={l.label} href={l.href} className="block text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">
												{l.label}
											</a>
										) : (
											<p key={l.label} className="text-sm text-gray-600">{l.label}</p>
										)
									)}
								</div>
							</motion.div>
						))}
					</div>

					{/* Réseaux sociaux */}
					{socialLinks.length > 0 && (
						<motion.div
							className="mt-12 text-center"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}>
							<p className="text-sm text-gray-500 mb-5">{channels.socialsIntro}</p>
							<div className="flex justify-center gap-4 flex-wrap">
								{socialLinks.map((s) => (
									<a
										key={s.label}
										href={s.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={s.label}
										className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg hover:bg-[var(--color-secondary)] hover:scale-110 transition-all duration-300 shadow-md">
										<FontAwesomeIcon icon={s.icon} />
									</a>
								))}
							</div>
						</motion.div>
					)}
				</div>
			</section>

			{/* Rejoindre BLUE via la page Recrutement */}
			<section className="py-20 md:py-24 bg-[#f4f9fd]">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow={recruit.eyebrow}
						title={recruit.title}
						description={recruit.description}
					/>
					<motion.div
						className="mt-12 max-w-2xl mx-auto bg-white rounded-3xl border border-[var(--color-primary)]/10 p-8 text-center"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-60px" }}
						transition={{ duration: 0.5 }}>
						{recruit.cta?.href && (
							<Link
								href={recruit.cta.href}
								className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-3 text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
								{recruit.cta.label}
								<FontAwesomeIcon icon={faArrowRight} />
							</Link>
						)}
					</motion.div>
				</div>
			</section>

			{/* MR BLUE */}
			<section className="py-16 bg-white border-t border-[var(--color-primary)]/10">
				<div className="mx-auto max-w-3xl px-6 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						<span className="mx-auto inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white items-center justify-center text-2xl shadow-md">
							<FontAwesomeIcon icon={faComments} />
						</span>
						<h2 className="mt-5 text-2xl md:text-3xl font-bold text-[var(--color-dark)]">
							{mrblue.title}
						</h2>
						{mrblue.text && (
							<p className="mt-4 text-gray-600 leading-relaxed">{mrblue.text}</p>
						)}
					</motion.div>
				</div>
			</section>
		</main>
	);
}

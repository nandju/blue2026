"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebookF,
	faInstagram,
	faLinkedinIn,
	faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
	faPhone,
	faEnvelope,
	faLocationDot,
	faComments,
} from "@fortawesome/free-solid-svg-icons";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";

import HeroImg from "@/public/ong_blue/images/illustrations/page-landing/ocean-conservation-initiative-blue.jpg";

const CONTACTS = [
	{
		icon: faPhone,
		title: "Téléphone",
		lines: [
			{ label: "+225 07 78 06 09 61", href: "tel:+2250778060961" },
			{ label: "+225 07 09 61 13 41", href: "tel:+2250709611341" },
		],
	},
	{
		icon: faEnvelope,
		title: "Email",
		lines: [{ label: "blue@bluemakers.net", href: "mailto:blue@bluemakers.net" }],
	},
	{
		icon: faLocationDot,
		title: "Localisation",
		lines: [{ label: "Abidjan, Côte d'Ivoire" }],
	},
];

const SOCIALS = [
	{ href: "https://www.facebook.com/bluemakers", icon: faFacebookF, label: "Facebook" },
	{ href: "https://www.instagram.com/bluemakers", icon: faInstagram, label: "Instagram" },
	{ href: "https://www.linkedin.com/company/bluemakers", icon: faLinkedinIn, label: "LinkedIn" },
];

const ZONES = [
	{
		name: "Abidjan Nord",
		areas: "Cocody · Yopougon · Abobo · Attécoubé · Anyama · Plateau · Bingerville",
		link: "https://chat.whatsapp.com/CTyNHv6t1VJ22htKymlt4w",
	},
	{
		name: "Abidjan Sud",
		areas: "Marcory · Treichville · Koumassi · Port-Bouët",
		link: "https://chat.whatsapp.com/Cl0LSqe35hBFjuLPPV13nm",
	},
	{
		name: "Intérieur du pays",
		areas: "Toutes les autres villes et localités",
		link: "https://chat.whatsapp.com/DEAAJI4DLZB33aFQr0VJzf",
	},
];

export default function ContactPage() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={HeroImg}
				eyebrow="Contact"
				title="Parlons de l'environnement, ensemble"
				description="Une question, un partenariat, une proposition d'action ? L'équipe BLUE est à votre écoute.">
				<HeroButton href="mailto:blue@bluemakers.net?subject=Contact%20depuis%20le%20site%20BLUE&body=Bonjour%20BLUE%2C" external>
					Écrire un email
				</HeroButton>
				<HeroButton href="tel:+2250778060961" variant="secondary" external>
					Appeler BLUE
				</HeroButton>
			</PageHero>

			{/* Coordonnées */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Coordonnées"
						title="Nos canaux officiels"
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
						{CONTACTS.map((c, i) => (
							<motion.div
								key={c.title}
								className="bg-[#f4f9fd] rounded-3xl border border-[#0D6EBB]/10 p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="mx-auto inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white items-center justify-center text-xl shadow-md">
									<FontAwesomeIcon icon={c.icon} />
								</span>
								<h3 className="mt-5 text-lg font-bold text-[#073A63]">{c.title}</h3>
								<div className="mt-3 space-y-1">
									{c.lines.map((l) =>
										l.href ? (
											<a key={l.label} href={l.href} className="block text-sm text-gray-600 hover:text-[#0D6EBB] transition-colors">
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
					<motion.div
						className="mt-12 text-center"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}>
						<p className="text-sm text-gray-500 mb-5">Suivez nos actions sur les réseaux</p>
						<div className="flex justify-center gap-4">
							{SOCIALS.map((s) => (
								<a
									key={s.label}
									href={s.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={s.label}
									className="w-12 h-12 rounded-full bg-[#0D6EBB] text-white flex items-center justify-center text-lg hover:bg-[#0DBD9F] hover:scale-110 transition-all duration-300 shadow-md">
									<FontAwesomeIcon icon={s.icon} />
								</a>
							))}
						</div>
					</motion.div>
				</div>
			</section>

			{/* Groupes WhatsApp */}
			<section className="py-20 md:py-24 bg-[#f4f9fd]">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Communautés"
						title="Nos groupes WhatsApp par zone"
						description="Pour rejoindre la communauté et être informé des activités près de chez vous, choisissez votre zone."
					/>
					<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
						{ZONES.map((z, i) => (
							<motion.a
								key={z.name}
								href={z.link}
								target="_blank"
								rel="noopener noreferrer"
								className="group bg-white rounded-3xl border border-[#0D6EBB]/10 p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="inline-flex w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] items-center justify-center text-2xl">
									<FontAwesomeIcon icon={faWhatsapp} />
								</span>
								<h3 className="mt-4 text-lg font-bold text-[#073A63]">{z.name}</h3>
								<p className="mt-2 text-sm text-gray-600 leading-relaxed">{z.areas}</p>
								<span className="mt-4 inline-block text-sm font-semibold text-[#0D6EBB] group-hover:text-[#0DBD9F] transition-colors">
									Rejoindre →
								</span>
							</motion.a>
						))}
					</div>
				</div>
			</section>

			{/* MR BLUE */}
			<section className="py-16 bg-white border-t border-[#0D6EBB]/10">
				<div className="mx-auto max-w-3xl px-6 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						<span className="mx-auto inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white items-center justify-center text-2xl shadow-md">
							<FontAwesomeIcon icon={faComments} />
						</span>
						<h2 className="mt-5 text-2xl md:text-3xl font-bold text-[#073A63]">
							Réponse immédiate avec MR BLUE
						</h2>
						<p className="mt-4 text-gray-600 leading-relaxed">
							Notre assistant conversationnel répond instantanément à vos questions
							sur BLUE, le bénévolat et nos formations. Retrouvez-le en bas à droite
							de votre écran.
						</p>
					</motion.div>
				</div>
			</section>
		</main>
	);
}

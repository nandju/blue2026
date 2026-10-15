"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
	faBroom,
	faSeedling,
	faChalkboardUser,
	faShirt,
	faCircleCheck,
	faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";

import HeroImg from "@/public/ong_blue/images/illustrations/page-landing/testimonials/volunteers-beach-cleanup-teamwork-ocean-conservat.jpg";

const STEPS = [
	{
		num: "01",
		title: "Rejoignez votre groupe WhatsApp",
		text: "Choisissez le groupe officiel correspondant à votre zone de résidence pour être informé des prochaines activités.",
	},
	{
		num: "02",
		title: "Participez aux activités",
		text: "Nettoyages de plages et de lagunes, plantations d'arbres, sensibilisations : les actions sont annoncées dans les groupes.",
	},
	{
		num: "03",
		title: "Procurez-vous le T-shirt officiel",
		text: "Le T-shirt BLUE est proposé à 5 000 FCFA. Il vous identifie lors des actions et soutient l'organisation.",
	},
	{
		num: "04",
		title: "Devenez bénévole actif",
		text: "Participez à au moins deux activités officielles pour être reconnu comme bénévole actif de la communauté BLUE.",
	},
];

const FIELDS = [
	{ icon: faBroom, title: "Nettoyages & collectes", text: "Plages, lagunes et espaces publics : collecte et tri des déchets plastiques." },
	{ icon: faSeedling, title: "Plantations d'arbres", text: "Sessions de reforestation avec suivi des arbres plantés." },
	{ icon: faChalkboardUser, title: "Sensibilisation", text: "Interventions dans les écoles et les communautés, ateliers éducatifs." },
	{ icon: faPeopleGroup, title: "Événements communautaires", text: "RECYCL'DAY, Journée Mondiale des Océans et autres mobilisations." },
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
		areas: "Toutes les autres villes et localités de Côte d'Ivoire",
		link: "https://chat.whatsapp.com/DEAAJI4DLZB33aFQr0VJzf",
	},
];

export default function BenevolatPage() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={HeroImg}
				eyebrow="Bénévolat"
				title="Devenez un BLUE Maker"
				description="Rejoignez une communauté de citoyens engagés qui agissent concrètement pour l'environnement, des plages d'Abidjan à l'intérieur du pays.">
				<HeroButton href="#zones">Choisir ma zone</HeroButton>
				<HeroButton href="/academy" variant="secondary">Me former d'abord</HeroButton>
			</PageHero>

			{/* Pourquoi */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="S'engager"
						title="Ce que font nos bénévoles"
						description="Le bénévolat chez BLUE, c'est de l'action réelle sur le terrain, aux côtés d'une équipe passionnée."
					/>
					<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{FIELDS.map((f, i) => (
							<motion.div
								key={f.title}
								className="bg-[#f4f9fd] rounded-3xl border border-[#0D6EBB]/10 p-7 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.08, duration: 0.5 }}>
								<span className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white items-center justify-center text-xl">
									<FontAwesomeIcon icon={f.icon} />
								</span>
								<h3 className="mt-4 font-bold text-[#073A63]">{f.title}</h3>
								<p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.text}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Étapes */}
			<section className="py-20 md:py-28 bg-[#062E52]">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Comment ça marche"
						title="Rejoindre BLUE en 4 étapes"
						description="Un parcours simple et transparent pour devenir bénévole actif."
						dark
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{STEPS.map((s, i) => (
							<motion.div
								key={s.num}
								className="relative bg-white/8 border border-white/10 rounded-3xl p-7 backdrop-blur-sm"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="text-5xl font-extrabold text-[#0DBD9F]/40">{s.num}</span>
								<h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
								<p className="mt-2 text-sm text-white/70 leading-relaxed">{s.text}</p>
							</motion.div>
						))}
					</div>
					<motion.div
						className="mt-10 bg-white/8 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}>
						<FontAwesomeIcon icon={faShirt} className="text-[#0DBD9F] text-2xl shrink-0" />
						<p className="text-white/80 text-sm leading-relaxed">
							<strong className="text-white">En toute transparence :</strong> le
							T-shirt officiel BLUE est proposé à <strong className="text-white">5 000 FCFA</strong> et
							l&apos;objectif pour être considéré comme bénévole actif est de participer à
							<strong className="text-white"> au moins deux activités</strong>. Aucune autre obligation n&apos;est requise.
						</p>
					</motion.div>
				</div>
			</section>

			{/* Zones WhatsApp */}
			<section id="zones" className="py-20 md:py-28 bg-white scroll-mt-20">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Étape 1"
						title="Choisissez votre groupe WhatsApp"
						description="Les groupes officiels organisent les actions par zone. Rejoignez celui qui correspond à votre lieu de résidence."
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
						{ZONES.map((z, i) => (
							<motion.a
								key={z.name}
								href={z.link}
								target="_blank"
								rel="noopener noreferrer"
								className="group rounded-3xl border-2 border-[#0D6EBB]/10 bg-[#f4f9fd] p-8 hover:border-[#25D366]/40 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="inline-flex w-14 h-14 rounded-2xl bg-[#25D366] text-white items-center justify-center text-3xl shadow-lg">
									<FontAwesomeIcon icon={faWhatsapp} />
								</span>
								<h3 className="mt-5 text-xl font-bold text-[#073A63]">{z.name}</h3>
								<p className="mt-2 text-sm text-gray-600 leading-relaxed">{z.areas}</p>
								<span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#25D366]">
									<FontAwesomeIcon icon={faCircleCheck} />
									Rejoindre le groupe officiel →
								</span>
							</motion.a>
						))}
					</div>
				</div>
			</section>

			{/* MR BLUE */}
			<section className="py-16 bg-[#f4f9fd] border-t border-[#0D6EBB]/10">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						<p className="text-4xl mb-4">💬</p>
						<h2 className="text-2xl md:text-3xl font-bold text-[#073A63]">
							Une question avant de vous lancer ?
						</h2>
						<p className="mt-4 text-gray-600 leading-relaxed">
							MR BLUE, notre assistant officiel, vous accompagne : il vous oriente
							vers le bon groupe selon votre localité et répond à toutes vos
							questions. Cliquez sur la bulle de discussion en bas à droite de
							l&apos;écran pour démarrer.
						</p>
						<Link
							href="/contact"
							className="mt-7 inline-block rounded-full border-2 border-[#0D6EBB] px-8 py-3 text-sm font-semibold text-[#0D6EBB] hover:bg-[#0D6EBB] hover:text-white transition-colors">
							Autres moyens de contact
						</Link>
					</motion.div>
				</div>
			</section>
		</main>
	);
}

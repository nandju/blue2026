"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBuildingColumns,
	faBuilding,
	faGraduationCap,
	faHandsHelping,
	faEnvelope,
	faPhone,
} from "@fortawesome/free-solid-svg-icons";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";

import HeroImg from "@/public/ong_blue/images/illustrations/page-landing/action_2.jpg";

const PARTNERSHIP_TYPES = [
	{
		icon: faBuildingColumns,
		title: "Partenariat institutionnel",
		text: "Collectivités, ministères et organismes publics : alignons nos actions avec les politiques environnementales nationales.",
	},
	{
		icon: faBuilding,
		title: "Partenariat privé",
		text: "Entreprises engagées (RSE) : financement d'actions, mécénat de compétences ou mobilisation de vos collaborateurs.",
	},
	{
		icon: faGraduationCap,
		title: "Partenariat éducatif",
		text: "Écoles, universités et centres de formation : accueillez nos programmes de sensibilisation et Blue Academy.",
	},
	{
		icon: faHandsHelping,
		title: "Partenariat associatif",
		text: "ONG et organisations de la société civile : mutualisons nos forces pour des actions de plus grande ampleur.",
	},
];

// Liste des partenaires officiels de BLUE.
// Les logos et fiches seront affichés ici dès que les informations
// (logo officiel, nom, description, nature de la collaboration, site web)
// auront été validées par l'organisation.
const PARTNERS = [];

export default function PartenairesPage() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={HeroImg}
				eyebrow="Partenaires"
				title="Ensemble, amplifions l'impact"
				description="Les actions de BLUE prennent leur ampleur grâce à la collaboration avec des acteurs institutionnels, privés, éducatifs et associatifs.">
				<HeroButton href="mailto:blue@bluemakers.net?subject=Proposition%20de%20partenariat%20BLUE&body=Bonjour%20BLUE%2C" external>
					Proposer un partenariat
				</HeroButton>
				<HeroButton href="/contact" variant="secondary">Nous contacter</HeroButton>
			</PageHero>

			{/* Types de partenariat */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Collaborer avec BLUE"
						title="Des formes de partenariat adaptées"
						description="Chaque partenaire contribue selon ses moyens : financement, logistique, expertise, relais de communication ou mobilisation de bénévoles."
					/>
					<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{PARTNERSHIP_TYPES.map((p, i) => (
							<motion.div
								key={p.title}
								className="bg-[#f4f9fd] rounded-3xl border border-[#0D6EBB]/10 p-7 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.08, duration: 0.5 }}>
								<span className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white items-center justify-center text-xl">
									<FontAwesomeIcon icon={p.icon} />
								</span>
								<h3 className="mt-4 font-bold text-[#073A63]">{p.title}</h3>
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
						eyebrow="Ils nous accompagnent"
						title="Nos partenaires"
						description="La liste officielle de nos partenaires est en cours de publication sur cette page."
					/>
					{PARTNERS.length > 0 ? (
						<div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
							{PARTNERS.map((p) => (
								<div key={p.name} className="bg-white rounded-2xl border border-[#0D6EBB]/10 p-6 flex items-center justify-center">
									{p.name}
								</div>
							))}
						</div>
					) : (
						<motion.div
							className="mt-12 mx-auto max-w-2xl bg-white rounded-3xl border border-dashed border-[#0D6EBB]/30 p-10 text-center"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}>
							<p className="text-4xl mb-4">🤝</p>
							<h3 className="text-xl font-bold text-[#073A63]">
								Votre organisation peut apparaître ici
							</h3>
							<p className="mt-3 text-sm text-gray-600 leading-relaxed">
								Cette section accueillera les logos et présentations des
								partenaires officiels de BLUE. Si votre organisation souhaite
								soutenir nos actions de lutte contre la pollution plastique,
								contactez-nous.
							</p>
							<div className="mt-6 flex flex-wrap justify-center gap-3">
								<a
									href="mailto:blue@bluemakers.net?subject=Proposition%20de%20partenariat%20BLUE&body=Bonjour%20BLUE%2C"
									className="inline-flex items-center gap-2 rounded-full bg-[#0D6EBB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0DBD9F] transition-colors">
									<FontAwesomeIcon icon={faEnvelope} />
									blue@bluemakers.net
								</a>
								<a
									href="tel:+2250778060961"
									className="inline-flex items-center gap-2 rounded-full border-2 border-[#0D6EBB] px-6 py-3 text-sm font-semibold text-[#0D6EBB] hover:bg-[#0D6EBB] hover:text-white transition-colors">
									<FontAwesomeIcon icon={faPhone} />
									+225 07 78 06 09 61
								</a>
							</div>
						</motion.div>
					)}
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 bg-white">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<motion.h2
						className="text-3xl md:text-4xl font-bold text-[#073A63]"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						Une idée de collaboration ?
					</motion.h2>
					<p className="mt-4 text-gray-600">
						Écrivez-nous ou appelez-nous : l&apos;équipe BLUE étudie chaque
						proposition avec attention.
					</p>
					<Link
						href="/contact"
						className="mt-8 inline-block rounded-full bg-[#0D6EBB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#0DBD9F] transition-colors">
						Voir toutes les coordonnées →
					</Link>
				</div>
			</section>
		</main>
	);
}

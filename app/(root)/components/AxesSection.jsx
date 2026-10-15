"use client";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faRecycle,
	faShieldHalved,
	faPeopleGroup,
	faHandshake,
	faLeaf,
	faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";

import SectionHeader from "@/components/SectionHeader";

const ITEMS = [
	{
		icon: faRecycle,
		title: "Réparer",
		text: "Collecte et valorisation des déchets plastiques, nettoyage des plages et des lagunes, plantation d'arbres.",
	},
	{
		icon: faShieldHalved,
		title: "Préserver",
		text: "Prévention des pollutions, protection des océans et de la biodiversité, promotion de l'économie circulaire.",
	},
	{
		icon: faPeopleGroup,
		title: "Partager",
		text: "Sensibilisation environnementale, formations Blue Academy et mobilisation des communautés.",
	},
	{
		icon: faHandshake,
		title: "Engagement",
		text: "Chaque bénévole, membre et partenaire s'engage concrètement sur le terrain.",
	},
	{
		icon: faLeaf,
		title: "Solidarité",
		text: "L'action collective est au cœur de notre approche : ensemble, nous allons plus loin.",
	},
	{
		icon: faScaleBalanced,
		title: "Transparence",
		text: "Des actions mesurables, une gestion responsable et une redevabilité envers nos communautés.",
	},
];

export default function AxesSection() {
	return (
		<section className="py-20 md:py-28 bg-[#f4f9fd]">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow="Mission & Valeurs"
					title="Nos axes d'intervention"
					description="Trois objectifs guident toutes nos actions — réparer, préserver et partager — portés par des valeurs fortes."
				/>
				<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{ITEMS.map((item, i) => (
						<motion.div
							key={item.title}
							className="bg-white rounded-2xl border border-[#0D6EBB]/10 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-60px" }}
							transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}>
							<span className="inline-flex w-12 h-12 rounded-xl bg-[#0D6EBB]/10 text-[#0D6EBB] items-center justify-center text-xl group-hover:bg-[#0D6EBB] group-hover:text-white transition-colors duration-300">
								<FontAwesomeIcon icon={item.icon} />
							</span>
							<h3 className="mt-5 text-lg font-bold text-[#073A63]">{item.title}</h3>
							<p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.text}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

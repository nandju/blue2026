"use client";
import Hr from "@/components/Hr";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const experiences = [
	{
		id: 1,
		startDate: "Jan 2022",
		endDate: "Présent",
		company: "RECYCL'DAY",
		position: "Événement de Collecte",
		type: "Récurrent",
		location: "Abidjan, Côte d'Ivoire",
		description:
			"Organisation de plusieurs éditions de RECYCL'DAY mobilisant des centaines de bénévoles pour nettoyer les plages, lagunes et espaces publics. Collecte de tonnes de déchets plastiques et sensibilisation de milliers de citoyens aux enjeux environnementaux.",
		skills: ["Mobilisation Communautaire", "Collecte de Déchets", "Sensibilisation", "Gestion d'Événements", "Éducation Environnementale"],
	},
	{
		id: 2,
		startDate: "Juin 2024",
		endDate: "Présent",
		company: "Journée Mondiale des Océans",
		position: "Événement Annuel",
		type: "Annuel",
		location: "Abidjan, Côte d'Ivoire",
		description:
			"Célébration annuelle de la Journée Mondiale des Océans avec des ateliers éducatifs dans les écoles, des conférences sur la pollution plastique marine et des actions de nettoyage massives. Collaboration avec des scientifiques et experts pour sensibiliser le public aux enjeux océaniques.",
		skills: [
			"Protection Marine",
			"Éducation",
			"Conférences",
			"Partenariats Scientifiques",
			"Sensibilisation",
		],
	},
	{
		id: 3,
		startDate: "Mars 2023",
		endDate: "Présent",
		company: "One BLUE Maker, One Tree",
		position: "Programme de Reforestation",
		type: "Continu",
		location: "Côte d'Ivoire",
		description:
			"Initiative de reforestation visant à planter un arbre pour chaque bénévole actif de BLUE. Organisation de sessions de plantation dans différentes régions avec géolocalisation et suivi de croissance. Sensibilisation à l'importance des forêts pour la biodiversité et le climat.",
		skills: ["Reforestation", "Géolocalisation", "Suivi Environnemental", "Biodiversité", "Action Climatique"],
	},
	{
		id: 4,
		startDate: "Sept 2023",
		endDate: "Présent",
		company: "BLUE Academy",
		position: "Plateforme de Formation",
		type: "En ligne",
		location: "Côte d'Ivoire & International",
		description:
			"Développement et gestion de notre plateforme de formation en ligne dédiée à l'éducation environnementale. Création de modules éducatifs sur la pollution plastique, le recyclage et le développement durable avec quiz interactifs et certificats numériques.",
		skills: ["Formation en Ligne", "E-learning", "Certification", "Éducation Environnementale", "Contenu Pédagogique"],
	},
	{
		id: 5,
		startDate: "Fév 2023",
		endDate: "Présent",
		company: "Recyclage Créatif",
		position: "Atelier de Transformation",
		type: "Permanent",
		location: "Abidjan, Côte d'Ivoire",
		description:
			"Transformation des déchets plastiques collectés en objets utiles et artistiques. Formation des participants aux techniques de recyclage créatif pour créer accessoires, objets de décoration et produits du quotidien. Vente des créations via BLUE Shop pour financer nos activités.",
		skills: [
			"Recyclage Créatif",
			"Économie Circulaire",
			"Artisanat",
			"Formation Pratique",
			"Innovation",
			"Entrepreneuriat Social",
		],
	},
];

experiences.reverse();

function Title() {
	return (
		<div className="mt-16 flex flex-col justify-start items-center w-full pl-10 md:pl-32">
			<div className="flex justify-center items-center flex-col my-5 self-start">
				<Hr variant="long"></Hr>
				<motion.h1
					className="text-3xl font-bold mt-3"
					initial={{
						opacity: 0,
						x: -200,
					}}
					whileInView={{
						opacity: 1,
						x: 0,
					}}
					transition={{
						delay: 0.7,
						type: "spring",
					}}>
					Nos Réalisations
				</motion.h1>
			</div>
		</div>
	);
}

function TimelineCard({ experience, index, isEven }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.15, duration: 0.5 }}
			className={`flex ps-10 md:ps-0 ${
				isEven
					? "md:justify-center md:translate-x-68"
					: "md:justify-center md:-translate-x-68"
			} justify-center mb-4`}>
			<div className="bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F] text-white px-12 py-3 rounded-xl shadow-lg border border-[#0D6EBB] min-w-max">
				<div className="flex items-center justify-center gap-6">
					<div className="text-center">
						<div className="text-sm font-bold">{experience.startDate}</div>
						<div className="text-xs text-gray-300">Début</div>
					</div>
					<div className="w-px h-8 bg-gray-500"></div>
					<div className="text-center">
						<div className="text-sm font-bold">{experience.endDate}</div>
						<div className="text-xs text-gray-300">Fin</div>
					</div>					<div className="w-px h-8 bg-gray-500"></div>
					<div className="text-center">
						<div className="text-sm font-medium text-gray-400">
							{experience.location}
						</div>
						<div className="text-xs text-gray-300">Lieu</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

function ExperienceCard({ experience, index, isEven }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.2, duration: 0.6 }}
			className={`relative group ${
				isEven ? "md:ml-auto md:pl-12" : "md:mr-auto md:pr-12"
			} md:w-1/2`}>
			{" "}
			{/* Card */}
			<div
				className={`bg-white/20 backdrop-blur-sm border border-[#0D6EBB]/30 rounded-2xl p-6 shadow-lg 
				hover:shadow-xl hover:bg-white/30 transition-all duration-300 ml-12 md:ml-0`}>
				{/* Company & Position */}
				<div className="mb-4">
					<h3 className="font-bold text-xl text-black mb-1">
						{experience.company}
					</h3>
					<h4 className="font-medium text-lg text-gray-700">
						{experience.position}
						<span className="text-sm font-normal text-gray-500 ml-2">
							• {experience.type}
						</span>
					</h4>
				</div>

				{/* Description */}
				<p className="text-gray-600 text-justify leading-relaxed mb-4">
					{experience.description}
				</p>

				{/* Skills */}
				<div className="flex flex-wrap gap-2">
					{experience.skills.map((skill, idx) => (
						<span
							key={idx}
							className="bg-gray-200/60 hover:bg-gray-300/60 border border-gray-400/40 text-black px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm hover:scale-105">
							{skill}
						</span>
					))}
				</div>
			</div>
		</motion.div>
	);
}

function Wrapper({ children }) {
	return (
		<div className="mx-auto container px-6 py-10">
			<div
				className="flex justify-center items-center flex-col">
				{children}
			</div>
		</div>
	);
}

export default function Experience() {
	const [showAll, setShowAll] = useState(false);
	const displayedExperiences = showAll ? experiences : experiences.slice(0, 3);

	return (
		<>
			<Title />
			<Wrapper>
				{" "}
				<div className="relative w-full max-w-6xl mx-auto">
					{" "}
					{/* Timeline line - hidden on mobile, visible on md+ */}
					<div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-[#0D6EBB] via-[#0DBD9F] to-transparent h-full"></div>
					{/* Mobile timeline line */}
					<div className="md:hidden absolute left-0 w-1 bg-gradient-to-b from-[#0D6EBB] via-[#0DBD9F] to-transparent h-full"></div>{" "}
					{/* Experience cards */}
					<div className="space-y-12 md:space-y-16 relative">
						<AnimatePresence>
							{displayedExperiences.map((experience, index) => (
								<div key={experience.id} className="relative">
									{/* Timeline period card - flows naturally above content */}
									<TimelineCard
										experience={experience}
										index={index}
										isEven={index % 2 === 1}
									/>

									{/* Timeline dot - positioned at the start of the experience card */}
									<div
										className={`absolute w-6 h-6 bg-[#0D6EBB] rounded-full border-4 border-white shadow-lg z-30
										md:left-1/2 md:-translate-x-1/2 md:top-4
										left-0 -translate-x-1/2 top-5`}
									/>

									{/* Experience content card */}
									<ExperienceCard
										experience={experience}
										index={index}
										isEven={index % 2 === 1}
									/>
								</div>
							))}
						</AnimatePresence>
					</div>
					{/* Expand/Collapse button */}
					{experiences.length > 3 && (
						<motion.div
							className="flex justify-center mt-12"
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							transition={{ delay: 0.5 }}>
							<button
								onClick={() => setShowAll(!showAll)}
								className="bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white px-8 py-3 rounded-full font-medium 
									transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2">
								{showAll ? (
									<>
										Moins
										<svg
											className="w-4 h-4 transform rotate-180"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</>
								) : (
									<>
										Voir Plus de Réalisations
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</>
								)}
							</button>
						</motion.div>
					)}{" "}
					{/* Gradient fade effect at bottom */}
					{!showAll && (
						<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stale-300 to-transparent pointer-events-none"></div>
					)}
				</div>
			</Wrapper>
		</>
	);
}

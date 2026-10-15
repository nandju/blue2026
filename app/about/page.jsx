"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faRecycle,
	faShieldHalved,
	faPeopleGroup,
	faBullseye,
	faEye,
	faHeart,
	faHandshake,
	faLeaf,
	faScaleBalanced,
	faRotate,
} from "@fortawesome/free-solid-svg-icons";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";

import HeroImg from "@/public/ong_blue/images/illustrations/page-landing/community-cleanup-volunteers-beach.jpg";
import StoryImg from "@/public/ong_blue/images/illustrations/page-landing/action_1.jpg";
import StoryImg2 from "@/public/ong_blue/images/illustrations/page-accueil/ite-3.jpg";

const AXES = [
	{
		icon: faRecycle,
		title: "Réparer",
		text: "Collecte de déchets plastiques, nettoyage des plages et des lagunes, plantation d'arbres pour restaurer les écosystèmes.",
	},
	{
		icon: faShieldHalved,
		title: "Préserver",
		text: "Prévention des pollutions, protection des océans et promotion des pratiques durables au quotidien.",
	},
	{
		icon: faPeopleGroup,
		title: "Partager",
		text: "Sensibilisation environnementale, formation des communautés et transmission des savoirs via Blue Academy.",
	},
];

const VALUES = [
	{ icon: faHandshake, name: "Engagement" },
	{ icon: faHeart, name: "Solidarité" },
	{ icon: faShieldHalved, name: "Protection" },
	{ icon: faScaleBalanced, name: "Transparence" },
	{ icon: faRotate, name: "Restauration" },
];

const TIMELINE = [
	{
		year: "Jan 2022",
		title: "Création de BLUE",
		text: "Fondation de l'ONG à Abidjan, Côte d'Ivoire, avec la mission de créer des citoyens engagés pour la protection de l'environnement.",
	},
	{
		year: "2022",
		title: "Premières actions de terrain",
		text: "Organisation des premières collectes de déchets plastiques et nettoyages de plages avec les premiers bénévoles BLUE Makers.",
	},
	{
		year: "2023",
		title: "Lancement des programmes phares",
		text: "RECYCL'DAY, One BLUE Maker One Tree, ateliers de recyclage créatif et lancement de la plateforme de formation Blue Academy.",
	},
	{
		year: "2024",
		title: "Mobilisation à grande échelle",
		text: "Multiplication des éditions de RECYCL'DAY, célébration de la Journée Mondiale des Océans et campagnes de sensibilisation scolaire.",
	},
	{
		year: "Aujourd'hui",
		title: "Une communauté qui grandit",
		text: "BLUE poursuit sa mission avec un réseau de bénévoles organisés par zones à Abidjan et dans l'intérieur du pays, et le développement de Blue Academy.",
	},
];

const TEAM = [
	{ name: "Jesus Aka", role: "Président" },
	{ name: "N'Dri", role: "Vice-Présidente" },
	{ name: "Jean M. Yeboue", role: "Secrétaire Général" },
	{ name: "Anah Toure", role: "Trésorière" },
];

export default function AboutPage() {
	return (
		<main className="overflow-x-hidden">
			<PageHero
				image={HeroImg}
				eyebrow="À propos de BLUE"
				title="Une ONG ivoirienne engagée pour la planète"
				description="Fondée en janvier 2022 à Abidjan, BLUE lutte contre la pollution plastique et forme des ambassadeurs de l'environnement à travers la Côte d'Ivoire.">
				<HeroButton href="/benevolat">Rejoindre le mouvement</HeroButton>
				<HeroButton href="/projects" variant="secondary">Voir nos actions</HeroButton>
			</PageHero>

			{/* Histoire */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.7 }}>
						<span className="text-[#0DBD9F] text-xs md:text-sm font-bold uppercase tracking-[0.3em]">
							Notre histoire
						</span>
						<h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#073A63] leading-tight">
							Née à Abidjan, tournée vers l&apos;océan
						</h2>
						<div className="mt-6 space-y-4 text-gray-600 text-base md:text-lg leading-relaxed">
							<p>
								BLUE — <strong className="text-[#073A63]">Blue Makers</strong> — est une
								organisation non gouvernementale créée en janvier 2022 à Abidjan.
								Face à l&apos;envahissement des plages, des lagunes et des quartiers
								par les déchets plastiques, un groupe de citoyens engagés a décidé
								d&apos;agir.
							</p>
							<p>
								Notre mission : créer des citoyens engagés pour la protection de
								l&apos;environnement, la réduction de l&apos;empreinte écologique des
								populations et la lutte contre la pollution plastique. Nous agissons
								sur le terrain — collectes, nettoyages, plantations d&apos;arbres —
								et par l&apos;éducation, avec notre plateforme Blue Academy.
							</p>
						</div>
					</motion.div>
					<motion.div
						className="relative"
						initial={{ opacity: 0, x: 40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.7 }}>
						<div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
							<Image src={StoryImg} alt="Action de terrain de BLUE" fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" placeholder="blur" />
						</div>
						<div className="absolute -bottom-6 -left-6 w-36 md:w-48 aspect-square rounded-2xl overflow-hidden border-8 border-white shadow-xl hidden sm:block">
							<Image src={StoryImg2} alt="Bénévoles BLUE" fill sizes="200px" className="object-cover" placeholder="blur" />
						</div>
					</motion.div>
				</div>
			</section>

			{/* Mission / Vision */}
			<section className="py-20 md:py-24 bg-[#f4f9fd]">
				<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
					{[
						{
							icon: faBullseye,
							title: "Notre Mission",
							text: "Créer des citoyens engagés pour la protection de l'environnement, la réduction de l'empreinte environnementale des populations et la lutte contre la pollution plastique.",
						},
						{
							icon: faEye,
							title: "Notre Vision",
							text: "Bâtir une Côte d'Ivoire où chaque citoyen devient acteur de la protection de l'environnement, pour des océans propres et des générations futures épanouies.",
						},
					].map((c, i) => (
						<motion.div
							key={c.title}
							className="bg-white rounded-3xl border border-[#0D6EBB]/10 p-8 md:p-10 shadow-sm"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.12, duration: 0.6 }}>
							<span className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white items-center justify-center text-2xl shadow-md">
								<FontAwesomeIcon icon={c.icon} />
							</span>
							<h3 className="mt-6 text-2xl font-bold text-[#073A63]">{c.title}</h3>
							<p className="mt-3 text-gray-600 leading-relaxed">{c.text}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Axes */}
			<section className="py-20 md:py-28 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Méthode d'action"
						title="Réparer, Préserver, Partager"
						description="Trois objectifs structurent l'ensemble des programmes et actions menés par BLUE sur le terrain."
					/>
					<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
						{AXES.map((a, i) => (
							<motion.div
								key={a.title}
								className="rounded-3xl bg-gradient-to-b from-white to-[#f4f9fd] border border-[#0D6EBB]/10 p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.1, duration: 0.5 }}>
								<span className="inline-flex w-16 h-16 rounded-full bg-[#0D6EBB]/10 text-[#0D6EBB] items-center justify-center text-2xl">
									<FontAwesomeIcon icon={a.icon} />
								</span>
								<h3 className="mt-5 text-xl font-bold text-[#073A63]">{a.title}</h3>
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
						{VALUES.map((v) => (
							<span
								key={v.name}
								className="inline-flex items-center gap-2 rounded-full border border-[#0D6EBB]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#073A63]">
								<FontAwesomeIcon icon={v.icon} className="text-[#0DBD9F]" />
								{v.name}
							</span>
						))}
					</motion.div>
				</div>
			</section>

			{/* Chronologie */}
			<section className="py-20 md:py-28 bg-[#062E52]">
				<div className="mx-auto max-w-5xl px-6 md:px-8">
					<SectionHeader
						eyebrow="Chronologie"
						title="Les grandes étapes de BLUE"
						dark
					/>
					<div className="mt-14 relative">
						<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/15 md:-translate-x-1/2" />
						{TIMELINE.map((t, i) => (
							<motion.div
								key={t.title}
								className={`relative flex md:w-1/2 mb-10 ${i % 2 === 0 ? "md:pr-12 md:justify-end" : "md:ml-auto md:pl-12"} pl-12 md:pl-0`}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ duration: 0.5 }}>
								<span className={`absolute top-1 w-4 h-4 rounded-full bg-[#0DBD9F] border-4 border-[#062E52] left-[9px] md:left-auto ${i % 2 === 0 ? "md:-right-2" : "md:-left-2"}`} />
								<div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:max-w-md">
									<span className="text-[#0DBD9F] text-xs font-bold uppercase tracking-[0.25em]">{t.year}</span>
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
						eyebrow="Gouvernance"
						title="Notre équipe dirigeante"
						description="Un bureau engagé qui coordonne les actions de BLUE sur l'ensemble du territoire."
					/>
					<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{TEAM.map((m, i) => (
							<motion.div
								key={m.name}
								className="bg-[#f4f9fd] rounded-3xl border border-[#0D6EBB]/10 p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ delay: i * 0.08, duration: 0.5 }}>
								<span className="mx-auto flex w-20 h-20 rounded-full bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white items-center justify-center text-2xl font-extrabold shadow-md">
									{m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
								</span>
								<h3 className="mt-5 text-lg font-bold text-[#073A63]">{m.name}</h3>
								<p className="mt-1 text-sm text-[#0DBD9F] font-medium">{m.role}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20 bg-[#f4f9fd]">
				<div className="mx-auto max-w-4xl px-6 text-center">
					<motion.h2
						className="text-3xl md:text-4xl font-bold text-[#073A63]"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}>
						Envie de contribuer à la mission ?
					</motion.h2>
					<p className="mt-4 text-gray-600">
						Bénévole, partenaire ou apprenant : il existe une place pour vous chez BLUE.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-4">
						<Link href="/benevolat" className="rounded-full bg-[#0D6EBB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#0DBD9F] transition-colors">
							Devenir bénévole
						</Link>
						<Link href="/partenaires" className="rounded-full border-2 border-[#0D6EBB] px-8 py-3.5 text-sm font-semibold text-[#0D6EBB] hover:bg-[#0D6EBB] hover:text-white transition-colors">
							Devenir partenaire
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}

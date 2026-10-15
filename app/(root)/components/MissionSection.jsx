"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faEye } from "@fortawesome/free-solid-svg-icons";

import Img from "@/public/ong_blue/images/illustrations/page-landing/community-cleanup-volunteers-beach.jpg";
import Img2 from "@/public/ong_blue/images/illustrations/page-landing/action_3.jpg";

const FEATURES = [
	{
		icon: faBullseye,
		title: "Notre mission",
		text: "Créer des citoyens engagés pour la protection de l'environnement, la réduction de l'empreinte écologique et la lutte contre la pollution plastique.",
	},
	{
		icon: faEye,
		title: "Notre vision",
		text: "Une Côte d'Ivoire où chaque communauté agit pour un environnement sain, des océans préservés et un avenir durable.",
	},
];

export default function MissionSection() {
	return (
		<section id="about" className="py-20 md:py-28 bg-white scroll-mt-20">
			<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
				{/* Images */}
				<motion.div
					className="relative"
					initial={{ opacity: 0, x: -50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7 }}>
					<div className="relative aspect-[4/5] max-w-md rounded-3xl overflow-hidden shadow-2xl">
						<Image src={Img} alt="Bénévoles BLUE lors d'un nettoyage de plage" fill sizes="(max-width: 1024px) 90vw, 40vw" className="object-cover" placeholder="blur" />
					</div>
					<motion.div
						className="absolute -bottom-8 -right-2 md:right-6 w-40 md:w-52 aspect-square rounded-2xl overflow-hidden border-8 border-white shadow-xl"
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.3, duration: 0.6 }}>
						<Image src={Img2} alt="Action de terrain BLUE" fill sizes="220px" className="object-cover" placeholder="blur" />
					</motion.div>
					<div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl bg-[#0DBD9F]/15 -z-10" />
				</motion.div>

				{/* Text */}
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.7 }}>
					<span className="text-[#0DBD9F] text-xs md:text-sm font-bold uppercase tracking-[0.3em]">
						Qui sommes-nous
					</span>
					<h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#073A63] leading-tight">
						BLUE, au service de la planète
					</h2>
					<p className="mt-6 text-gray-600 text-base md:text-lg leading-relaxed">
						BLUE est une organisation non gouvernementale fondée en janvier 2022 à
						Abidjan. Nous organisons des collectes de déchets plastiques, des
						nettoyages de plages et de lagunes, des plantations d&apos;arbres et des
						campagnes de sensibilisation pour réduire l&apos;empreinte
						environnementale des populations.
					</p>

					<div className="mt-8 space-y-5">
						{FEATURES.map((f, i) => (
							<motion.div
								key={f.title}
								className="flex gap-4 items-start"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.15 * i, duration: 0.5 }}>
								<span className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] text-white flex items-center justify-center shadow-md">
									<FontAwesomeIcon icon={f.icon} />
								</span>
								<div>
									<h3 className="font-bold text-[#073A63]">{f.title}</h3>
									<p className="text-sm text-gray-600 leading-relaxed mt-1">{f.text}</p>
								</div>
							</motion.div>
						))}
					</div>

					<Link
						href="/about"
						className="mt-8 inline-block rounded-full bg-[#0D6EBB] px-7 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#0DBD9F] transition-colors duration-300">
						Notre histoire →
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
